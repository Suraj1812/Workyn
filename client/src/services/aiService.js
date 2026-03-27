import api from './api.js';

const aiService = {
  getOverview: async () => {
    const { data } = await api.get('/ai/overview');
    return data;
  },
  getSuggestions: async (params) => {
    const { data } = await api.get('/ai/suggestions', {
      params,
    });
    return data;
  },
  respondToSuggestion: async (suggestionId, accepted) => {
    const { data } = await api.post(`/ai/suggestions/${suggestionId}/respond`, {
      accepted,
    });
    return data;
  },
  getAutomations: async () => {
    const { data } = await api.get('/ai/automations');
    return data;
  },
  updateAutomation: async (automationId, payload) => {
    const { data } = await api.put(`/ai/automations/${automationId}`, payload);
    return data;
  },
  getChatQuickReplies: async (contactId) => {
    const { data } = await api.get('/ai/chat/quick-replies', {
      params: {
        contactId,
      },
    });
    return data;
  },
};

export default aiService;
