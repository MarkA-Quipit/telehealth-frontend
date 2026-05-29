import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { NotificationList } from './NotificationList';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../types';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [activeType, setActiveType] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<Notification[]>([]);

  const { items, total, unreadCount, isLoading, markRead, markAllRead, deleteNotification, deletingId } =
    useNotifications(activeType, page);

  // Accumulate pages; reset when type changes (page resets to 1)
  useEffect(() => {
    setAllItems((prev) => (page === 1 ? items : [...prev, ...items]));
  }, [items, page]);

  // Reset to page 1 and clear items when filter type changes
  function handleSetActiveType(type: string | undefined) {
    setActiveType(type);
    setPage(1);
    setAllItems([]);
  }

  const hasMore = allItems.length < total;

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
            allItems={allItems}
            hasMore={hasMore}
            loadMore={() => setPage((p) => p + 1)}
            unreadCount={unreadCount}
            isLoading={isLoading}
            markRead={markRead}
            markAllRead={markAllRead}
            deleteNotification={deleteNotification}
            deletingId={deletingId}
            onClose={() => setOpen(false)}
            activeType={activeType}
            setActiveType={handleSetActiveType}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
