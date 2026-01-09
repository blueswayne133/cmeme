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
  // Check if this is an admin route - must start with '/admin' to be treated as admin route
  const url = config.url || '';
  const isAdminRoute = url.startsWith('/admin');
  const token = localStorage.getItem(isAdminRoute ? 'adminToken' : 'authToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('API Request:', config.url, 'IsAdmin:', isAdminRoute, 'Token:', token ? 'Present' : 'Missing');
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
    const url = error.config?.url || '';
    const status = error.response?.status;
    
    // Only handle 401 Unauthorized errors
    if (status === 401) {
      // Determine if this is an admin route - must start with '/admin'
      const isAdminRoute = url.startsWith('/admin');
      
      // Get current path
      const currentPath = window.location.pathname;
      
      // Skip redirect for login endpoints (they handle their own errors)
      if (url === '/login' || url === '/admin/login') {
        return Promise.reject(error);
      }
      
      // Skip redirect if already on auth pages
      if (currentPath === '/auth' || currentPath === '/admin/login') {
        return Promise.reject(error);
      }
      
      // Clear tokens and redirect based on route type
      if (isAdminRoute) {
        // This is an admin API route - redirect to admin login only if on admin pages
        if (currentPath.startsWith('/admin') && !currentPath.includes('/login')) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          window.location.href = '/admin/login';
          return Promise.reject(error);
        }
      } else {
        // This is a user API route - redirect to user auth only if on user dashboard
        if (currentPath.startsWith('/dashboard') && !currentPath.startsWith('/admin')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          window.location.href = '/auth';
          return Promise.reject(error);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;


// Transaction management API calls
export const transactionAPI = {
  // Get all transactions with filters
  getTransactions: (params = {}) => 
    api.get('/admin/transactions', { params }),
  
  // Get single transaction
  getTransaction: (id) => 
    api.get(`/admin/transactions/${id}`),
  
  // Create transaction
  createTransaction: (data) => 
    api.post('/admin/transactions', data),
  
  // Update transaction
  updateTransaction: (id, data) => 
    api.put(`/admin/transactions/${id}`, data),
  
  // Delete transaction
  deleteTransaction: (id) => 
    api.delete(`/admin/transactions/${id}`),
  
  // Get transaction stats
  getTransactionStats: () => 
    api.get('/admin/transactions/stats/summary'),
  
  // Get users for dropdown
  getUsers: (params = {}) => 
    api.get('/admin/users', { params: { ...params, simple: true } }),
};