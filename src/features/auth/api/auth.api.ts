import api from '../../../shared/lib/api';
import type { LoginDto, RegisterDto, AuthUser } from '../types';

interface AuthEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export async function login(dto: LoginDto): Promise<AuthData> {
  const res = await api.post<AuthEnvelope<AuthData>>('/api/auth/login', dto);
  return res.data.data;
}

export async function register(dto: RegisterDto): Promise<AuthData> {
  const res = await api.post<AuthEnvelope<AuthData>>('/api/auth/register', dto);
  return res.data.data;
}

export async function getMe(): Promise<AuthUser> {
  const res = await api.get<AuthEnvelope<AuthUser>>('/api/auth/me');
  return res.data.data;
}

export async function callRefreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  const res = await api.post<AuthEnvelope<{ accessToken: string }>>('/api/auth/refresh', { refreshToken });
  return res.data.data;
}

export async function callLogout(refreshToken: string): Promise<void> {
  await api.post('/api/auth/logout', { refreshToken });
}

export async function logoutAll(): Promise<void> {
  await api.post('/api/auth/logout-all');
}