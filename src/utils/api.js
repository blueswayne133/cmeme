import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  // Better way to check if this is an admin route
  const isAdminRoute = config.url?.startsWith('/admin') || config.url?.includes('/admin/');
  const token = localStorage.getItem(isAdminRoute ? 'adminToken' : 'authToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('API Request:', config.url, 'Token:', token ? 'Present' : 'Missing');
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  response => {
    console.log('API Response Success:', response.config.url, response.status);
    return response;
  },
  error => {
    console.log('API Response Error:', error.config?.url, error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      const isAdminRoute = error.config?.url?.includes('/admin/');
      
      if (isAdminRoute) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;