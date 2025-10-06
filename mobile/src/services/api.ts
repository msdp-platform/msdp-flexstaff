import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Update this URL based on your backend
const API_URL = __DEV__
  ? 'http://localhost:3000/api'  // For iOS simulator
  // ? 'http://10.0.2.2:3000/api'  // For Android emulator
  : 'https://api.flexstaff.co.uk/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Shift API
export const shiftAPI = {
  getShifts: (params?: any) => api.get('/shifts', { params }),
  getShift: (id: string) => api.get(`/shifts/${id}`),
  createShift: (data: any) => api.post('/shifts', data),
  updateShift: (id: string, data: any) => api.put(`/shifts/${id}`, data),
  deleteShift: (id: string) => api.delete(`/shifts/${id}`),
  publishShift: (id: string) => api.post(`/shifts/${id}/publish`),
};

// Application API
export const applicationAPI = {
  applyForShift: (data: any) => api.post('/applications', data),
  getApplications: (params?: any) => api.get('/applications', { params }),
  acceptApplication: (id: string) => api.post(`/applications/${id}/accept`),
  rejectApplication: (id: string) => api.post(`/applications/${id}/reject`),
};

// Timesheet API
export const timesheetAPI = {
  getTimesheets: (params?: any) => api.get('/timesheets', { params }),
  getTimesheet: (id: string) => api.get(`/timesheets/${id}`),
  clockIn: (id: string) => api.post(`/timesheets/${id}/clock-in`),
  clockOut: (id: string, data: any) => api.post(`/timesheets/${id}/clock-out`, data),
  submitTimesheet: (id: string) => api.post(`/timesheets/${id}/submit`),
  approveTimesheet: (id: string) => api.post(`/timesheets/${id}/approve`),
  rejectTimesheet: (id: string, data: any) => api.post(`/timesheets/${id}/reject`, data),
};

// Message API
export const messageAPI = {
  sendMessage: (data: any) => api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId: string, params?: any) => api.get(`/messages/${userId}`, { params }),
  markAsRead: (id: string) => api.put(`/messages/${id}/read`),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

// Notification API
export const notificationAPI = {
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

// Team API
export const teamAPI = {
  getMyTeam: () => api.get('/teams/my-team'),
  getMyTeams: () => api.get('/teams/my-teams'),
  addWorkerToTeam: (data: any) => api.post('/teams', data),
  removeWorkerFromTeam: (id: string) => api.delete(`/teams/${id}`),
  updateTeamMember: (id: string, data: any) => api.put(`/teams/${id}`, data),
};

// Rating API
export const ratingAPI = {
  createRating: (data: any) => api.post('/ratings', data),
  getUserRatings: (userId: string, params?: any) => api.get(`/ratings/user/${userId}`, { params }),
  getWorkerRatings: (workerId: string) => api.get(`/ratings/worker/${workerId}`),
  getEmployerRatings: (employerId: string) => api.get(`/ratings/employer/${employerId}`),
};

// Payment API
export const paymentAPI = {
  getPayments: (params?: any) => api.get('/payments', { params }),
  getPayment: (id: string) => api.get(`/payments/${id}`),
  createStripeAccount: (data: any) => api.post('/payments/stripe/account', data),
  getStripeAccountStatus: () => api.get('/payments/stripe/account/status'),
};
