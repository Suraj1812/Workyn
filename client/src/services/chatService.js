import api from './api.js';

const chatService = {
  getMessages: async (contactId) => {
    const { data } = await api.get('/chat', {
      params: contactId ? { contactId } : undefined,
    });
    return data;
  },
  sendMessage: async (payload) => {
    const { data } = await api.post('/chat', payload);
    return data;
  },
};

export default chatService;
