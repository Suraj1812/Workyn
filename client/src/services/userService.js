import api from './api.js';

const userService = {
  getUsers: async () => {
    const { data } = await api.get('/users');
    return data;
  },
};

export default userService;
