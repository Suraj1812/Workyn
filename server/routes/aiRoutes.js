import express from 'express';

import {
  getAiOverview,
  getAutomations,
  getQuickReplies,
  getSuggestions,
  respondToSuggestion,
  updateAutomation,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/overview', getAiOverview);
router.get('/suggestions', getSuggestions);
router.post('/suggestions/:id/respond', respondToSuggestion);
router.get('/automations', getAutomations);
router.put('/automations/:id', updateAutomation);
router.get('/chat/quick-replies', getQuickReplies);

export default router;
