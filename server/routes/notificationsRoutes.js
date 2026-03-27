import express from 'express';

import {
  getNotifications,
  markNotificationRead,
  markNotificationsRead,
} from '../controllers/notificationsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { notificationListValidation, notificationParamValidation } from '../validators/index.js';

const router = express.Router();

router.use(protect);
router.get('/', notificationListValidation, validateRequest, getNotifications);
router.post('/read-all', markNotificationsRead);
router.post('/:id/read', notificationParamValidation, validateRequest, markNotificationRead);

export default router;
