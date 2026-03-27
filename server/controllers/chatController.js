import { processUserAction } from '../ai-engine/services/behaviorTracker.js';
import { normalizeText } from '../ai-engine/utils/normalizers.js';
import { listMessages } from '../repositories/chatsRepository.js';
import { findMembershipByUserAndWorkspace } from '../repositories/workspacesRepository.js';
import { recordActivity } from '../services/activityService.js';
import { sendNotification } from '../services/notificationService.js';
import { getUserSocketIds } from '../sockets/chatSocket.js';
import { createChatMessage } from '../utils/chat.js';

export const getMessages = async (req, res, next) => {
  try {
    const { contactId } = req.query;
    const messages = await listMessages({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      contactId,
      limit: Number(req.query.limit || 50),
      offset: Number(req.query.offset || 0),
    });

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const receiverMembership = await findMembershipByUserAndWorkspace(
      req.body.receiverId,
      req.workspace.id,
    );

    if (!receiverMembership) {
      res.status(404);
      throw new Error('The selected teammate is not in your workspace.');
    }

    const savedMessage = await createChatMessage({
      workspaceId: req.workspace.id,
      senderId: req.user.id,
      receiverId: req.body.receiverId,
      message: req.body.message,
      messageType: req.body.messageType,
      attachment: req.body.attachment,
    });

    const io = req.app.get('io');
    const receiverSockets = getUserSocketIds(savedMessage.receiverId.id.toString());

    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit('receive_message', savedMessage);
    });

    await processUserAction({
      userId: req.user.id,
      workspaceId: req.workspace.id,
      module: 'chat',
      actionType: 'chat.message_sent',
      metadata: {
        messageId: savedMessage.id,
        receiverId: savedMessage.receiverId.id.toString(),
        receiverName: savedMessage.receiverId.name,
        message: savedMessage.message,
        normalizedMessage: normalizeText(savedMessage.message),
      },
    });

    await recordActivity({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      module: 'chat',
      action: 'chat.message_sent',
      entityType: 'chat',
      entityId: savedMessage.id,
      description: `${req.user.name} messaged ${savedMessage.receiverId.name}.`,
      metadata: {
        messageType: savedMessage.messageType,
      },
    });

    await sendNotification({
      io,
      workspaceId: req.workspace.id,
      userId: savedMessage.receiverId.id,
      type: 'chat_message',
      title: `New message from ${req.user.name}`,
      message:
        savedMessage.messageType === 'file'
          ? 'A file was shared with you in chat.'
          : savedMessage.message,
      link: '/chat',
      metadata: {
        senderId: req.user.id,
        messageId: savedMessage.id,
      },
    });

    res.status(201).json({ success: true, message: savedMessage });
  } catch (error) {
    next(error);
  }
};
