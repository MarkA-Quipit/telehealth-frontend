// eslint-disable-next-line react-refresh/only-export-components
export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const f = firstName?.trim()[0]?.toUpperCase() ?? '';
  const l = lastName?.trim()[0]?.toUpperCase() ?? '';
  return f + l || '?';
}

const SIZE_CLASSES = {
  xs: { container: 'w-8 h-8',   text: 'text-xs' },
  sm: { container: 'w-10 h-10', text: 'text-sm' },
  md: { container: 'w-12 h-12', text: 'text-sm' },
  lg: { container: 'w-16 h-16', text: 'text-xl' },
  xl: { container: 'w-20 h-20', text: 'text-2xl' },
} as const;

interface AvatarProps {
  firstName: string;
  lastName: string;
  profilePictureUrl?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function Avatar({
  firstName,
  lastName,
  profilePictureUrl,
  size = 'sm',
  className = '',
}: AvatarProps) {
  const { container, text } = SIZE_CLASSES[size];
  const initials = getInitials(firstName, lastName);

  if (profilePictureUrl) {
    return (
      <img
        src={profilePictureUrl}
        alt={`${firstName} ${lastName}`}
        className={`${container} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${container} rounded-full bg-sky-100 text-sky-700 font-semibold ${text} flex items-center justify-center shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
