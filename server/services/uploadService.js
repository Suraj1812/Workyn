import { getCloudinaryClient, isCloudinaryConfigured } from '../config/cloudinary.js';
import { createFileRecord } from '../repositories/filesRepository.js';

const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const cloudinary = getCloudinaryClient();
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });

export const uploadWorkspaceFile = async ({ file, workspaceId, userId, module }) => {
  if (!file) {
    throw new Error('A file is required.');
  }

  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured.');
  }

  const uploaded = await uploadToCloudinary(file.buffer, {
    folder: `workyn/${workspaceId || 'personal'}/${module}`,
    resource_type: 'auto',
    use_filename: true,
    unique_filename: true,
  });

  return createFileRecord({
    workspaceId,
    userId,
    module,
    fileName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
    resourceType: uploaded.resource_type,
    metadata: {
      width: uploaded.width || null,
      height: uploaded.height || null,
      bytes: uploaded.bytes,
      format: uploaded.format,
    },
  });
};
