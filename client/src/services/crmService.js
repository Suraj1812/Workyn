import api from './api.js';

const crmService = {
  getLeads: async () => {
    const { data } = await api.get('/crm');
    return data;
  },
  createLead: async (payload) => {
    const { data } = await api.post('/crm', payload);
    return data;
  },
  updateLead: async (leadId, payload) => {
    const { data } = await api.put(`/crm/${leadId}`, payload);
    return data;
  },
  deleteLead: async (leadId) => {
    const { data } = await api.delete(`/crm/${leadId}`);
    return data;
  },
};

export default crmService;
