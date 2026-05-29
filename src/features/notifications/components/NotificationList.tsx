import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/shared/components/EmptyState';
import {
  CalendarPlus,
  CalendarCheck,
  CalendarX,
  CheckCircle,
  Bell,
  X,
} from 'lucide-react';
import { useAuthContext } from '@/app/providers/AuthProvider';
import type { Notification, NotificationType } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  appointment_booked:    CalendarPlus,
  appointment_confirmed: CalendarCheck,
  appointment_cancelled: CalendarX,
  appointment_completed: CheckCircle,
};

const TYPE_ICON_COLOR: Record<NotificationType, string> = {
  appointment_booked:    'text-sky-500',
  appointment_confirmed: 'text-green-500',
  appointment_cancelled: 'text-red-500',
  appointment_completed: 'text-green-500',
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------
function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 px-3 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-neutral-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-neutral-100 rounded w-2/3" />
        <div className="h-3 bg-neutral-100 rounded w-full" />
        <div className="h-2.5 bg-neutral-100 rounded w-1/4" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter config
// ---------------------------------------------------------------------------
const FILTERS: { label: string; value: string | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Bookings', value: 'appointment_booked' },
  { label: 'Confirmed', value: 'appointment_confirmed' },
  { label: 'Cancellations', value: 'appointment_cancelled' },
  { label: 'Completed', value: 'appointment_completed' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface NotificationListProps {
  allItems: Notification[];
  hasMore: boolean;
  loadMore: () => void;
  unreadCount: number;
  isLoading: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  deletingId?: string;
  onClose?: () => void;
  activeType?: string;
  setActiveType: (type: string | undefined) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function NotificationList({
  allItems,
  hasMore,
  loadMore,
  unreadCount,
  isLoading,
  markRead,
  markAllRead,
  deleteNotification,
  deletingId,
  onClose,
  activeType,
  setActiveType,
}: NotificationListProps) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isDoctor = user?.roles.includes('doctor') ?? false;

  function handleRowClick(n: Notification) {
    const appointmentId = n.data?.appointmentId as string | undefined;
    if (appointmentId) {
      const path = isDoctor
        ? `/doctor/appointments/${appointmentId}`
        : `/patient/appointments/${appointmentId}`;
      navigate(path);
    }
    if (!n.isRead) markRead(n.id);
    onClose?.();
  }

  return (
    <div className="w-80 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-100">
        <span className="text-sm font-semibold text-neutral-900">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-sky-600 hover:text-sky-800 font-medium transition"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-2 py-1.5 border-b border-neutral-100 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setActiveType(f.value)}
            className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
              activeType === f.value
                ? 'bg-sky-100 text-sky-700'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto">
        {isLoading && allItems.length === 0 ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : allItems.length === 0 ? (
          <EmptyState
            padding="md"
            icon={<Bell className="w-6 h-6 text-neutral-400" />}
            description="No notifications yet"
          />
        ) : (
          <>
            {allItems.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Bell;
              const iconColor = TYPE_ICON_COLOR[n.type] ?? 'text-neutral-400';
              const hasAppointment = !!(n.data?.appointmentId);

              return (
                <button
                  key={n.id}
                  onClick={() => handleRowClick(n)}
                  className={`w-full text-left flex items-start gap-3 px-3 py-3 hover:bg-neutral-50 transition border-b border-neutral-50 last:border-0 ${
                    !n.isRead ? 'border-l-2 border-l-sky-400' : ''
                  } ${hasAppointment ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {/* Icon */}
                  <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        !n.isRead ? 'font-medium text-neutral-900' : 'text-neutral-500'
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-neutral-400 mt-1">{relativeTime(n.createdAt)}</p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    disabled={deletingId === n.id}
                    className="shrink-0 p-1 rounded text-neutral-300 hover:text-red-400 hover:bg-red-50 transition disabled:opacity-50"
                    aria-label="Delete notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </button>
              );
            })}

            {/* Load more */}
            {hasMore && (
              <div className="px-3 py-2 border-t border-neutral-100">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="w-full text-xs text-sky-600 hover:text-sky-800 font-medium py-1 transition disabled:opacity-50"
                >
                  {isLoading ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
