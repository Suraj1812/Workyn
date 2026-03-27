import { query } from '../db/client.js';

export const searchWorkspace = async ({ workspaceId, searchTerm, limit = 8 }) => {
  if (!searchTerm?.trim()) {
    return [];
  }

  const normalized = `%${searchTerm.trim()}%`;
  const { rows } = await query(
    `
      (
        SELECT
          'lead' AS type,
          leads.id,
          leads.name AS title,
          COALESCE(leads.notes, '') AS subtitle,
          '/crm' AS link
        FROM leads
        WHERE leads.workspace_id = $1 AND (leads.name ILIKE $2 OR leads.notes ILIKE $2)
        ORDER BY leads.updated_at DESC
        LIMIT $3
      )
      UNION ALL
      (
        SELECT
          'patient' AS type,
          patients.id,
          patients.name AS title,
          COALESCE(patients.history, '') AS subtitle,
          '/clinic' AS link
        FROM patients
        WHERE patients.workspace_id = $1 AND (patients.name ILIKE $2 OR patients.history ILIKE $2)
        ORDER BY patients.updated_at DESC
        LIMIT $3
      )
      UNION ALL
      (
        SELECT
          'message' AS type,
          chats.id,
          LEFT(chats.message, 120) AS title,
          users.name AS subtitle,
          '/chat' AS link
        FROM chats
        INNER JOIN users ON users.id = chats.sender_id
        WHERE chats.workspace_id = $1 AND chats.message ILIKE $2
        ORDER BY chats.timestamp DESC
        LIMIT $3
      )
      UNION ALL
      (
        SELECT
          'member' AS type,
          users.id,
          users.name AS title,
          users.email AS subtitle,
          '/team' AS link
        FROM users
        INNER JOIN workspace_memberships
          ON workspace_memberships.user_id = users.id
        WHERE workspace_memberships.workspace_id = $1
          AND workspace_memberships.status = 'active'
          AND (users.name ILIKE $2 OR users.email ILIKE $2)
        ORDER BY users.name ASC
        LIMIT $3
      )
      LIMIT $3
    `,
    [workspaceId, normalized, limit],
  );

  return rows;
};
