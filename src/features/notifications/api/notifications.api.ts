import api from '@/shared/lib/api';
import type { Notification } from '../types';

export interface NotificationsPage {
  items: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export async function getNotifications(type?: string, page = 1, limit = 20): Promise<NotificationsPage> {
  const params: Record<string, string | number> = { page, limit };
  if (type) params.type = type;
  const { data } = await api.get('/api/notifications', { params });
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
