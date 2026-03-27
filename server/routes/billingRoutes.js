import express from 'express';

import { createCheckoutSession, getBillingOverview } from '../controllers/billingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { billingCheckoutValidation } from '../validators/index.js';

const router = express.Router();

router.use(protect);
router.get('/', getBillingOverview);
router.post(
  '/checkout',
  authorizeRoles('admin'),
  billingCheckoutValidation,
  validateRequest,
  createCheckoutSession,
);

export default router;
