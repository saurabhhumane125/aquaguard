import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  sendOTP: (identifier: string, type: 'email' | 'phone') => 
    api.post('/auth/send-otp', { identifier, type }),
    
  verifyOTP: (identifier: string, code: string, name?: string) => 
    api.post('/auth/verify-otp', { identifier, code, name }),
    
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (data: { name?: string }) => 
    api.put('/auth/profile', data),
    
  logout: () => api.post('/auth/logout'),
  
  getLeaderboard: () => api.get('/auth/leaderboard')
};

// Leak API calls
export const leakAPI = {
  createLeak: (formData: FormData) => 
    api.post('/leaks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  getLeaks: (params?: { status?: string; bounds?: string; limit?: string }) => 
    api.get('/leaks', { params }),
    
  getMyLeaks: () => api.get('/leaks/my'),
  getLeakById: (id: string) => api.get(`/leaks/${id}`),
  upvoteLeak: (id: string) => api.post(`/leaks/${id}/upvote`)
};
