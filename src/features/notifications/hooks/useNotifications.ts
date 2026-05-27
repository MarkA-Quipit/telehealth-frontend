import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import * as notificationsApi from '../api/notifications.api';
import type { NotificationType } from '../types';

// ---------------------------------------------------------------------------
// Pusher client — instantiated once at module level, never inside a hook render
// ---------------------------------------------------------------------------
const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_KEY as string, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER as string,
});

const NOTIFICATION_EVENTS: NotificationType[] = [
  'appointment_booked',
  'appointment_confirmed',
  'appointment_cancelled',
  'appointment_completed',
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useNotifications() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // ── Fetch persisted list ─────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.notifications.all(),
    queryFn: notificationsApi.getNotifications,
    enabled: !!user,
  });

  // ── Pusher subscription — subscribe on mount, unsubscribe on unmount ─────
  useEffect(() => {
    if (!user) return;

    const channel = pusherClient.subscribe(`user-${user.id}`);

    for (const event of NOTIFICATION_EVENTS) {
      channel.bind(event, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all() });
      });
    }

    return () => {
      pusherClient.unsubscribe(`user-${user.id}`);
    };
  }, [user, queryClient]);

  // ── markRead mutation ────────────────────────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all() }),
  });

  // ── markAllRead mutation ─────────────────────────────────────────────────
  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all() }),
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    markRead: (id: string) => markReadMutation.mutate(id),
    markAllRead: () => markAllReadMutation.mutate(),
  };
}
