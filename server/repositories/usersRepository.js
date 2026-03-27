import { query } from '../db/client.js';
import { createId, mapUser } from './helpers.js';

export const createUser = async ({ name, email, password }) => {
  const { rows } = await query(
    `
      INSERT INTO users (id, name, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [createId(), name, email, password],
  );

  return mapUser(rows[0], { includePassword: true });
};

export const findUserByEmail = async (email, { includePassword = false } = {}) => {
  const { rows } = await query(
    `
      SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  return rows[0] ? mapUser(rows[0], { includePassword }) : null;
};

export const findUserById = async (userId, { includePassword = false } = {}) => {
  const { rows } = await query(
    `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] ? mapUser(rows[0], { includePassword }) : null;
};

export const listUsersExcept = async (userId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM users
      WHERE id <> $1
      ORDER BY name ASC
    `,
    [userId],
  );

  return rows.map((row) => mapUser(row));
};

export const countUsers = async () => {
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM users
    `,
  );

  return rows[0]?.count || 0;
};
