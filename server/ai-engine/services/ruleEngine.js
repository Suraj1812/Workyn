import {
  createAutomation,
  findActiveAutomationBySourceKey,
  listAutomationsByUser,
  touchAutomationExecution,
} from '../../repositories/aiRepository.js';
import { createSuggestion, upsertSuggestion } from './suggestionEngine.js';
import { addHours, fillTemplate, getDateKey, getNestedValue } from '../utils/normalizers.js';

const matchesEvent = (trigger, actionType) => {
  const configuredEvents = Array.isArray(trigger?.events)
    ? trigger.events
    : trigger?.event
      ? [trigger.event]
      : [];

  return configuredEvents.includes(actionType);
};

const buildAutomationDedupeKey = (automation, metadata, availableAt) => {
  const dateKey = getDateKey(availableAt);
  const contextKey = automation.action?.contextKey
    ? metadata?.[automation.action.contextKey]
    : metadata?.leadId || metadata?.patientId || metadata?.resumeId || 'global';

  return `automation:${automation._id}:${contextKey}:${dateKey}`;
};

const getAutomationAvailableAt = ({ automation, metadata, timestamp }) => {
  if (automation.action?.dateField) {
    const dateValue = getNestedValue(metadata, automation.action.dateField);

    if (dateValue) {
      return addHours(dateValue, -(automation.action.offsetHoursBefore || 0));
    }
  }

  if (automation.action?.fallbackDelayHours !== undefined) {
    return addHours(timestamp, automation.action.fallbackDelayHours);
  }

  return addHours(timestamp, automation.action?.delayHours || 0);
};

export const createAutomationFromSuggestion = async ({ userId, suggestion }) => {
  if (!suggestion?.automationPayload) {
    return null;
  }

  const payload = suggestion.automationPayload;

  const existingAutomation = payload.sourceKey
    ? await findActiveAutomationBySourceKey(userId, payload.sourceKey)
    : null;

  if (existingAutomation) {
    return existingAutomation;
  }

  return createAutomation({
    workspaceId: suggestion.workspaceId,
    userId,
    name: payload.name,
    description: payload.description || '',
    trigger: payload.trigger,
    action: payload.action,
    sourceSuggestion: suggestion._id,
    sourceKey: payload.sourceKey || suggestion.dedupeKey,
    active: true,
  });
};

export const executeTriggerAutomations = async ({
  workspaceId,
  userId,
  actionType,
  metadata = {},
  timestamp = new Date(),
}) => {
  const automations = await listAutomationsByUser(userId, {
    activeOnly: true,
  });

  await Promise.all(
    automations.map(async (automation) => {
      if (!matchesEvent(automation.trigger, actionType)) {
        return;
      }

      if (automation.action?.type === 'surface_template') {
        return;
      }

      const availableAt = getAutomationAvailableAt({
        automation,
        metadata,
        timestamp,
      });

      const suggestionPayload = {
        workspaceId,
        userId,
        module: automation.action?.module || 'dashboard',
        type: 'automation',
        title: automation.action?.title || automation.name,
        message: fillTemplate(automation.action?.messageTemplate, metadata),
        priority: automation.action?.priority ?? 2,
        context: {
          ...metadata,
          automationId: automation._id,
        },
        availableAt,
        sourceAutomation: automation._id,
      };

      const dedupeKey = buildAutomationDedupeKey(automation, metadata, availableAt);

      if (automation.action?.dedupeMode === 'always-create') {
        await createSuggestion({ ...suggestionPayload, dedupeKey });
      } else {
        await upsertSuggestion({ ...suggestionPayload, dedupeKey });
      }

      await touchAutomationExecution(automation._id);
    }),
  );
};
