import { query } from '../db/client.js';
import {
  buildUpdateClause,
  createId,
  mapWorkspace,
  mapWorkspaceInvitation,
  mapWorkspaceMembership,
} from './helpers.js';

const getExecutor = (db) => db?.query?.bind(db) || query;

const workspaceUpdateFields = {
  name: { column: 'name' },
  billingEmail: { column: 'billing_email' },
  plan: { column: 'plan' },
  subscriptionStatus: { column: 'subscription_status' },
  stripeCustomerId: { column: 'stripe_customer_id' },
  stripeSubscriptionId: { column: 'stripe_subscription_id' },
  currentPeriodEnd: { column: 'current_period_end' },
};

const invitationUpdateFields = {
  status: { column: 'status' },
  acceptedBy: { column: 'accepted_by' },
  expiresAt: { column: 'expires_at' },
};

export const createWorkspace = async ({ name, slug, ownerUserId, billingEmail }, db) => {
  const execute = getExecutor(db);
  const { rows } = await execute(
    `
      INSERT INTO workspaces (id, name, slug, owner_user_id, billing_email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [createId(), name, slug, ownerUserId, billingEmail || null],
  );

  return mapWorkspace(rows[0]);
};

export const findWorkspaceById = async (workspaceId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM workspaces
      WHERE id = $1
      LIMIT 1
    `,
    [workspaceId],
  );

  return rows[0] ? mapWorkspace(rows[0]) : null;
};

export const findWorkspaceBySlug = async (slug) => {
  const { rows } = await query(
    `
      SELECT *
      FROM workspaces
      WHERE slug = $1
      LIMIT 1
    `,
    [slug],
  );

  return rows[0] ? mapWorkspace(rows[0]) : null;
};

export const updateWorkspaceById = async (workspaceId, payload) => {
  const { clause, values } = buildUpdateClause(payload, workspaceUpdateFields);

  if (!clause) {
    return findWorkspaceById(workspaceId);
  }

  const { rows } = await query(
    `
      UPDATE workspaces
      SET ${clause}
      WHERE id = $${values.length + 1}
      RETURNING *
    `,
    [...values, workspaceId],
  );

  return rows[0] ? mapWorkspace(rows[0]) : null;
};

export const createWorkspaceMembership = async (
  { workspaceId, userId, role = 'admin', status = 'active' },
  db,
) => {
  const execute = getExecutor(db);
  const { rows } = await execute(
    `
      INSERT INTO workspace_memberships (id, workspace_id, user_id, role, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (workspace_id, user_id)
      DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status
      RETURNING *
    `,
    [createId(), workspaceId, userId, role, status],
  );

  return mapWorkspaceMembership(rows[0]);
};

export const findMembershipByUserAndWorkspace = async (userId, workspaceId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM workspace_memberships
      WHERE user_id = $1 AND workspace_id = $2
      LIMIT 1
    `,
    [userId, workspaceId],
  );

  return rows[0] ? mapWorkspaceMembership(rows[0]) : null;
};

export const listMembershipsByUser = async (userId) => {
  const { rows } = await query(
    `
      SELECT workspace_memberships.*, workspaces.name, workspaces.slug, workspaces.plan
      FROM workspace_memberships
      INNER JOIN workspaces ON workspaces.id = workspace_memberships.workspace_id
      WHERE workspace_memberships.user_id = $1 AND workspace_memberships.status = 'active'
      ORDER BY workspaces.name ASC
    `,
    [userId],
  );

  return rows.map((row) => ({
    ...mapWorkspaceMembership(row),
    workspace: {
      id: row.workspace_id,
      _id: row.workspace_id,
      name: row.name,
      slug: row.slug,
      plan: row.plan,
    },
  }));
};

export const listWorkspaceMembers = async (workspaceId) => {
  const { rows } = await query(
    `
      SELECT
        workspace_memberships.*,
        users.id AS member_id,
        users.name AS member_name,
        users.email AS member_email,
        users.avatar_url AS member_avatar_url,
        users.role AS member_role
      FROM workspace_memberships
      INNER JOIN users ON users.id = workspace_memberships.user_id
      WHERE workspace_memberships.workspace_id = $1
      ORDER BY workspace_memberships.role ASC, users.name ASC
    `,
    [workspaceId],
  );

  return rows.map((row) => mapWorkspaceMembership(row));
};

export const countWorkspaceMembers = async (workspaceId) => {
  const { rows } = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM workspace_memberships
      WHERE workspace_id = $1 AND status = 'active'
    `,
    [workspaceId],
  );

  return rows[0]?.count || 0;
};

export const createWorkspaceInvitation = async ({
  workspaceId,
  email,
  role = 'member',
  token,
  invitedBy,
  expiresAt,
}) => {
  const { rows } = await query(
    `
      INSERT INTO workspace_invitations (id, workspace_id, email, role, token, invited_by, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [createId(), workspaceId, email, role, token, invitedBy, expiresAt],
  );

  return mapWorkspaceInvitation(rows[0]);
};

export const listWorkspaceInvitations = async (workspaceId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM workspace_invitations
      WHERE workspace_id = $1
      ORDER BY created_at DESC
    `,
    [workspaceId],
  );

  return rows.map((row) => mapWorkspaceInvitation(row));
};

export const findWorkspaceInvitationByToken = async (token) => {
  const { rows } = await query(
    `
      SELECT *
      FROM workspace_invitations
      WHERE token = $1
      LIMIT 1
    `,
    [token],
  );

  return rows[0] ? mapWorkspaceInvitation(rows[0]) : null;
};

export const updateWorkspaceInvitation = async (invitationId, payload) => {
  const { clause, values } = buildUpdateClause(payload, invitationUpdateFields);

  if (!clause) {
    const { rows } = await query(
      `
        SELECT *
        FROM workspace_invitations
        WHERE id = $1
      `,
      [invitationId],
    );

    return rows[0] ? mapWorkspaceInvitation(rows[0]) : null;
  }

  const { rows } = await query(
    `
      UPDATE workspace_invitations
      SET ${clause}
      WHERE id = $${values.length + 1}
      RETURNING *
    `,
    [...values, invitationId],
  );

  return rows[0] ? mapWorkspaceInvitation(rows[0]) : null;
};
