import express from 'express';

import { createLead, deleteLead, getLeads, updateLead } from '../controllers/crmController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { leadListValidation, leadValidation, updateLeadValidation } from '../validators/index.js';

const router = express.Router();

router.use(protect);
router
  .route('/')
  .get(leadListValidation, validateRequest, getLeads)
  .post(leadValidation, validateRequest, createLead);
router
  .route('/:id')
  .put(updateLeadValidation, validateRequest, updateLead)
  .delete(updateLeadValidation, validateRequest, deleteLead);

export default router;
