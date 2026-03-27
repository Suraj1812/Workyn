import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import notificationsService from '../services/notificationsService.js';
import { connectSocket } from '../services/socket.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = async (params) => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await notificationsService.getNotifications(params);
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const socket = connectSocket();

    const handleNotification = (notification) => {
      setNotifications((previous) => [notification, ...previous].slice(0, 25));
      setUnreadCount((previous) => previous + 1);
      showToast({
        severity: 'info',
        message: notification.title,
      });
    };

    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('notification:new', handleNotification);
    };
  }, [showToast, user?.id]);

  const markNotificationRead = async (notificationId) => {
    await notificationsService.markRead(notificationId);
    setNotifications((previous) =>
      previous.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
    );
    setUnreadCount((previous) => Math.max(previous - 1, 0));
  };

  const markAllRead = async () => {
    await notificationsService.markAllRead();
    setNotifications((previous) => previous.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      refreshNotifications,
      markNotificationRead,
      markAllRead,
    }),
    [loading, notifications, unreadCount],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider.');
  }

  return context;
};
