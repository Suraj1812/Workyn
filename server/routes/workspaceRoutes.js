import express from 'express';

import {
  acceptWorkspaceInvitation,
  getWorkspaceOverview,
  inviteWorkspaceMember,
  switchWorkspace,
  updateWorkspace,
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles, requirePlan } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  invitationAcceptValidation,
  workspaceInviteValidation,
  workspaceSwitchValidation,
  workspaceUpdateValidation,
} from '../validators/index.js';

const router = express.Router();

router.use(protect);
router.get('/', getWorkspaceOverview);
router.post('/switch', workspaceSwitchValidation, validateRequest, switchWorkspace);
router.post(
  '/invites/:token/accept',
  invitationAcceptValidation,
  validateRequest,
  acceptWorkspaceInvitation,
);
router.post(
  '/invite',
  authorizeRoles('admin'),
  requirePlan('pro'),
  workspaceInviteValidation,
  validateRequest,
  inviteWorkspaceMember,
);
router.put(
  '/',
  authorizeRoles('admin'),
  workspaceUpdateValidation,
  validateRequest,
  updateWorkspace,
);

export default router;
