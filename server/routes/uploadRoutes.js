import express from 'express';

import { uploadFile, uploadMiddleware } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePlan } from '../middleware/roleMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { uploadValidation } from '../validators/index.js';

const router = express.Router();

router.use(protect, requirePlan('pro'));
router.post(
  '/',
  uploadLimiter,
  uploadMiddleware.single('file'),
  uploadValidation,
  validateRequest,
  uploadFile,
);

export default router;
