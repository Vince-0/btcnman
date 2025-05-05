'use client';

import axios from 'axios';

// Create an Axios instance with custom configuration
const api = axios.create({
  baseURL: '/api', // Use the Next.js API proxy
  timeout: 60000, // Increase timeout to 60 seconds (2x the original 30 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('Request timed out. Consider increasing the timeout value.');
    }
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Redirect to login page if we're in the browser
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
