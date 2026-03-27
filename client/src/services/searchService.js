import api from './api.js';

const searchService = {
  search: async (queryValue, limit = 8) => {
    const { data } = await api.get('/search', {
      params: {
        q: queryValue,
        limit,
      },
    });
    return data;
  },
};

export default searchService;
