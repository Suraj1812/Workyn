import { processUserAction } from '../ai-engine/services/behaviorTracker.js';
import { normalizeText } from '../ai-engine/utils/normalizers.js';
import jwt from 'jsonwebtoken';

import { findUserById } from '../repositories/usersRepository.js';
import { createChatMessage } from '../utils/chat.js';

const onlineUsers = new Map();

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

export const getUserSocketIds = (userId) => Array.from(onlineUsers.get(userId) || []);
export const getOnlineUserIds = () => Array.from(onlineUsers.keys());

const emitOnlineUsers = (io) => {
  io.emit('users:online', getOnlineUserIds());
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
    const user = await findUserById(decoded.id);

    if (!user) {
      return next(new Error('Unauthorized'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Unauthorized'));
  }
};

export const registerChatHandlers = (io, socket) => {
  const userId = socket.user._id;

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socket.id);
  emitOnlineUsers(io);

  socket.on('typing_start', ({ to }) => {
    getUserSocketIds(to).forEach((socketId) => {
      io.to(socketId).emit('typing_start', {
        from: userId,
        name: socket.user.name,
      });
    });
  });

  socket.on('typing_stop', ({ to }) => {
    getUserSocketIds(to).forEach((socketId) => {
      io.to(socketId).emit('typing_stop', {
        from: userId,
      });
    });
  });

  socket.on('send_message', async (payload, callback) => {
    try {
      const savedMessage = await createChatMessage({
        senderId: userId,
        receiverId: payload.receiverId,
        message: payload.message,
      });

      getUserSocketIds(savedMessage.receiverId._id).forEach((socketId) => {
        io.to(socketId).emit('receive_message', savedMessage);
      });

      await processUserAction({
        userId,
        module: 'chat',
        actionType: 'chat.message_sent',
        metadata: {
          messageId: savedMessage._id,
          receiverId: savedMessage.receiverId._id,
          receiverName: savedMessage.receiverId.name,
          message: savedMessage.message,
          normalizedMessage: normalizeText(savedMessage.message),
        },
      });

      callback?.({ ok: true, message: savedMessage });
    } catch (error) {
      callback?.({ ok: false, error: error.message });
    }
  });

  socket.on('disconnect', () => {
    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userId);
      }
    }

    emitOnlineUsers(io);
  });
};
