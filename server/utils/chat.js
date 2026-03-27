import { createChat } from '../repositories/chatsRepository.js';

export const createChatMessage = async ({
  workspaceId,
  senderId,
  receiverId,
  message,
  messageType = 'text',
  attachment = null,
}) => {
  const trimmedMessage = message?.trim();

  if (!receiverId || (!trimmedMessage && !attachment)) {
    throw new Error('Receiver and message are required.');
  }

  return createChat({
    workspaceId,
    senderId,
    receiverId,
    message: trimmedMessage || attachment?.fileName || 'Attachment',
    messageType,
    attachment,
    timestamp: new Date(),
  });
};
