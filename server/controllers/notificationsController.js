import {
  countUnreadNotifications,
  listNotificationsByUser,
  markAllNotificationsRead,
  markNotificationAsRead,
} from '../repositories/notificationsRepository.js';

export const getNotifications = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const unreadOnly = req.query.unreadOnly === true || req.query.unreadOnly === 'true';
    const notifications = await listNotificationsByUser(req.user.id, {
      limit,
      offset: (page - 1) * limit,
      unreadOnly,
    });
    const unreadCount = await countUnreadNotifications(req.user.id);

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await markNotificationAsRead(req.params.id, req.user.id);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found.');
    }

    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    await markAllNotificationsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
