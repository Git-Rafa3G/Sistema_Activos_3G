import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Servicios de autenticación
export const authService = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => {
    localStorage.clear();
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
};

// Servicios de activos
export const assetService = {
  getAll: () => api.get('/assets/'),
  getById: (id) => api.get(`/assets/${id}/`),
  create: (data) => api.post('/assets/', data),
  update: (id, data) => api.put(`/assets/${id}/`, data),
  delete: (id) => api.delete(`/assets/${id}/`),
};

// Servicios de empleados
export const employeeService = {
  getAll: () => api.get('/assignments/employees/'),
  getById: (id) => api.get(`/assignments/employees/${id}/`),
  create: (data) => api.post('/assignments/employees/', data),
  update: (id, data) => api.put(`/assignments/employees/${id}/`, data),
  delete: (id) => api.delete(`/assignments/employees/${id}/`),
};

// Servicios de asignaciones
export const assignmentService = {
  getAll: () => api.get('/assignments/'),
  getById: (id) => api.get(`/assignments/${id}/`),
  create: (data) => api.post('/assignments/', data),
  update: (id, data) => api.put(`/assignments/${id}/`, data),
  delete: (id) => api.delete(`/assignments/${id}/`),
  return: (id, notes) => api.post(`/assignments/${id}/`, { return_notes: notes }),
};

// Servicios de mantenimiento
export const maintenanceService = {
  getAll: () => api.get('/maintenance/'),
  getById: (id) => api.get(`/maintenance/${id}/`),
  create: (data) => api.post('/maintenance/', data),
  update: (id, data) => api.put(`/maintenance/${id}/`, data),
  delete: (id) => api.delete(`/maintenance/${id}/`),
  complete: (id, data) => api.post(`/maintenance/${id}/complete/`, data),
};

// Servicios de categorías
export const categoryService = {
  getAll: () => api.get('/categories/'),
  getById: (id) => api.get(`/categories/${id}/`),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.put(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
};

// Servicios de usuarios (admin)
// Servicios de usuarios (admin)
export const userService = {
  getAll: () => api.get('/users/'),
  getById: (id) => api.get(`/users/${id}/`),
  create: (data) => api.post('/users/', data),
  update: (id, data) => api.put(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
};

// Servicios de dashboard
export const dashboardService = {
  getStats: () => api.get('/dashboard/'),
};

export default api;