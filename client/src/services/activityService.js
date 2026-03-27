import api from './api.js';

const activityService = {
  getActivity: async (params) => {
    const { data } = await api.get('/activity', {
      params,
    });
    return data;
  },
};

export default activityService;
