import express from 'express';

import { getMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { listMessagesValidation, sendMessageValidation } from '../validators/index.js';

const router = express.Router();

router.use(protect);
router
  .route('/')
  .get(listMessagesValidation, validateRequest, getMessages)
  .post(sendMessageValidation, validateRequest, sendMessage);

export default router;
