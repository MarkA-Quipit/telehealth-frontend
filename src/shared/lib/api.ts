import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap the server's { message } from error responses so callers always
// get a plain Error with the backend's message string (not axios's default).
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const serverMessage =
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
        ? (error as { response: { data: { message: string } } }).response.data.message
        : error instanceof Error
          ? error.message
          : 'Request failed';
    return Promise.reject(new Error(serverMessage));
  },
);

export default api;