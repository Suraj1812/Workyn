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

export const listPatientsByUser = async (userId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM patients
      WHERE created_by = $1
      ORDER BY updated_at DESC
    `,
    [userId],
  );

  return rows.map((row) => mapPatient(row));
};

export const createPatient = async ({ name, age, history, appointments, createdBy }) => {
  const { rows } = await query(
    `
      INSERT INTO patients (id, name, age, history, appointments, created_by)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6)
      RETURNING *
    `,
    [createId(), name, age, history, JSON.stringify(appointments), createdBy],
  );

  return mapPatient(rows[0]);
};

export const findPatientByIdAndUser = async (patientId, userId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM patients
      WHERE id = $1 AND created_by = $2
      LIMIT 1
    `,
    [patientId, userId],
  );

  return rows[0] ? mapPatient(rows[0]) : null;
};

export const updatePatientByIdAndUser = async (patientId, userId, payload) => {
  const { clause, values } = buildUpdateClause(payload, patientUpdateFields);

  if (!clause) {
    return findPatientByIdAndUser(patientId, userId);
  }

  const { rows } = await query(
    `
      UPDATE patients
      SET ${clause}
      WHERE id = $${values.length + 1} AND created_by = $${values.length + 2}
      RETURNING *
    `,
    [...values, patientId, userId],
  );

  return rows[0] ? mapPatient(rows[0]) : null;
};

export const countPatientsByUser = async (userId) => {
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM patients
      WHERE created_by = $1
    `,
    [userId],
  );

  return rows[0]?.count || 0;
};

export const listRecentPatientsByUser = async (userId, limit = 3) => {
  const { rows } = await query(
    `
      SELECT *
      FROM patients
      WHERE created_by = $1
      ORDER BY updated_at DESC
      LIMIT $2
    `,
    [userId, limit],
  );

  return rows.map((row) => mapPatient(row));
};
