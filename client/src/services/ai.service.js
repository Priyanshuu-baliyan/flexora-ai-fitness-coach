import api from './api';

export const aiService = {
  generateWorkout: (data) => api.post(`/ai/workout?_t=${Date.now()}`, data, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  }),
  generateDiet: (data) => api.post(`/ai/diet?_t=${Date.now()}`, data, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  }),
};

export default aiService;
