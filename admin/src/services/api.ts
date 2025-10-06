import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('admin-auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin-auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getRevenue: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/admin/dashboard/revenue', { params }),
};

// User Management APIs
export const userAPI = {
  getAll: (params?: { role?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/admin/users', { params }),
  getById: (id: number) => api.get(`/admin/users/${id}`),
  updateStatus: (id: number, status: string) =>
    api.put(`/admin/users/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/admin/users/${id}`),
};

// Shift Management APIs
export const shiftAPI = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/admin/shifts', { params }),
  delete: (id: number) => api.delete(`/admin/shifts/${id}`),
};

// Payment Management APIs
export const paymentAPI = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/admin/payments', { params }),
};

// Dispute Management APIs
export const disputeAPI = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/admin/disputes', { params }),
};

// Settings APIs
export const settingsAPI = {
  get: () => api.get('/admin/settings'),
  update: (settings: any) => api.put('/admin/settings', settings),
};

export default api;
