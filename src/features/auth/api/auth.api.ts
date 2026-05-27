import { apiFetch } from '../../../shared/lib/api';
import type { LoginDto, RegisterDto, AuthUser } from '../types';

interface AuthEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface AuthData {
  token: string;
  user: AuthUser;
}

export async function login(dto: LoginDto): Promise<AuthData> {
  const res = await apiFetch<AuthEnvelope<AuthData>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return res.data;
}

export async function register(dto: RegisterDto): Promise<AuthData> {
  const res = await apiFetch<AuthEnvelope<AuthData>>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return res.data;
}

export async function getMe(): Promise<AuthUser> {
  const res = await apiFetch<AuthEnvelope<AuthUser>>('/api/auth/me');
  return res.data;
}
