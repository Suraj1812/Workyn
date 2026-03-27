import { query } from '../db/client.js';
import { createId, mapResume } from './helpers.js';

export const findResumeByUser = async (userId) => {
  const { rows } = await query(
    `
      SELECT *
      FROM resumes
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] ? mapResume(rows[0]) : null;
};

export const upsertResume = async ({ userId, data, template }) => {
  const { rows } = await query(
    `
      INSERT INTO resumes (id, user_id, data, template)
      VALUES ($1, $2, $3::jsonb, $4)
      ON CONFLICT (user_id)
      DO UPDATE
      SET data = EXCLUDED.data,
          template = EXCLUDED.template
      RETURNING *
    `,
    [createId(), userId, JSON.stringify(data), template],
  );

  return mapResume(rows[0]);
};
