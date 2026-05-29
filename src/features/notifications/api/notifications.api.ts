import api from '@/shared/lib/api';
import type { Notification } from '../types';

export async function getNotifications(): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const { data } = await api.get('/api/notifications');
  return data.data;
}

export async function markRead(id: string): Promise<void> {
  await api.patch(`/api/notifications/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  await api.patch('/api/notifications/read-all');
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/api/notifications/${id}`);
}
