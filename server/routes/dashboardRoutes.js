import express from 'express';

import { getDashboardAnalytics, getDashboardSummary } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePlan } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getDashboardSummary);
router.get('/analytics', requirePlan('pro'), getDashboardAnalytics);

export default router;
