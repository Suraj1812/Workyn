import api from './api.js';

const workspaceService = {
  getWorkspace: async () => {
    const { data } = await api.get('/workspace');
    return data;
  },
  inviteMember: async (payload) => {
    const { data } = await api.post('/workspace/invite', payload);
    return data;
  },
  acceptInvite: async (token) => {
    const { data } = await api.post(`/workspace/invites/${token}/accept`);
    return data;
  },
  switchWorkspace: async (workspaceId) => {
    const { data } = await api.post('/workspace/switch', {
      workspaceId,
    });
    return data;
  },
  updateWorkspace: async (payload) => {
    const { data } = await api.put('/workspace', payload);
    return data;
  },
};

export default workspaceService;
