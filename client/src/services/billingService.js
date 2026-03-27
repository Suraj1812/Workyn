import api from './api.js';

const billingService = {
  getOverview: async () => {
    const { data } = await api.get('/billing');
    return data;
  },
  createCheckout: async (plan) => {
    const { data } = await api.post('/billing/checkout', {
      plan,
    });
    return data;
  },
};

export default billingService;
