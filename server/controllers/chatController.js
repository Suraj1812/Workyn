import { processUserAction } from '../ai-engine/services/behaviorTracker.js';
import { normalizeText } from '../ai-engine/utils/normalizers.js';
import { listMessages } from '../repositories/chatsRepository.js';
import { getUserSocketIds } from '../sockets/chatSocket.js';
import { createChatMessage } from '../utils/chat.js';

export const getMessages = async (req, res, next) => {
  try {
    const { contactId } = req.query;
    const messages = await listMessages({
      userId: req.user._id,
      contactId,
    });

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const savedMessage = await createChatMessage({
      senderId: req.user._id,
      receiverId: req.body.receiverId,
      message: req.body.message,
    });

    const io = req.app.get('io');
    const receiverSockets = getUserSocketIds(savedMessage.receiverId._id.toString());

    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit('receive_message', savedMessage);
    });

    await processUserAction({
      userId: req.user._id,
      module: 'chat',
      actionType: 'chat.message_sent',
      metadata: {
        messageId: savedMessage._id.toString(),
        receiverId: savedMessage.receiverId._id.toString(),
        receiverName: savedMessage.receiverId.name,
        message: savedMessage.message,
        normalizedMessage: normalizeText(savedMessage.message),
      },
    });

    res.status(201).json({ success: true, message: savedMessage });
  } catch (error) {
    next(error);
  }
};
