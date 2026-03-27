import express from 'express';

import { globalSearch } from '../controllers/searchController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePlan } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { searchValidation } from '../validators/index.js';

const router = express.Router();

router.use(protect, requirePlan('pro'));
router.get('/', searchValidation, validateRequest, globalSearch);

export default router;
