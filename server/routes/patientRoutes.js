import express from 'express';

import { createPatient, getPatients, updatePatient } from '../controllers/patientController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getPatients).post(createPatient);
router.route('/:id').put(updatePatient);

export default router;
