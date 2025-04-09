// httpClient.ts
import axios from 'axios';

// Debug
console.log('Environment variables in httpClient:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
});

// IMPORTANT: Override the environment variable with the correct server URL
const baseURL = 'http://192.168.1.198:5001/api';
console.log('Using hardcoded baseURL:', baseURL);

const httpClient = axios.create({
  baseURL: baseURL
});

// Optional interceptors
httpClient.interceptors.request.use(config => {  
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  response => response,
  error => {
    // Handle or log errors globally
    console.error('API request failed:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default httpClient;


