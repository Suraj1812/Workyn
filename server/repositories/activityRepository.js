import { query } from '../db/client.js';
import { createId, mapActivityLog } from './helpers.js';

const activitySelect = `
  SELECT
    activity_logs.*,
    users.id AS actor_id,
    users.name AS actor_name,
    users.email AS actor_email
  FROM activity_logs
  INNER JOIN users ON users.id = activity_logs.user_id
`;

export const createActivityLog = async ({
  workspaceId,
  userId,
  module,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
}) => {
  const { rows } = await query(
    `
      INSERT INTO activity_logs (
        id,
        workspace_id,
        user_id,
        module,
        action,
        entity_type,
        entity_id,
        description,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
      RETURNING *
    `,
    [
      createId(),
      workspaceId,
      userId,
      module,
      action,
      entityType || null,
      entityId || null,
      description,
      JSON.stringify(metadata),
    ],
  );

  return mapActivityLog(rows[0]);
};

export const listActivityLogs = async ({ workspaceId, userId, module, limit = 25, offset = 0 }) => {
  const params = [];
  const conditions = [];

  if (workspaceId) {
    params.push(workspaceId);
    conditions.push(`activity_logs.workspace_id = $${params.length}`);
  }

  if (userId) {
    params.push(userId);
    conditions.push(`activity_logs.user_id = $${params.length}`);
  }

  if (module) {
    params.push(module);
    conditions.push(`activity_logs.module = $${params.length}`);
  }

  params.push(limit, offset);

  const { rows } = await query(
    `
      ${activitySelect}
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY activity_logs.created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `,
    params,
  );

  return rows.map((row) => mapActivityLog(row));
};

export const countActivityLogs = async ({ workspaceId, userId, module }) => {
  const params = [];
  const conditions = [];

  if (workspaceId) {
    params.push(workspaceId);
    conditions.push(`workspace_id = $${params.length}`);
  }

  if (userId) {
    params.push(userId);
    conditions.push(`user_id = $${params.length}`);
  }

  if (module) {
    params.push(module);
    conditions.push(`module = $${params.length}`);
  }

  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM activity_logs
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
    `,
    params,
  );

  return rows[0]?.count || 0;
};
