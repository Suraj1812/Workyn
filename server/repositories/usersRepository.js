import { query } from '../db/client.js';
import { createId, mapUser } from './helpers.js';

const getExecutor = (db) => db?.query?.bind(db) || query;

export const createUser = async ({ name, email, password, role = 'admin' }, db) => {
  const execute = getExecutor(db);
  const { rows } = await execute(
    `
      INSERT INTO users (id, name, email, password, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [createId(), name, email, password, role],
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

export const updateUserById = async (userId, payload, db) => {
  const execute = getExecutor(db);
  const fields = {
    name: 'name',
    email: 'email',
    role: 'role',
    avatarUrl: 'avatar_url',
    currentWorkspaceId: 'current_workspace_id',
    lastLoginAt: 'last_login_at',
  };
  const entries = Object.entries(payload).filter(
    ([key, value]) => fields[key] && value !== undefined,
  );

  if (!entries.length) {
    return findUserById(userId, { includePassword: true });
  }

  const values = [];
  const setClause = entries
    .map(([key, value], index) => {
      values.push(value);
      return `${fields[key]} = $${index + 1}`;
    })
    .join(', ');

  const { rows } = await execute(
    `
      UPDATE users
      SET ${setClause}
      WHERE id = $${values.length + 1}
      RETURNING *
    `,
    [...values, userId],
  );

  return rows[0] ? mapUser(rows[0], { includePassword: true }) : null;
};

export const setUserCurrentWorkspace = async (userId, workspaceId, db) =>
  updateUserById(userId, { currentWorkspaceId: workspaceId }, db);

export const updateUserLastLogin = async (userId, db) =>
  updateUserById(userId, { lastLoginAt: new Date() }, db);

export const listUsersExcept = async ({ userId, workspaceId }) => {
  const { rows } = await query(
    `
      SELECT users.*
      FROM users
      INNER JOIN workspace_memberships
        ON workspace_memberships.user_id = users.id
      WHERE
        workspace_memberships.workspace_id = $1
        AND workspace_memberships.status = 'active'
        AND users.id <> $2
      ORDER BY name ASC
    `,
    [workspaceId, userId],
  );

  return rows.map((row) => mapUser(row));
};

export const countUsers = async (workspaceId) => {
  if (workspaceId) {
    const { rows } = await query(
      `
        SELECT COUNT(*)::int AS count
        FROM workspace_memberships
        WHERE workspace_id = $1 AND status = 'active'
      `,
      [workspaceId],
    );

    return rows[0]?.count || 0;
  }

  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM users
    `,
  );

  return rows[0]?.count || 0;
};
