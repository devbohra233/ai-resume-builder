import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 90_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vitae.token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && localStorage.getItem('vitae.token')) {
      window.dispatchEvent(new Event('vitae:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export function apiError(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.code === 'ECONNABORTED') return 'The request took too long. Please try again.';
  if (error?.message === 'Network Error') return 'Could not reach the server. Is the API running?';
  return error?.message || fallback;
}
