import api from '@/shared/lib/api';
import type { User, UpdateUserDto } from '../types';

export async function getUser(id: string): Promise<User> {
  const { data } = await api.get(`/api/users/${id}`);
  return data.data;
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<User> {
  const { data } = await api.put(`/api/users/${id}`, dto);
  return data.data;
}

export async function changePassword(id: string, dto: { currentPassword: string; newPassword: string }): Promise<void> {
  await api.post(`/api/users/${id}/change-password`, dto);
}

export async function uploadAvatar(id: string, file: File): Promise<User> {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.post(`/api/users/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}