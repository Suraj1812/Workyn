import express from 'express';

import { getCurrentUser, login, logout, register } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { loginValidation, registerValidation } from '../validators/index.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validateRequest, register);
router.post('/login', authLimiter, loginValidation, validateRequest, login);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);

export default router;
