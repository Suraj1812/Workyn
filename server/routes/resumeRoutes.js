import express from 'express';

import { getResume, saveResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { resumeValidation } from '../validators/index.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getResume).post(resumeValidation, validateRequest, saveResume);

export default router;
