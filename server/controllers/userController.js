import { listUsersExcept } from '../repositories/usersRepository.js';
import { getOnlineUserIds } from '../sockets/chatSocket.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await listUsersExcept({
      userId: req.user.id || req.user._id,
      workspaceId: req.workspace.id,
    });

    res.json({
      success: true,
      users,
      onlineUserIds: getOnlineUserIds(req.workspace.id),
    });
  } catch (error) {
    next(error);
  }
};
