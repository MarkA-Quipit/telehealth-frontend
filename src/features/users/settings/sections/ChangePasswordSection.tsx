import { useState, useEffect } from 'react';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/shared/components/UnsavedChangesDialog';
import { toast } from 'sonner';
import { useChangePassword } from '../../hooks/useUser';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface ChangePasswordSectionProps {
  userId: string;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function ChangePasswordSection({ userId, onDirtyChange }: ChangePasswordSectionProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const { mutateAsync: doChangePassword, isPending } = useChangePassword();

  const isDirty = currentPassword !== '' || newPassword !== '';

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const { blocker } = useUnsavedChanges(isDirty);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await doChangePassword({ id: userId, currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    }
  }

  return (
    <>
    <UnsavedChangesDialog blocker={blocker} />
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
      <h3 className="text-base font-semibold text-neutral-900">Change Password</h3>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">Current Password</label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="h-10"
          placeholder="Enter current password"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">New Password</label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-10"
          placeholder="Minimum 8 characters"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || !currentPassword || !newPassword}
        className="disabled:cursor-not-allowed"
      >
        {isPending ? 'Updating…' : 'Change Password'}
      </Button>
    </form>
    </>
  );
}
