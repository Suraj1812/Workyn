import api from './api.js';

const notificationsService = {
  getNotifications: async (params) => {
    const { data } = await api.get('/notifications', {
      params,
    });
    return data;
  },
  markRead: async (notificationId) => {
    const { data } = await api.post(`/notifications/${notificationId}/read`);
    return data;
  },
  markAllRead: async () => {
    const { data } = await api.post('/notifications/read-all');
    return data;
  },
};

export default notificationsService;
