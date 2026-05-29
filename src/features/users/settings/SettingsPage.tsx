import { useState } from 'react';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '../hooks/useUser';
import { FilterTabs } from '@/features/appointments/components/FilterTabs';
import { ChangePasswordSection } from './sections/ChangePasswordSection';
import { SessionsTabContent } from './sections/SessionsTabContent';

const SETTINGS_TABS = ['Security', 'Sessions'] as const;
type SettingsTab = (typeof SETTINGS_TABS)[number];

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-neutral-200 ${className ?? ''}`} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-7 w-48" />
      <SkeletonBlock className="h-8 w-72" />
      <SkeletonBlock className="h-36 w-full" />
    </div>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Security');
  const { user: authUser } = useAuthContext();
  const { data: fullUser, isLoading } = useUser(authUser?.id);

  if (isLoading) return <PageSkeleton />;

  if (!fullUser) {
    return (
      <div className="text-sm text-neutral-500 py-8 text-center">Could not load user data.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Manage your account security and active sessions</p>
      </div>

      <FilterTabs tabs={SETTINGS_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'Security' && (
        <div className="space-y-6">
          <ChangePasswordSection userId={fullUser.id} />
        </div>
      )}

      {activeTab === 'Sessions' && (
        <div className="space-y-6">
          <SessionsTabContent />
        </div>
      )}
    </div>
  );
}
