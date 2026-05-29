import { Avatar } from '@/shared/components/Avatar';
import type { User } from '../types';

interface ProfileCardProps {
  user: User;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || 'No name set';

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
      <Avatar
        firstName={user.firstName ?? ''}
        lastName={user.lastName ?? ''}
        profilePictureUrl={user.profilePictureUrl}
        size="lg"
      />

      {/* Info */}
      <div className="min-w-0">
        <p className="text-base font-semibold text-neutral-900 truncate">{fullName}</p>
        <p className="text-sm text-neutral-500 truncate">{user.email}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {user.roles.map((role) => (
            <span
              key={role}
              className={
                role === 'doctor'
                  ? 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-100 text-violet-700'
                  : 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-sky-100 text-sky-700'
              }
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
