import { query } from '../db/client.js';
import { createId, mapChat } from './helpers.js';

const chatSelect = `
  SELECT
    chats.*,
    sender.id AS sender_id,
    sender.name AS sender_name,
    sender.email AS sender_email,
    receiver.id AS receiver_id,
    receiver.name AS receiver_name,
    receiver.email AS receiver_email
  FROM chats
  INNER JOIN users AS sender ON sender.id = chats.sender_id
  INNER JOIN users AS receiver ON receiver.id = chats.receiver_id
`;

export const createChat = async ({
  workspaceId,
  senderId,
  receiverId,
  message,
  messageType = 'text',
  attachment = null,
  timestamp = new Date(),
}) => {
  const { rows } = await query(
    `
      INSERT INTO chats (
        id,
        workspace_id,
        sender_id,
        receiver_id,
        message,
        message_type,
        attachment,
        timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
      RETURNING id
    `,
    [
      createId(),
      workspaceId,
      senderId,
      receiverId,
      message,
      messageType,
      attachment ? JSON.stringify(attachment) : null,
      timestamp,
    ],
  );

  return findChatById(rows[0].id);
};

export const findChatById = async (chatId) => {
  const { rows } = await query(
    `
      ${chatSelect}
      WHERE chats.id = $1
      LIMIT 1
    `,
    [chatId],
  );

  return rows[0] ? mapChat(rows[0]) : null;
};

export const listMessages = async ({ workspaceId, userId, contactId, limit = 50, offset = 0 }) => {
  const params = [userId];
  const filters = [];

  if (workspaceId) {
    params.unshift(workspaceId);
    filters.push('chats.workspace_id = $1');
    filters.push('(chats.sender_id = $2 OR chats.receiver_id = $2)');
  } else {
    filters.push('(chats.sender_id = $1 OR chats.receiver_id = $1)');
  }

  if (contactId) {
    params.push(contactId);
    const userParam = workspaceId ? 2 : 1;
    const contactParam = params.length;
    filters.push(
      `((chats.sender_id = $${userParam} AND chats.receiver_id = $${contactParam}) OR (chats.sender_id = $${contactParam} AND chats.receiver_id = $${userParam}))`,
    );
  }

  params.push(limit, offset);

  const { rows } = await query(
    `
      ${chatSelect}
      WHERE ${filters.join(' AND ')}
      ORDER BY chats.timestamp ASC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `,
    params,
  );

  return rows.map((row) => mapChat(row));
};

export const countChatsForUser = async (userId, workspaceId) => {
  const params = [userId];
  const workspaceClause = workspaceId ? 'workspace_id = $2 AND ' : '';

  if (workspaceId) {
    params.push(workspaceId);
  }

  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM chats
      WHERE ${workspaceClause}(sender_id = $1 OR receiver_id = $1)
    `,
    params,
  );

  return rows[0]?.count || 0;
};

export const listRecentChatsForUser = async (userId, limit = 3, workspaceId) => {
  const params = [userId, limit];
  const workspaceClause = workspaceId ? 'AND chats.workspace_id = $3' : '';

  if (workspaceId) {
    params.push(workspaceId);
  }

  const { rows } = await query(
    `
      ${chatSelect}
      WHERE (chats.sender_id = $1 OR chats.receiver_id = $1)
      ${workspaceClause}
      ORDER BY chats.timestamp DESC
      LIMIT $2
    `,
    params,
  );

  return rows.map((row) => mapChat(row));
};

export const findLatestIncomingMessage = async ({ userId, contactId, workspaceId }) => {
  const params = [contactId, userId];
  const workspaceClause = workspaceId ? 'AND chats.workspace_id = $3' : '';

  if (workspaceId) {
    params.push(workspaceId);
  }

  const { rows } = await query(
    `
      ${chatSelect}
      WHERE chats.sender_id = $1 AND chats.receiver_id = $2
      ${workspaceClause}
      ORDER BY chats.timestamp DESC
      LIMIT 1
    `,
    params,
  );

  return rows[0] ? mapChat(rows[0]) : null;
};
