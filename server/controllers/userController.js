import { listUsersExcept } from '../repositories/usersRepository.js';
import { getOnlineUserIds } from '../sockets/chatSocket.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await listUsersExcept(req.user._id);

    res.json({
      success: true,
      users,
      onlineUserIds: getOnlineUserIds(),
    });
  } catch (error) {
    next(error);
  }
};
