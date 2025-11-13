import axios from 'axios';

// CRITICAL FIX: Ensure the API URL is defined, default to 5000 where Node.js runs
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- CRITICAL REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    // 1. Retrieve the token from local storage
    const token = localStorage.getItem('token'); 
    
    // 2. If a token exists, attach it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Optional: Handle 401/403 errors globally (e.g., force logout)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // You would typically redirect the user to the login page here
        console.warn("Unauthorized access or token expired. Forcing logout logic.");
    }
    
    return Promise.reject(error);
  }
);

export default api;