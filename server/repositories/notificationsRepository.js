import { query } from '../db/client.js';
import { buildUpdateClause, createId, mapNotification } from './helpers.js';

const notificationUpdateFields = {
  isRead: { column: 'is_read' },
  readAt: { column: 'read_at' },
};

export const createNotification = async ({
  workspaceId,
  userId,
  type,
  title,
  message,
  link,
  metadata = {},
}) => {
  const { rows } = await query(
    `
      INSERT INTO notifications (id, workspace_id, user_id, type, title, message, link, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      RETURNING *
    `,
    [createId(), workspaceId, userId, type, title, message, link || null, JSON.stringify(metadata)],
  );

  return mapNotification(rows[0]);
};

export const listNotificationsByUser = async (
  userId,
  { limit = 20, offset = 0, unreadOnly = false } = {},
) => {
  const params = [userId];
  const unreadClause = unreadOnly ? 'AND is_read = FALSE' : '';
  params.push(limit, offset);

  const { rows } = await query(
    `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ${unreadClause}
      ORDER BY created_at DESC
      LIMIT $2
      OFFSET $3
    `,
    params,
  );

  return rows.map((row) => mapNotification(row));
};

export const countUnreadNotifications = async (userId) => {
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM notifications
      WHERE user_id = $1 AND is_read = FALSE
    `,
    [userId],
  );

  return rows[0]?.count || 0;
};

export const markNotificationAsRead = async (notificationId, userId) => {
  const { rows } = await query(
    `
      UPDATE notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `,
    [notificationId, userId],
  );

  return rows[0] ? mapNotification(rows[0]) : null;
};

export const markAllNotificationsRead = async (userId) => {
  const { rows } = await query(
    `
      UPDATE notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE user_id = $1 AND is_read = FALSE
      RETURNING *
    `,
    [userId],
  );

  return rows.map((row) => mapNotification(row));
};

export const updateNotification = async (notificationId, userId, payload) => {
  const { clause, values } = buildUpdateClause(payload, notificationUpdateFields);

  if (!clause) {
    return null;
  }

  const { rows } = await query(
    `
      UPDATE notifications
      SET ${clause}
      WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}
      RETURNING *
    `,
    [...values, notificationId, userId],
  );

  return rows[0] ? mapNotification(rows[0]) : null;
};
