import { query } from '../db/client.js';
import { createId, mapFileRecord } from './helpers.js';

export const createFileRecord = async ({
  workspaceId,
  userId,
  module,
  fileName,
  mimeType,
  sizeBytes,
  url,
  publicId,
  provider = 'cloudinary',
  resourceType = 'auto',
  metadata = {},
}) => {
  const { rows } = await query(
    `
      INSERT INTO files (
        id,
        workspace_id,
        user_id,
        module,
        file_name,
        mime_type,
        size_bytes,
        url,
        public_id,
        provider,
        resource_type,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
      RETURNING *
    `,
    [
      createId(),
      workspaceId,
      userId,
      module,
      fileName,
      mimeType,
      sizeBytes,
      url,
      publicId || null,
      provider,
      resourceType,
      JSON.stringify(metadata),
    ],
  );

  return mapFileRecord(rows[0]);
};
