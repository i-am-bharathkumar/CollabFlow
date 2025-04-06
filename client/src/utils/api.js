import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Axios API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 10000
});

// Socket.IO instance
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  autoConnect: false, // We'll manually connect after auth
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    const authRoutes = ['/auth/login', '/auth/register'];
    const isAuthRoute = authRoutes.some(path => config.url.includes(path));
    
    if (!isAuthRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        
        // Auto-connect socket if not connected
        if (!socket.connected && socket.disconnected) {
          socket.auth = { token };
          socket.connect();
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      error.message = 'Network Error - Please check your connection';
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    
    // Enhanced error handling
    const errorMap = {
      400: data.message || 'Bad Request',
      401: () => {
        api.clearAuth();
        socket.disconnect();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?sessionExpired=true';
        }
        return 'Session expired - Please login again';
      },
      403: data.message || 'Forbidden - Insufficient permissions',
      404: data.message || 'Resource Not Found',
      409: data.message || 'Conflict - Version mismatch',
      500: data.message || 'Internal Server Error',
      default: data.message || `Request failed (${status})`
    };

    error.message = typeof errorMap[status] === 'function' 
      ? errorMap[status]() 
      : errorMap[status] || errorMap.default;

    // Log to error tracking service if available
    // if (window.Sentry) window.Sentry.captureException(error);
    
    return Promise.reject(error);
  }
);

// Auth token management
api.setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  } else {
    api.clearAuth();
  }
};

api.clearAuth = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
  socket.disconnect();
};

// Socket.IO event helpers
const socketHelpers = {
  subscribe(event, callback) {
    socket.on(event, callback);
    return () => socket.off(event, callback);
  },
  emit(event, data) {
    return new Promise((resolve) => {
      socket.emit(event, data, (response) => {
        resolve(response);
      });
    });
  },
  getSocket() {
    return socket;
  }
};

// Document API helpers
const documentAPI = {
  async createDocument(docData) {
    return api.post('/documents', docData);
  },
  async getDocuments() {
    return api.get('/documents');
  },
  async getDocument(id) {
    return api.get(`/documents/${id}`);
  },
  async updateDocument(id, changes) {
    return api.patch(`/documents/${id}`, changes);
  }
};

// Combine all exports
export { 
  api as default, 
  socketHelpers, 
  documentAPI,
  API_BASE_URL,
  socket // Direct access when needed
};