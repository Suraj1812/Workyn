import express from 'express';

import { getActivityTimeline } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { activityListValidation } from '../validators/index.js';

const router = express.Router();

router.use(protect);
router.get('/', activityListValidation, validateRequest, getActivityTimeline);

export default router;
