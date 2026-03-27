import { createChat } from '../repositories/chatsRepository.js';

export const createChatMessage = async ({ senderId, receiverId, message }) => {
  const trimmedMessage = message?.trim();

  if (!receiverId || !trimmedMessage) {
    throw new Error('Receiver and message are required.');
  }

  return createChat({
    senderId,
    receiverId,
    message: trimmedMessage,
    timestamp: new Date(),
  });
};
