import { randomUUID } from 'node:crypto';

import { findUserByEmail, setUserCurrentWorkspace } from '../repositories/usersRepository.js';
import {
  createWorkspaceInvitation,
  createWorkspaceMembership,
  findMembershipByUserAndWorkspace,
  findWorkspaceById,
  findWorkspaceInvitationByToken,
  listMembershipsByUser,
  listWorkspaceInvitations,
  listWorkspaceMembers,
  updateWorkspaceById,
  updateWorkspaceInvitation,
} from '../repositories/workspacesRepository.js';
import { recordActivity } from '../services/activityService.js';
import { sendWorkspaceInviteEmail } from '../services/emailService.js';
import { sendNotification } from '../services/notificationService.js';

export const getWorkspaceOverview = async (req, res, next) => {
  try {
    const [members, invitations, memberships] = await Promise.all([
      listWorkspaceMembers(req.workspace.id),
      listWorkspaceInvitations(req.workspace.id),
      listMembershipsByUser(req.user.id),
    ]);

    res.json({
      success: true,
      workspace: req.workspace,
      membership: req.membership,
      memberships,
      members,
      invitations,
    });
  } catch (error) {
    next(error);
  }
};

export const inviteWorkspaceMember = async (req, res, next) => {
  try {
    const existingUser = await findUserByEmail(req.body.email.toLowerCase());
    const token = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
    const invitation = await createWorkspaceInvitation({
      workspaceId: req.workspace.id,
      email: req.body.email.toLowerCase(),
      role: req.body.role || 'member',
      token,
      invitedBy: req.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const inviteUrl = `${
      process.env.CLIENT_URL || 'http://localhost:5173'
    }/team?inviteToken=${token}`;

    await sendWorkspaceInviteEmail({
      to: invitation.email,
      inviterName: req.user.name,
      workspaceName: req.workspace.name,
      inviteUrl,
    });

    if (existingUser) {
      await sendNotification({
        io: req.app.get('io'),
        workspaceId: req.workspace.id,
        userId: existingUser.id,
        type: 'workspace_invite',
        title: 'Workspace invitation',
        message: `${req.user.name} invited you to join ${req.workspace.name}.`,
        link: `/team?inviteToken=${token}`,
        metadata: {
          invitationId: invitation.id,
          token,
        },
      });
    }

    await recordActivity({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: 'team',
      action: 'team.invite_created',
      entityType: 'invitation',
      entityId: invitation.id,
      description: `${req.user.name} invited ${invitation.email} to the workspace.`,
      metadata: {
        role: invitation.role,
      },
    });

    res.status(201).json({
      success: true,
      invitation,
      inviteUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptWorkspaceInvitation = async (req, res, next) => {
  try {
    const invitation = await findWorkspaceInvitationByToken(req.params.token);

    if (!invitation || invitation.status !== 'pending') {
      res.status(404);
      throw new Error('Invitation not found.');
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      await updateWorkspaceInvitation(invitation.id, { status: 'expired' });
      res.status(410);
      throw new Error('Invitation has expired.');
    }

    if (invitation.email !== req.user.email) {
      res.status(403);
      throw new Error('This invitation belongs to another email address.');
    }

    const membership = await createWorkspaceMembership({
      workspaceId: invitation.workspaceId,
      userId: req.user.id,
      role: invitation.role,
    });

    await updateWorkspaceInvitation(invitation.id, {
      status: 'accepted',
      acceptedBy: req.user.id,
    });
    await setUserCurrentWorkspace(req.user.id, invitation.workspaceId);

    const workspace = await findWorkspaceById(invitation.workspaceId);

    await recordActivity({
      workspaceId: invitation.workspaceId,
      userId: req.user.id,
      module: 'team',
      action: 'team.invite_accepted',
      entityType: 'workspace',
      entityId: invitation.workspaceId,
      description: `${req.user.name} joined ${workspace?.name || 'the workspace'}.`,
    });

    res.json({
      success: true,
      membership,
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const switchWorkspace = async (req, res, next) => {
  try {
    const membership = await findMembershipByUserAndWorkspace(req.user.id, req.body.workspaceId);

    if (!membership || membership.status !== 'active') {
      res.status(404);
      throw new Error('Workspace not found.');
    }

    const user = await setUserCurrentWorkspace(req.user.id, req.body.workspaceId);
    const workspace = await findWorkspaceById(req.body.workspaceId);

    res.json({
      success: true,
      user,
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace = async (req, res, next) => {
  try {
    const workspace = await updateWorkspaceById(req.workspace.id, req.body);

    await recordActivity({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: 'team',
      action: 'workspace.updated',
      entityType: 'workspace',
      entityId: req.workspace.id,
      description: `${req.user.name} updated workspace settings.`,
    });

    res.json({
      success: true,
      workspace,
    });
  } catch (error) {
    next(error);
  }
};
