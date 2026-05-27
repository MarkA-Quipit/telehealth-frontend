import { useState } from 'react';
import { Bell } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { NotificationList } from './NotificationList';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();

  const badgeCount = Math.min(unreadCount, 99);
  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="relative flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold px-0.5 leading-none"
              aria-label={`${badgeCount} unread notifications`}
            >
              {badgeLabel}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 rounded-xl border border-neutral-200 bg-white shadow-md outline-none"
        >
          <NotificationList
            notifications={notifications}
            unreadCount={unreadCount}
            isLoading={isLoading}
            markRead={markRead}
            markAllRead={markAllRead}
            onClose={() => setOpen(false)}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
