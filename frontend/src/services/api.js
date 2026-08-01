import axios from 'axios';

// Tenta ler de window.CONFIG (runtime) ou import.meta.env (build/dev)
export const getEnv = (name, fallback = null) => {
  try {
    // Check window.CONFIG first
    if (typeof window !== 'undefined' && window.CONFIG && window.CONFIG[name]) {
      return window.CONFIG[name];
    }
    // Then check import.meta.env
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
      return import.meta.env[name];
    }
    return fallback;
  } catch (e) {
    return fallback;
  }
};

export const API_BASE = window.CONFIG?.VITE_API_URL || import.meta.env.VITE_API_URL || 'https://apigrupo.aryaraj.shop';
export const API_KEY = window.CONFIG?.VITE_API_SECRET || import.meta.env.VITE_API_SECRET;

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: API_KEY ? { 'x-api-key': API_KEY } : {}
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (API_KEY) {
    config.headers['x-api-key'] = API_KEY;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.dispatchEvent(new CustomEvent('auth-error'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
