import multer from 'multer';

import { updateUserById } from '../repositories/usersRepository.js';
import { recordActivity } from '../services/activityService.js';
import { uploadWorkspaceFile } from '../services/uploadService.js';

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024),
  },
});

export const uploadFile = async (req, res, next) => {
  try {
    const moduleName = req.body.module || 'chat';
    const fileRecord = await uploadWorkspaceFile({
      file: req.file,
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: moduleName,
    });

    if (moduleName === 'profile') {
      await updateUserById(req.user.id, {
        avatarUrl: fileRecord.url,
      });
    }

    await recordActivity({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: 'upload',
      action: 'upload.created',
      entityType: 'file',
      entityId: fileRecord.id,
      description: `${req.user.name} uploaded ${fileRecord.fileName}.`,
    });

    res.status(201).json({
      success: true,
      file: fileRecord,
    });
  } catch (error) {
    next(error);
  }
};
