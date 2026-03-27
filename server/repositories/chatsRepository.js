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

export const createChat = async ({ senderId, receiverId, message, timestamp = new Date() }) => {
  const { rows } = await query(
    `
      INSERT INTO chats (id, sender_id, receiver_id, message, timestamp)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [createId(), senderId, receiverId, message, timestamp],
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

export const listMessages = async ({ userId, contactId }) => {
  const params = [userId];
  let whereClause = `
    WHERE chats.sender_id = $1 OR chats.receiver_id = $1
  `;

  if (contactId) {
    params.push(contactId);
    whereClause = `
      WHERE
        (chats.sender_id = $1 AND chats.receiver_id = $2)
        OR
        (chats.sender_id = $2 AND chats.receiver_id = $1)
    `;
  }

  const { rows } = await query(
    `
      ${chatSelect}
      ${whereClause}
      ORDER BY chats.timestamp ASC
    `,
    params,
  );

  return rows.map((row) => mapChat(row));
};

export const countChatsForUser = async (userId) => {
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM chats
      WHERE sender_id = $1 OR receiver_id = $1
    `,
    [userId],
  );

  return rows[0]?.count || 0;
};

export const listRecentChatsForUser = async (userId, limit = 3) => {
  const { rows } = await query(
    `
      ${chatSelect}
      WHERE chats.sender_id = $1 OR chats.receiver_id = $1
      ORDER BY chats.timestamp DESC
      LIMIT $2
    `,
    [userId, limit],
  );

  return rows.map((row) => mapChat(row));
};

export const findLatestIncomingMessage = async ({ userId, contactId }) => {
  const { rows } = await query(
    `
      ${chatSelect}
      WHERE chats.sender_id = $1 AND chats.receiver_id = $2
      ORDER BY chats.timestamp DESC
      LIMIT 1
    `,
    [contactId, userId],
  );

  return rows[0] ? mapChat(rows[0]) : null;
};
