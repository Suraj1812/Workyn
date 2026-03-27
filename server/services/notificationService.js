import { createNotification } from '../repositories/notificationsRepository.js';

const emitToUser = (io, userId, event, payload) => {
  if (!io || !userId) {
    return;
  }

  io.to(`user:${userId}`).emit(event, payload);
};

export const sendNotification = async ({
  io,
  workspaceId,
  userId,
  type,
  title,
  message,
  link,
  metadata = {},
}) => {
  const notification = await createNotification({
    workspaceId,
    userId,
    type,
    title,
    message,
    link,
    metadata,
  });

  emitToUser(io, userId, 'notification:new', notification);
  return notification;
};
