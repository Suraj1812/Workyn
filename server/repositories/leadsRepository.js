import { query } from '../db/client.js';
import { buildUpdateClause, createId, mapLead } from './helpers.js';

const leadUpdateFields = {
  name: { column: 'name' },
  status: { column: 'status' },
  notes: { column: 'notes' },
  assignedTo: { column: 'assigned_to' },
  followUpAt: { column: 'follow_up_at' },
};

const buildLeadFilters = ({
  workspaceId,
  userId,
  status,
  search,
  assignedTo,
  includeMineOnly = false,
}) => {
  const params = [];
  const conditions = [];

  if (workspaceId) {
    params.push(workspaceId);
    conditions.push(`workspace_id = $${params.length}`);
  } else if (userId) {
    params.push(userId);
    conditions.push(`created_by = $${params.length}`);
  }

  if (includeMineOnly && userId) {
    params.push(userId);
    conditions.push(`created_by = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (assignedTo) {
    params.push(assignedTo);
    conditions.push(`assigned_to = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(name ILIKE $${params.length} OR notes ILIKE $${params.length})`);
  }

  return {
    params,
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
  };
};

export const listLeadsByUser = async (userId, options = {}) => {
  return listLeadsByWorkspace({ userId, ...options });
};

export const listLeadsByWorkspace = async ({
  workspaceId,
  userId,
  status,
  search,
  assignedTo,
  includeMineOnly = false,
  limit,
  offset = 0,
}) => {
  const { params, whereClause } = buildLeadFilters({
    workspaceId,
    userId,
    status,
    search,
    assignedTo,
    includeMineOnly,
  });

  let paginationClause = '';
  if (limit) {
    params.push(limit, offset);
    paginationClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`;
  }

  const { rows } = await query(
    `
      SELECT *
      FROM leads
      ${whereClause}
      ORDER BY updated_at DESC
      ${paginationClause}
    `,
    params,
  );

  return rows.map((row) => mapLead(row));
};

export const createLead = async ({
  workspaceId,
  name,
  status,
  notes,
  assignedTo,
  followUpAt,
  createdBy,
}) => {
  const { rows } = await query(
    `
      INSERT INTO leads (id, workspace_id, name, status, notes, assigned_to, follow_up_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      createId(),
      workspaceId,
      name,
      status,
      notes,
      assignedTo || null,
      followUpAt || null,
      createdBy,
    ],
  );

  return mapLead(rows[0]);
};

export const findLeadByIdAndUser = async (leadId, userId, workspaceId) => {
  const params = [leadId, userId];
  const workspaceClause = workspaceId ? 'AND workspace_id = $3' : '';

  if (workspaceId) {
    params.push(workspaceId);
  }

  const { rows } = await query(
    `
      SELECT *
      FROM leads
      WHERE id = $1 AND created_by = $2
      ${workspaceClause}
      LIMIT 1
    `,
    params,
  );

  return rows[0] ? mapLead(rows[0]) : null;
};

export const updateLeadByIdAndUser = async (leadId, userId, payload, workspaceId) => {
  const { clause, values } = buildUpdateClause(payload, leadUpdateFields);

  if (!clause) {
    return findLeadByIdAndUser(leadId, userId, workspaceId);
  }

  const params = [...values, leadId, userId];
  const workspaceClause = workspaceId ? `AND workspace_id = $${params.length + 1}` : '';

  if (workspaceId) {
    params.push(workspaceId);
  }

  const { rows } = await query(
    `
      UPDATE leads
      SET ${clause}
      WHERE id = $${values.length + 1} AND created_by = $${values.length + 2}
      ${workspaceClause}
      RETURNING *
    `,
    params,
  );

  return rows[0] ? mapLead(rows[0]) : null;
};

export const deleteLeadByIdAndUser = async (leadId, userId, workspaceId) => {
  const params = [leadId, userId];
  const workspaceClause = workspaceId ? 'AND workspace_id = $3' : '';

  if (workspaceId) {
    params.push(workspaceId);
  }

  const { rows } = await query(
    `
      DELETE FROM leads
      WHERE id = $1 AND created_by = $2
      ${workspaceClause}
      RETURNING *
    `,
    params,
  );

  return rows[0] ? mapLead(rows[0]) : null;
};

export const countLeadsByUser = async (userId, workspaceId) => {
  const params = workspaceId ? [userId, workspaceId] : [userId];
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM leads
      WHERE created_by = $1
      ${workspaceId ? 'AND workspace_id = $2' : ''}
    `,
    params,
  );

  return rows[0]?.count || 0;
};

export const countLeadsByStatus = async (userId, status, workspaceId) => {
  const params = workspaceId ? [userId, status, workspaceId] : [userId, status];
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM leads
      WHERE created_by = $1 AND status = $2
      ${workspaceId ? 'AND workspace_id = $3' : ''}
    `,
    params,
  );

  return rows[0]?.count || 0;
};

export const listRecentLeadsByUser = async (userId, limit = 3, workspaceId) => {
  const params = workspaceId ? [userId, limit, workspaceId] : [userId, limit];
  const { rows } = await query(
    `
      SELECT *
      FROM leads
      WHERE created_by = $1
      ${workspaceId ? 'AND workspace_id = $3' : ''}
      ORDER BY updated_at DESC
      LIMIT $2
    `,
    params,
  );

  return rows.map((row) => mapLead(row));
};

export const listInactiveLeads = async ({ userId, olderThan, limit = 12, workspaceId }) => {
  const params = workspaceId ? [userId, olderThan, limit, workspaceId] : [userId, olderThan, limit];
  const { rows } = await query(
    `
      SELECT *
      FROM leads
      WHERE
        created_by = $1
        AND status <> 'Converted'
        AND updated_at <= $2
        ${workspaceId ? 'AND workspace_id = $4' : ''}
      ORDER BY updated_at ASC
      LIMIT $3
    `,
    params,
  );

  return rows.map((row) => mapLead(row));
};

export const countLeadsByWorkspace = async ({
  workspaceId,
  userId,
  status,
  search,
  assignedTo,
  includeMineOnly = false,
}) => {
  const { params, whereClause } = buildLeadFilters({
    workspaceId,
    userId,
    status,
    search,
    assignedTo,
    includeMineOnly,
  });

  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM leads
      ${whereClause}
    `,
    params,
  );

  return rows[0]?.count || 0;
};
