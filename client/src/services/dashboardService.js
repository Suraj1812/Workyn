import api from './api.js';

const dashboardService = {
  getSummary: async () => {
    const { data } = await api.get('/dashboard');
    return data;
  },
  getAnalytics: async () => {
    const { data } = await api.get('/dashboard/analytics');
    return data;
  },
};

export default dashboardService;
