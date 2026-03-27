import express from 'express';

import { getResume, saveResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getResume).post(saveResume);

export default router;
