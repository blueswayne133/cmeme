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