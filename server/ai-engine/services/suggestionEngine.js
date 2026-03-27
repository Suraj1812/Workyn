import {
  createSuggestion as createSuggestionRecord,
  findPendingSuggestionByDedupeKey,
  findSuggestionByIdAndUser,
  listVisibleSuggestions,
  resolvePendingSuggestions as resolvePendingSuggestionsInStore,
  updateSuggestionByIdAndUser,
} from '../../repositories/aiRepository.js';

export const createSuggestion = async (payload) => createSuggestionRecord(payload);

export const upsertSuggestion = async ({ workspaceId, userId, dedupeKey, ...payload }) => {
  if (!dedupeKey) {
    return createSuggestion({ workspaceId, userId, ...payload });
  }

  const existingSuggestion = await findPendingSuggestionByDedupeKey(userId, dedupeKey);

  if (existingSuggestion) {
    return updateSuggestionByIdAndUser(existingSuggestion._id, userId, {
      title: payload.title,
      message: payload.message,
      priority: payload.priority,
      context: payload.context || existingSuggestion.context,
      automationPayload:
        payload.automationPayload === undefined
          ? existingSuggestion.automationPayload
          : payload.automationPayload,
      sourceAutomation:
        payload.sourceAutomation === undefined
          ? existingSuggestion.sourceAutomation
          : payload.sourceAutomation,
      availableAt: payload.availableAt || existingSuggestion.availableAt,
    });
  }

  return createSuggestion({
    workspaceId,
    userId,
    dedupeKey,
    ...payload,
  });
};

export const resolvePendingSuggestions = async (filter) => resolvePendingSuggestionsInStore(filter);

export const getVisibleSuggestions = async ({ userId, module }) =>
  listVisibleSuggestions({
    userId,
    module,
  });

export const getSuggestionById = async ({ suggestionId, userId }) =>
  findSuggestionByIdAndUser(suggestionId, userId);
