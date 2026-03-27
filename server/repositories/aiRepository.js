import { query } from '../db/client.js';
import {
  buildUpdateClause,
  createId,
  mapAutomation,
  mapSuggestion,
  mapUserAction,
} from './helpers.js';

const suggestionUpdateFields = {
  accepted: { column: 'accepted' },
  status: { column: 'status' },
  respondedAt: { column: 'responded_at' },
  title: { column: 'title' },
  message: { column: 'message' },
  priority: { column: 'priority' },
  availableAt: { column: 'available_at' },
  context: {
    column: 'context_data',
    cast: 'jsonb',
    transform: (value) => JSON.stringify(value),
  },
  automationPayload: {
    column: 'automation_payload',
    cast: 'jsonb',
    transform: (value) => (value === null ? null : JSON.stringify(value)),
  },
  sourceAutomation: { column: 'source_automation_id' },
};

export const createUserAction = async ({
  workspaceId,
  userId,
  module,
  actionType,
  metadata,
  timestamp,
}) => {
  const { rows } = await query(
    `
      INSERT INTO user_actions (id, workspace_id, user_id, module, action_type, metadata, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
      RETURNING *
    `,
    [
      createId(),
      workspaceId || null,
      userId,
      module,
      actionType,
      JSON.stringify(metadata),
      timestamp,
    ],
  );

  return mapUserAction(rows[0]);
};

export const listUserActions = async ({ userId, actionType, since, limit, normalizedMessage }) => {
  const params = [userId];
  const conditions = ['user_id = $1'];

  if (actionType) {
    params.push(actionType);
    conditions.push(`action_type = $${params.length}`);
  }

  if (since) {
    params.push(since);
    conditions.push(`timestamp >= $${params.length}`);
  }

  if (normalizedMessage) {
    params.push(normalizedMessage);
    conditions.push(`metadata->>'normalizedMessage' = $${params.length}`);
  }

  let limitClause = '';
  if (limit) {
    params.push(limit);
    limitClause = `LIMIT $${params.length}`;
  }

  const { rows } = await query(
    `
      SELECT *
      FROM user_actions
      WHERE ${conditions.join(' AND ')}
      ORDER BY timestamp DESC
      ${limitClause}
    `,
    params,
  );

  return rows.map((row) => mapUserAction(row));
};

export const listDistinctUserIdsFromActionsSince = async (since) => {
  const { rows } = await query(
    `
      SELECT DISTINCT user_id
      FROM user_actions
      WHERE timestamp >= $1
    `,
    [since],
  );

  return rows.map((row) => row.user_id);
};

export const findActiveAutomationBySourceKey = async (userId, sourceKey) => {
  const { rows } = await query(
    `
      SELECT *
      FROM automations
      WHERE user_id = $1 AND source_key = $2 AND active = TRUE
      LIMIT 1
    `,
    [userId, sourceKey],
  );

  return rows[0] ? mapAutomation(rows[0]) : null;
};

export const findAutomationByIdAndUser = async (automationId, userId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM automations
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
    [automationId, userId],
  );

  return rows[0] ? mapAutomation(rows[0]) : null;
};

export const createAutomation = async ({
  workspaceId,
  userId,
  name,
  description,
  trigger,
  action,
  sourceSuggestion,
  sourceKey,
  active = true,
}) => {
  const { rows } = await query(
    `
      INSERT INTO automations (
        id,
        workspace_id,
        user_id,
        name,
        description,
        trigger_config,
        action_config,
        active,
        source_suggestion_id,
        source_key
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10)
      RETURNING *
    `,
    [
      createId(),
      workspaceId || null,
      userId,
      name,
      description,
      JSON.stringify(trigger),
      JSON.stringify(action),
      active,
      sourceSuggestion,
      sourceKey,
    ],
  );

  return mapAutomation(rows[0]);
};

export const listAutomationsByUser = async (userId, { activeOnly = false } = {}) => {
  const params = [userId];
  const whereClause = activeOnly ? 'WHERE user_id = $1 AND active = TRUE' : 'WHERE user_id = $1';

  const { rows } = await query(
    `
      SELECT *
      FROM automations
      ${whereClause}
      ORDER BY updated_at DESC
    `,
    params,
  );

  return rows.map((row) => mapAutomation(row));
};

export const listChatTemplateAutomations = async (userId, limit = 4) => {
  const { rows } = await query(
    `
      SELECT *
      FROM automations
      WHERE
        user_id = $1
        AND active = TRUE
        AND action_config->>'type' = 'surface_template'
        AND action_config->>'module' = 'chat'
      ORDER BY updated_at DESC
      LIMIT $2
    `,
    [userId, limit],
  );

  return rows.map((row) => mapAutomation(row));
};

export const countActiveAutomations = async (userId) => {
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM automations
      WHERE user_id = $1 AND active = TRUE
    `,
    [userId],
  );

  return rows[0]?.count || 0;
};

export const updateAutomationState = async (automationId, userId, payload) => {
  const fieldMap = {
    active: { column: 'active' },
    runsCount: { column: 'runs_count' },
    lastExecutedAt: { column: 'last_executed_at' },
  };
  const { clause, values } = buildUpdateClause(payload, fieldMap);

  if (!clause) {
    return findAutomationByIdAndUser(automationId, userId);
  }

  const { rows } = await query(
    `
      UPDATE automations
      SET ${clause}
      WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
      RETURNING *
    `,
    [...values, automationId, userId],
  );

  return rows[0] ? mapAutomation(rows[0]) : null;
};

export const touchAutomationExecution = async (automationId) => {
  const { rows } = await query(
    `
      UPDATE automations
      SET runs_count = runs_count + 1,
          last_executed_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [automationId],
  );

  return rows[0] ? mapAutomation(rows[0]) : null;
};

export const createSuggestion = async ({
  workspaceId,
  userId,
  module,
  type,
  title,
  message,
  priority = 1,
  context = {},
  dedupeKey = '',
  availableAt = new Date(),
  automationPayload = null,
  sourceAutomation = null,
}) => {
  const { rows } = await query(
    `
      INSERT INTO suggestions (
        id,
        workspace_id,
        user_id,
        module,
        type,
        title,
        message,
        priority,
        context_data,
        dedupe_key,
        available_at,
        automation_payload,
        source_automation_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12::jsonb, $13)
      RETURNING *
    `,
    [
      createId(),
      workspaceId || null,
      userId,
      module,
      type,
      title,
      message,
      priority,
      JSON.stringify(context),
      dedupeKey,
      availableAt,
      automationPayload ? JSON.stringify(automationPayload) : null,
      sourceAutomation,
    ],
  );

  return mapSuggestion(rows[0]);
};

export const findPendingSuggestionByDedupeKey = async (userId, dedupeKey) => {
  const { rows } = await query(
    `
      SELECT *
      FROM suggestions
      WHERE user_id = $1 AND dedupe_key = $2 AND status = 'pending'
      LIMIT 1
    `,
    [userId, dedupeKey],
  );

  return rows[0] ? mapSuggestion(rows[0]) : null;
};

export const updateSuggestionByIdAndUser = async (suggestionId, userId, payload) => {
  const { clause, values } = buildUpdateClause(payload, suggestionUpdateFields);

  if (!clause) {
    return findSuggestionByIdAndUser(suggestionId, userId);
  }

  const { rows } = await query(
    `
      UPDATE suggestions
      SET ${clause}
      WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
      RETURNING *
    `,
    [...values, suggestionId, userId],
  );

  return rows[0] ? mapSuggestion(rows[0]) : null;
};

export const findSuggestionByIdAndUser = async (suggestionId, userId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM suggestions
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
    [suggestionId, userId],
  );

  return rows[0] ? mapSuggestion(rows[0]) : null;
};

export const resolvePendingSuggestions = async (filter) => {
  const params = [];
  const conditions = ["status = 'pending'"];

  if (filter.userId) {
    params.push(filter.userId);
    conditions.push(`user_id = $${params.length}`);
  }

  if (filter.module) {
    params.push(filter.module);
    conditions.push(`module = $${params.length}`);
  }

  if (filter.type) {
    params.push(filter.type);
    conditions.push(`type = $${params.length}`);
  }

  if (filter.dedupeKey) {
    params.push(filter.dedupeKey);
    conditions.push(`dedupe_key = $${params.length}`);
  }

  await query(
    `
      UPDATE suggestions
      SET status = 'resolved'
      WHERE ${conditions.join(' AND ')}
    `,
    params,
  );
};

export const listVisibleSuggestions = async ({ userId, module }) => {
  const params = [userId];
  let moduleClause = '';

  if (module) {
    params.push(module);
    moduleClause = `AND module = $${params.length}`;
  }

  const { rows } = await query(
    `
      SELECT *
      FROM suggestions
      WHERE
        user_id = $1
        AND status = 'pending'
        AND available_at <= NOW()
        ${moduleClause}
      ORDER BY priority DESC, created_at DESC
    `,
    params,
  );

  return rows.map((row) => mapSuggestion(row));
};

export const countSuggestions = async ({ userId, statuses, pendingVisibleOnly = false }) => {
  const params = [userId];
  const conditions = ['user_id = $1'];

  if (statuses?.length) {
    params.push(statuses);
    conditions.push(`status = ANY($${params.length})`);
  }

  if (pendingVisibleOnly) {
    conditions.push(`available_at <= NOW()`);
  }

  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM suggestions
      WHERE ${conditions.join(' AND ')}
    `,
    params,
  );

  return rows[0]?.count || 0;
};
