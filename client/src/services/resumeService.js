import api from './api.js';

const resumeService = {
  saveResume: async (payload) => {
    const { data } = await api.post('/resume', payload);
    return data;
  },
  getResume: async () => {
    const { data } = await api.get('/resume');
    return data;
  },
};

export default resumeService;
