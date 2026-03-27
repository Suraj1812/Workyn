import { query } from '../db/client.js';
import { createId, mapResume } from './helpers.js';

export const findResumeByUser = async (userId, workspaceId) => {
  const params = workspaceId ? [userId, workspaceId] : [userId];
  const { rows } = await query(
    `
      SELECT *
      FROM resumes
      WHERE user_id = $1
      ${workspaceId ? 'AND workspace_id = $2' : ''}
      LIMIT 1
    `,
    params,
  );

  return rows[0] ? mapResume(rows[0]) : null;
};

export const upsertResume = async ({ userId, workspaceId, data, template }) => {
  const { rows } = await query(
    `
      INSERT INTO resumes (id, workspace_id, user_id, data, template)
      VALUES ($1, $2, $3, $4::jsonb, $5)
      ON CONFLICT (user_id)
      DO UPDATE
      SET workspace_id = EXCLUDED.workspace_id,
          data = EXCLUDED.data,
          template = EXCLUDED.template
      RETURNING *
    `,
    [createId(), workspaceId, userId, JSON.stringify(data), template],
  );

  return mapResume(rows[0]);
};
