import { DropdownMenu } from 'radix-ui';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useUser } from '../../../features/users/hooks/useUser';
import { NotificationBell } from '../../../features/notifications/components/NotificationBell';
import { SidebarTrigger } from '../../ui/sidebar';
import { Avatar } from '../Avatar';

export function Header() {
  const { user, logout } = useAuth();
  const { data: profile } = useUser(user?.id);

  const firstName = profile?.firstName ?? user?.email?.split('@')[0] ?? '';
  const lastName = profile?.lastName ?? '';
  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ''}`
    : (user?.email ?? '');

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1"
              aria-label="User menu"
            >
              <Avatar
                firstName={firstName}
                lastName={lastName}
                profilePictureUrl={profile?.profilePictureUrl}
                size="xs"
              />
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-neutral-700 sm:block">
                {displayName}
              </span>
              <ChevronDown className="hidden size-3.5 shrink-0 text-neutral-400 sm:block" />
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
