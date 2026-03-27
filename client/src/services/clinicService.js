import api from './api.js';

const clinicService = {
  getPatients: async (params) => {
    const { data } = await api.get('/patients', {
      params,
    });
    return data;
  },
  createPatient: async (payload) => {
    const { data } = await api.post('/patients', payload);
    return data;
  },
  updatePatient: async (patientId, payload) => {
    const { data } = await api.put(`/patients/${patientId}`, payload);
    return data;
  },
};

export default clinicService;
