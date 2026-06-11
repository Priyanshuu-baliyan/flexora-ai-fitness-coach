import api from './api';

export const adminService = {
  getUsers: (page = 1, limit = 20) =>
    api.get(`/admin/users?page=${page}&limit=${limit}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getWorkouts: () => api.get('/admin/workouts'),
  updateWorkout: (id, data) => api.put(`/admin/workouts/${id}`, data),
  getDiets: () => api.get('/admin/diets'),
  updateDiet: (id, data) => api.put(`/admin/diets/${id}`, data),
};

export default adminService;
