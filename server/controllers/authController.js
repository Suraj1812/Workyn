import bcrypt from 'bcrypt';

import { withTransaction } from '../db/client.js';
import {
  createUser,
  findUserByEmail,
  setUserCurrentWorkspace,
  updateUserLastLogin,
} from '../repositories/usersRepository.js';
import {
  createWorkspace,
  createWorkspaceMembership,
  findWorkspaceBySlug,
  listMembershipsByUser,
} from '../repositories/workspacesRepository.js';
import { recordActivity } from '../services/activityService.js';
import { slugify } from '../services/sanitizer.js';
import { clearAuthCookie, generateToken, setAuthCookie } from '../utils/token.js';

const serializeUser = (user, { workspace, membership, memberships = [] } = {}) => ({
  id: user.id || user._id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl || null,
  role: membership?.role === 'admin' ? 'admin' : user.role || 'user',
  workspaceRole: membership?.role || 'member',
  currentWorkspace: workspace
    ? {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        plan: workspace.plan,
        subscriptionStatus: workspace.subscriptionStatus,
      }
    : null,
  memberships: memberships.map((item) => ({
    workspaceId: item.workspaceId,
    role: item.role,
    workspace: item.workspace,
  })),
  createdAt: user.createdAt,
});

const buildWorkspaceSlug = async (name) => {
  const base = slugify(name) || 'workspace';
  let candidate = `${base}-${Date.now().toString(36)}`;

  while (await findWorkspaceBySlug(candidate)) {
    candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }

  return candidate;
};

const buildAuthPayload = async (user, currentWorkspace, currentMembership) => {
  const memberships = await listMembershipsByUser(user.id || user._id);

  return serializeUser(user, {
    workspace: currentWorkspace || memberships[0]?.workspace || null,
    membership: currentMembership || memberships[0] || null,
    memberships,
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await findUserByEmail(normalizedEmail, {
      includePassword: true,
    });
    if (existingUser) {
      res.status(409);
      throw new Error('An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 12));
    const workspaceSlug = await buildWorkspaceSlug(name);

    const { user, workspace, membership } = await withTransaction(async (client) => {
      const createdUser = await createUser(
        {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: 'admin',
        },
        client,
      );

      const createdWorkspace = await createWorkspace(
        {
          name: `${name.split(' ')[0]}'s Workspace`,
          slug: workspaceSlug,
          ownerUserId: createdUser.id,
          billingEmail: normalizedEmail,
        },
        client,
      );

      const createdMembership = await createWorkspaceMembership(
        {
          workspaceId: createdWorkspace.id,
          userId: createdUser.id,
          role: 'admin',
        },
        client,
      );

      const updatedUser = await setUserCurrentWorkspace(
        createdUser.id,
        createdWorkspace.id,
        client,
      );

      return {
        user: updatedUser,
        workspace: createdWorkspace,
        membership: createdMembership,
      };
    });

    const token = generateToken(user.id);
    setAuthCookie(res, token);

    await recordActivity({
      workspaceId: workspace.id,
      userId: user.id,
      module: 'auth',
      action: 'auth.registered',
      entityType: 'workspace',
      entityId: workspace.id,
      description: `${user.name} created the workspace ${workspace.name}.`,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: await buildAuthPayload(user, workspace, membership),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const user = await findUserByEmail(normalizedEmail, {
      includePassword: true,
    });
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    const updatedUser = await updateUserLastLogin(user.id);
    const memberships = await listMembershipsByUser(updatedUser.id);
    const currentMembership =
      memberships.find((item) => item.workspaceId === updatedUser.currentWorkspaceId) ||
      memberships[0] ||
      null;

    const token = generateToken(updatedUser.id);
    setAuthCookie(res, token);

    if (currentMembership?.workspaceId) {
      await recordActivity({
        workspaceId: currentMembership.workspaceId,
        userId: updatedUser.id,
        module: 'auth',
        action: 'auth.logged_in',
        entityType: 'user',
        entityId: updatedUser.id,
        description: `${updatedUser.name} signed in.`,
      });
    }

    res.json({
      success: true,
      message: 'Login successful.',
      user: serializeUser(updatedUser, {
        workspace: currentMembership?.workspace || null,
        membership: currentMembership,
        memberships,
      }),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
};

export const getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    user: await buildAuthPayload(req.user, req.workspace, req.membership),
  });
};
