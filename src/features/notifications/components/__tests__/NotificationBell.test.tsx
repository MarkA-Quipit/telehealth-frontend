import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { NotificationBell } from '../NotificationBell';

// Radix Popover uses a Portal — replace with simple wrappers so tests stay in-tree
vi.mock('@radix-ui/react-popover', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? children : <div>{children}</div>,
  Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Content: ({ children, align: _a, sideOffset: _s, className }: { children: React.ReactNode; align?: string; sideOffset?: number; className?: string }) =>
    <div data-testid="popover-content" className={className}>{children}</div>,
}));

// Mock pusher-js
vi.mock('pusher-js', () => {
  class FakePusher {
    subscribe = vi.fn(() => ({ bind: vi.fn(), unbind: vi.fn() }));
    unsubscribe = vi.fn();
  }
  return { default: FakePusher };
});

// Mock AuthProvider
vi.mock('@/app/providers/AuthProvider', () => ({
  useAuthContext: () => ({ user: { id: 'user-1', email: 'pat@test.com', roles: ['patient'] } }),
}));

// Mock useNotifications hook
const mockUseNotifications = vi.fn();
vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: (...args: unknown[]) => mockUseNotifications(...args),
}));

// Mock NotificationList to keep content minimal
vi.mock('../NotificationList', () => ({ // one level up within components/
  NotificationList: () => <div data-testid="notification-list">Notifications</div>,
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

const baseReturn = {
  items: [],
  total: 0,
  unreadCount: 0,
  isLoading: false,
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  deleteNotification: vi.fn(),
  isDeleting: false,
  deletingId: undefined,
};

describe('NotificationBell', () => {
  beforeEach(() => {
    mockUseNotifications.mockReturnValue(baseReturn);
  });

  it('renders the bell button with aria-label', () => {
    render(<NotificationBell />, { wrapper: makeWrapper() });
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('hides the unread badge when unreadCount is 0', () => {
    render(<NotificationBell />, { wrapper: makeWrapper() });
    expect(screen.queryByLabelText(/unread notifications/i)).not.toBeInTheDocument();
  });

  it('shows the correct count in the unread badge', () => {
    mockUseNotifications.mockReturnValue({ ...baseReturn, unreadCount: 5 });
    render(<NotificationBell />, { wrapper: makeWrapper() });
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows 99+ when unreadCount exceeds 99', () => {
    mockUseNotifications.mockReturnValue({ ...baseReturn, unreadCount: 120 });
    render(<NotificationBell />, { wrapper: makeWrapper() });
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders the NotificationList after opening the popover', async () => {
    render(<NotificationBell />, { wrapper: makeWrapper() });
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await waitFor(() => {
      expect(screen.getByTestId('notification-list')).toBeInTheDocument();
    });
  });
});
