import jwt from 'jsonwebtoken';

import { findUserById, setUserCurrentWorkspace } from '../repositories/usersRepository.js';
import {
  findMembershipByUserAndWorkspace,
  findWorkspaceById,
  listMembershipsByUser,
} from '../repositories/workspacesRepository.js';

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  return req.cookies?.[process.env.COOKIE_NAME || 'workyn_token'] || bearerToken;
};

export const protect = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    let memberships = await listMembershipsByUser(user.id);
    let membership =
      user.currentWorkspaceId &&
      (await findMembershipByUserAndWorkspace(user.id, user.currentWorkspaceId));
    let workspace =
      user.currentWorkspaceId && membership
        ? membership.workspace || (await findWorkspaceById(user.currentWorkspaceId))
        : null;

    if (!membership || !workspace) {
      membership = memberships[0] || null;
      workspace = membership?.workspace || null;

      if (membership?.workspaceId && membership.workspaceId !== user.currentWorkspaceId) {
        user = await setUserCurrentWorkspace(user.id, membership.workspaceId);
      }
    }

    if (!membership || !workspace) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to an active workspace.',
      });
    }

    req.user = user;
    req.workspace = workspace;
    req.membership = membership;
    req.memberships = memberships;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
