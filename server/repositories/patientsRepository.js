import { query } from '../db/client.js';
import { buildUpdateClause, createId, mapPatient } from './helpers.js';

const patientUpdateFields = {
  name: { column: 'name' },
  age: { column: 'age' },
  history: { column: 'history' },
  appointments: {
    column: 'appointments',
    cast: 'jsonb',
    transform: (value) => JSON.stringify(value),
  },
};

const buildPatientFilters = ({ workspaceId, userId, search, includeMineOnly = false }) => {
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

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(name ILIKE $${params.length} OR history ILIKE $${params.length})`);
  }

  return {
    params,
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
  };
};

export const listPatientsByUser = async (userId, options = {}) => {
  return listPatientsByWorkspace({ userId, ...options });
};

export const listPatientsByWorkspace = async ({
  workspaceId,
  userId,
  search,
  includeMineOnly = false,
  limit,
  offset = 0,
}) => {
  const { params, whereClause } = buildPatientFilters({
    workspaceId,
    userId,
    search,
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
      FROM patients
      ${whereClause}
      ORDER BY updated_at DESC
      ${paginationClause}
    `,
    params,
  );

  return rows.map((row) => mapPatient(row));
};

export const createPatient = async ({
  workspaceId,
  name,
  age,
  history,
  appointments,
  createdBy,
}) => {
  const { rows } = await query(
    `
      INSERT INTO patients (id, workspace_id, name, age, history, appointments, created_by)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
      RETURNING *
    `,
    [createId(), workspaceId, name, age, history, JSON.stringify(appointments), createdBy],
  );

  return mapPatient(rows[0]);
};

export const findPatientByIdAndUser = async (patientId, userId, workspaceId) => {
  const params = [patientId, userId];
  const workspaceClause = workspaceId ? 'AND workspace_id = $3' : '';

  if (workspaceId) {
    params.push(workspaceId);
  }

  const { rows } = await query(
    `
      SELECT *
      FROM patients
      WHERE id = $1 AND created_by = $2
      ${workspaceClause}
      LIMIT 1
    `,
    params,
  );

  return rows[0] ? mapPatient(rows[0]) : null;
};

export const updatePatientByIdAndUser = async (patientId, userId, payload, workspaceId) => {
  const { clause, values } = buildUpdateClause(payload, patientUpdateFields);

  if (!clause) {
    return findPatientByIdAndUser(patientId, userId, workspaceId);
  }

  const params = [...values, patientId, userId];
  const workspaceClause = workspaceId ? `AND workspace_id = $${params.length + 1}` : '';

  if (workspaceId) {
    params.push(workspaceId);
  }

  const { rows } = await query(
    `
      UPDATE patients
      SET ${clause}
      WHERE id = $${values.length + 1} AND created_by = $${values.length + 2}
      ${workspaceClause}
      RETURNING *
    `,
    params,
  );

  return rows[0] ? mapPatient(rows[0]) : null;
};

export const countPatientsByUser = async (userId, workspaceId) => {
  const params = workspaceId ? [userId, workspaceId] : [userId];
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM patients
      WHERE created_by = $1
      ${workspaceId ? 'AND workspace_id = $2' : ''}
    `,
    params,
  );

  return rows[0]?.count || 0;
};

export const listRecentPatientsByUser = async (userId, limit = 3, workspaceId) => {
  const params = workspaceId ? [userId, limit, workspaceId] : [userId, limit];
  const { rows } = await query(
    `
      SELECT *
      FROM patients
      WHERE created_by = $1
      ${workspaceId ? 'AND workspace_id = $3' : ''}
      ORDER BY updated_at DESC
      LIMIT $2
    `,
    params,
  );

  return rows.map((row) => mapPatient(row));
};

export const countPatientsByWorkspace = async ({
  workspaceId,
  userId,
  search,
  includeMineOnly = false,
}) => {
  const { params, whereClause } = buildPatientFilters({
    workspaceId,
    userId,
    search,
    includeMineOnly,
  });

  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM patients
      ${whereClause}
    `,
    params,
  );

  return rows[0]?.count || 0;
};
