import { DropdownMenu } from 'radix-ui';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { NotificationBell } from '../../../features/notifications/components/NotificationBell';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background text-sm font-bold select-none">
          T
        </div>
        <span className="text-sm font-semibold">Telehealth</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <NotificationBell />

        {/* User dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
              aria-label="User menu"
            >
              {user?.email.charAt(0).toUpperCase() ?? '?'}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-48 rounded-lg border border-border bg-popover p-1 shadow-md"
            >
              <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item
                onSelect={logout}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 outline-none select-none"
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}