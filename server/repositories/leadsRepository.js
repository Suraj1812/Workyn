import { query } from '../db/client.js';
import { buildUpdateClause, createId, mapLead } from './helpers.js';

const leadUpdateFields = {
  name: { column: 'name' },
  status: { column: 'status' },
  notes: { column: 'notes' },
};

export const listLeadsByUser = async (userId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM leads
      WHERE created_by = $1
      ORDER BY updated_at DESC
    `,
    [userId],
  );

  return rows.map((row) => mapLead(row));
};

export const createLead = async ({ name, status, notes, createdBy }) => {
  const { rows } = await query(
    `
      INSERT INTO leads (id, name, status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [createId(), name, status, notes, createdBy],
  );

  return mapLead(rows[0]);
};

export const findLeadByIdAndUser = async (leadId, userId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM leads
      WHERE id = $1 AND created_by = $2
      LIMIT 1
    `,
    [leadId, userId],
  );

  return rows[0] ? mapLead(rows[0]) : null;
};

export const updateLeadByIdAndUser = async (leadId, userId, payload) => {
  const { clause, values } = buildUpdateClause(payload, leadUpdateFields);

  if (!clause) {
    return findLeadByIdAndUser(leadId, userId);
  }

  const { rows } = await query(
    `
      UPDATE leads
      SET ${clause}
      WHERE id = $${values.length + 1} AND created_by = $${values.length + 2}
      RETURNING *
    `,
    [...values, leadId, userId],
  );

  return rows[0] ? mapLead(rows[0]) : null;
};

export const deleteLeadByIdAndUser = async (leadId, userId) => {
  const { rows } = await query(
    `
      DELETE FROM leads
      WHERE id = $1 AND created_by = $2
      RETURNING *
    `,
    [leadId, userId],
  );

  return rows[0] ? mapLead(rows[0]) : null;
};

export const countLeadsByUser = async (userId) => {
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM leads
      WHERE created_by = $1
    `,
    [userId],
  );

  return rows[0]?.count || 0;
};

export const countLeadsByStatus = async (userId, status) => {
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM leads
      WHERE created_by = $1 AND status = $2
    `,
    [userId, status],
  );

  return rows[0]?.count || 0;
};

export const listRecentLeadsByUser = async (userId, limit = 3) => {
  const { rows } = await query(
    `
      SELECT *
      FROM leads
      WHERE created_by = $1
      ORDER BY updated_at DESC
      LIMIT $2
    `,
    [userId, limit],
  );

  return rows.map((row) => mapLead(row));
};

export const listInactiveLeads = async ({ userId, olderThan, limit = 12 }) => {
  const { rows } = await query(
    `
      SELECT *
      FROM leads
      WHERE
        created_by = $1
        AND status <> 'Converted'
        AND updated_at <= $2
      ORDER BY updated_at ASC
      LIMIT $3
    `,
    [userId, olderThan, limit],
  );

  return rows.map((row) => mapLead(row));
};
