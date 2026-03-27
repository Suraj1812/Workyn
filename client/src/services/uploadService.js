import api from './api.js';

const uploadService = {
  uploadFile: async ({ file, module }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', module);

    const { data } = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },
};

export default uploadService;
