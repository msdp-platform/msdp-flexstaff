import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth services
export const authService = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Shift services
export const shiftService = {
  getShifts: (params?: any) => api.get('/shifts', { params }),
  getShift: (id: string) => api.get(`/shifts/${id}`),
  createShift: (data: any) => api.post('/shifts', data),
  updateShift: (id: string, data: any) => api.put(`/shifts/${id}`, data),
  deleteShift: (id: string) => api.delete(`/shifts/${id}`),
  publishShift: (id: string) => api.post(`/shifts/${id}/publish`),
};

// Application services
export const applicationService = {
  applyForShift: (data: any) => api.post('/applications', data),
  getApplications: (params?: any) => api.get('/applications', { params }),
  acceptApplication: (id: string) => api.post(`/applications/${id}/accept`),
  rejectApplication: (id: string) => api.post(`/applications/${id}/reject`),
};
