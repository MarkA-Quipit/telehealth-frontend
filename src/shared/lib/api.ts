import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type AxiosLike = {
  response?: { status?: number; data?: { message?: unknown } };
  config?: { _retry?: boolean; url?: string; headers?: Record<string, string> } & Record<string, unknown>;
  message?: string;
};

// Combined interceptor:
// 1. On 401 (non-refresh endpoint, first attempt): exchange refresh token for new access token and retry.
// 2. Always: unwrap the server's { message } so callers get a plain Error with the backend message.
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axErr = error as AxiosLike;
    const isRefreshEndpoint = axErr.config?.url?.includes('/auth/refresh');

    if (axErr.response?.status === 401 && !axErr.config?._retry && !isRefreshEndpoint) {
      axErr.config!._retry = true;
      const stored = localStorage.getItem('refreshToken');
      if (stored) {
        try {
          const res = await api.post<{ success: boolean; data: { accessToken: string } }>(
            '/api/auth/refresh',
            { refreshToken: stored },
          );
          const newToken = res.data.data.accessToken;
          localStorage.setItem('token', newToken);
          if (axErr.config!.headers) {
            axErr.config!.headers['Authorization'] = `Bearer ${newToken}`;
          }
          return api(axErr.config as unknown as Parameters<typeof api>[0]);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
    }

    const serverMessage =
      typeof axErr.response?.data?.message === 'string'
        ? axErr.response.data.message
        : axErr.message ?? 'Request failed';
    return Promise.reject(new Error(serverMessage));
  },
);

export default api;