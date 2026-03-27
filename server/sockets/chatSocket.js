import jwt from 'jsonwebtoken';

import { processUserAction } from '../ai-engine/services/behaviorTracker.js';
import { normalizeText } from '../ai-engine/utils/normalizers.js';
import { recordActivity } from '../services/activityService.js';
import { sendNotification } from '../services/notificationService.js';
import { createChatMessage } from '../utils/chat.js';
import { findUserById, setUserCurrentWorkspace } from '../repositories/usersRepository.js';
import {
  findMembershipByUserAndWorkspace,
  listMembershipsByUser,
} from '../repositories/workspacesRepository.js';

const userSockets = new Map();
const workspacePresence = new Map();

const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((accumulator, cookie) => {
      const [key, ...valueParts] = cookie.split('=');
      accumulator[key] = decodeURIComponent(valueParts.join('='));
      return accumulator;
    }, {});

const trackPresence = (workspaceId, userId, socketId) => {
  if (!workspacePresence.has(workspaceId)) {
    workspacePresence.set(workspaceId, new Map());
  }

  if (!workspacePresence.get(workspaceId).has(userId)) {
    workspacePresence.get(workspaceId).set(userId, new Set());
  }

  workspacePresence.get(workspaceId).get(userId).add(socketId);
};

const untrackPresence = (workspaceId, userId, socketId) => {
  const workspaceMap = workspacePresence.get(workspaceId);

  if (!workspaceMap?.has(userId)) {
    return;
  }

  const sockets = workspaceMap.get(userId);
  sockets.delete(socketId);

  if (!sockets.size) {
    workspaceMap.delete(userId);
  }

  if (!workspaceMap.size) {
    workspacePresence.delete(workspaceId);
  }
};

const emitOnlineUsers = (io, workspaceId) => {
  io.to(`workspace:${workspaceId}`).emit('users:online', getOnlineUserIds(workspaceId));
};

export const getUserSocketIds = (userId) => Array.from(userSockets.get(userId) || []);

export const getOnlineUserIds = (workspaceId) => {
  if (!workspaceId) {
    return Array.from(userSockets.keys());
  }

  return Array.from(workspacePresence.get(workspaceId)?.keys() || []);
};

export const authenticateSocket = async (socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token =
      cookies[process.env.COOKIE_NAME || 'workyn_token'] || socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Unauthorized'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await findUserById(decoded.id);

    if (!user) {
      return next(new Error('Unauthorized'));
    }

    const memberships = await listMembershipsByUser(user.id);
    let membership =
      user.currentWorkspaceId &&
      (await findMembershipByUserAndWorkspace(user.id, user.currentWorkspaceId));

    if (!membership) {
      membership = memberships[0] || null;
      if (membership?.workspaceId && membership.workspaceId !== user.currentWorkspaceId) {
        user = await setUserCurrentWorkspace(user.id, membership.workspaceId);
      }
    }

    if (!membership) {
      return next(new Error('Unauthorized'));
    }

    socket.user = user;
    socket.workspace = membership.workspace;
    socket.membership = membership;
    next();
  } catch (error) {
    next(new Error('Unauthorized'));
  }
};

export const registerChatHandlers = (io, socket) => {
  const userId = socket.user.id;
  const workspaceId = socket.workspace.id;

  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }

  userSockets.get(userId).add(socket.id);
  trackPresence(workspaceId, userId, socket.id);

  socket.join(`user:${userId}`);
  socket.join(`workspace:${workspaceId}`);
  emitOnlineUsers(io, workspaceId);

  socket.on('typing_start', ({ to }) => {
    io.to(`user:${to}`).emit('typing_start', {
      from: userId,
      name: socket.user.name,
    });
  });

  socket.on('typing_stop', ({ to }) => {
    io.to(`user:${to}`).emit('typing_stop', {
      from: userId,
    });
  });

  socket.on('send_message', async (payload, callback) => {
    try {
      const savedMessage = await createChatMessage({
        workspaceId,
        senderId: userId,
        receiverId: payload.receiverId,
        message: payload.message,
        messageType: payload.messageType,
        attachment: payload.attachment,
      });

      io.to(`user:${savedMessage.receiverId.id}`).emit('receive_message', savedMessage);

      await processUserAction({
        userId,
        workspaceId,
        module: 'chat',
        actionType: 'chat.message_sent',
        metadata: {
          messageId: savedMessage.id,
          receiverId: savedMessage.receiverId.id,
          receiverName: savedMessage.receiverId.name,
          message: savedMessage.message,
          normalizedMessage: normalizeText(savedMessage.message),
        },
      });

      await recordActivity({
        workspaceId,
        userId,
        module: 'chat',
        action: 'chat.message_sent',
        entityType: 'chat',
        entityId: savedMessage.id,
        description: `${socket.user.name} messaged ${savedMessage.receiverId.name}.`,
      });

      await sendNotification({
        io,
        workspaceId,
        userId: savedMessage.receiverId.id,
        type: 'chat_message',
        title: `New message from ${socket.user.name}`,
        message:
          savedMessage.messageType === 'file'
            ? 'A file was shared with you in chat.'
            : savedMessage.message,
        link: '/chat',
        metadata: {
          senderId: userId,
          messageId: savedMessage.id,
        },
      });

      callback?.({ ok: true, message: savedMessage });
    } catch (error) {
      callback?.({ ok: false, error: error.message });
    }
  });

  socket.on('notification:read', (notificationId) => {
    socket.broadcast.to(`workspace:${workspaceId}`).emit('notification:ack', {
      notificationId,
      userId,
    });
  });

  socket.on('disconnect', () => {
    const sockets = userSockets.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (!sockets.size) {
        userSockets.delete(userId);
      }
    }

    untrackPresence(workspaceId, userId, socket.id);
    emitOnlineUsers(io, workspaceId);
  });
};
