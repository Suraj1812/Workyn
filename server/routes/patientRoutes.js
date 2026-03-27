import express from 'express';

import { createPatient, getPatients, updatePatient } from '../controllers/patientController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  patientListValidation,
  patientValidation,
  updatePatientValidation,
} from '../validators/index.js';

const router = express.Router();

router.use(protect);
router
  .route('/')
  .get(patientListValidation, validateRequest, getPatients)
  .post(patientValidation, validateRequest, createPatient);
router.route('/:id').put(updatePatientValidation, validateRequest, updatePatient);

export default router;
