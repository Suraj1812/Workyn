import { getChatQuickReplies } from '../ai-engine/services/quickReplyEngine.js';
import {
  getSuggestionById,
  getVisibleSuggestions,
} from '../ai-engine/services/suggestionEngine.js';
import { createAutomationFromSuggestion } from '../ai-engine/services/ruleEngine.js';
import { processUserAction } from '../ai-engine/services/behaviorTracker.js';
import {
  countActiveAutomations,
  countSuggestions,
  findAutomationByIdAndUser,
  listAutomationsByUser,
  updateAutomationState,
  updateSuggestionByIdAndUser,
} from '../repositories/aiRepository.js';

export const getSuggestions = async (req, res, next) => {
  try {
    const suggestions = await getVisibleSuggestions({
      userId: req.user.id,
      module: req.query.module,
    });

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToSuggestion = async (req, res, next) => {
  try {
    const suggestion = await getSuggestionById({
      suggestionId: req.params.id,
      userId: req.user.id,
    });

    if (!suggestion) {
      res.status(404);
      throw new Error('Suggestion not found.');
    }

    const accepted = Boolean(req.body.accepted);
    let automation = null;

    if (accepted) {
      automation = await createAutomationFromSuggestion({
        userId: req.user.id,
        suggestion,
      });
    }

    const updatedSuggestion = await updateSuggestionByIdAndUser(suggestion._id, req.user.id, {
      accepted,
      status: accepted ? 'accepted' : 'rejected',
      respondedAt: new Date(),
    });

    await processUserAction({
      userId: req.user.id,
      workspaceId: req.workspace.id,
      module: 'ai',
      actionType: accepted ? 'ai.suggestion_accepted' : 'ai.suggestion_rejected',
      metadata: {
        suggestionId: suggestion._id.toString(),
        suggestionType: suggestion.type,
        suggestionModule: suggestion.module,
      },
    });

    res.json({
      success: true,
      suggestion: updatedSuggestion,
      automation,
    });
  } catch (error) {
    next(error);
  }
};

export const getAutomations = async (req, res, next) => {
  try {
    const automations = await listAutomationsByUser(req.user.id);

    res.json({
      success: true,
      automations,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAutomation = async (req, res, next) => {
  try {
    const automation = await findAutomationByIdAndUser(req.params.id, req.user.id);

    if (!automation) {
      res.status(404);
      throw new Error('Automation not found.');
    }

    const updatedAutomation = await updateAutomationState(req.params.id, req.user.id, {
      active: req.body.active !== undefined ? Boolean(req.body.active) : automation.active,
    });

    res.json({
      success: true,
      automation: updatedAutomation,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuickReplies = async (req, res, next) => {
  try {
    const { contactId } = req.query;

    if (!contactId) {
      res.status(400);
      throw new Error('contactId is required.');
    }

    const quickReplies = await getChatQuickReplies({
      userId: req.user.id,
      workspaceId: req.workspace.id,
      contactId,
    });

    res.json({
      success: true,
      quickReplies,
    });
  } catch (error) {
    next(error);
  }
};

export const getAiOverview = async (req, res, next) => {
  try {
    const [pendingSuggestions, automationCount, resolvedSuggestions] = await Promise.all([
      countSuggestions({
        userId: req.user.id,
        statuses: ['pending'],
        pendingVisibleOnly: true,
      }),
      countActiveAutomations(req.user.id),
      countSuggestions({
        userId: req.user.id,
        statuses: ['accepted', 'rejected'],
      }),
    ]);

    res.json({
      success: true,
      summary: {
        pendingSuggestions,
        activeAutomations: automationCount,
        reviewedSuggestions: resolvedSuggestions,
      },
    });
  } catch (error) {
    next(error);
  }
};
