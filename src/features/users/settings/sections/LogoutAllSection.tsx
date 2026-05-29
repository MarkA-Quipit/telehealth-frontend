import { useState } from 'react';
import { useLogoutAll } from '@/features/auth/hooks/useAuth';
import { Button } from '@/shared/ui/button';

export function LogoutAllSection() {
  const [confirming, setConfirming] = useState(false);
  const { mutate: doLogoutAll, isPending } = useLogoutAll();

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
      <div>
        <h3 className="text-base font-semibold text-neutral-900">Sign Out Everywhere</h3>
        <p className="text-sm text-neutral-500 mt-0.5">
          Sign out of all active sessions on every device. Use this if you think your account may have been compromised.
        </p>
      </div>

      {confirming ? (
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            onClick={() => doLogoutAll()}
            disabled={isPending}
            className="disabled:cursor-not-allowed"
          >
            {isPending ? 'Signing out…' : 'Confirm — logout all devices'}
          </Button>
          <Button variant="secondary" onClick={() => setConfirming(false)} disabled={isPending}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="destructive" onClick={() => setConfirming(true)}>
          Logout from all devices
        </Button>
      )}
    </div>
  );
}
