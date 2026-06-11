import api from './api';

export const progressService = {
  addProgress: (data) => api.post('/progress', data),
  getProgress: () => api.get('/progress'),
};

export default progressService;
