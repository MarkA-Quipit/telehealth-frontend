import type { ReactNode } from 'react';

const PADDING = {
  sm: 'py-8',
  md: 'py-10',
  lg: 'py-16',
} as const;

interface EmptyStateProps {
  icon: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  padding?: keyof typeof PADDING;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  padding = 'lg',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${PADDING[padding]} text-center`}>
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      {title && <h3 className="text-sm font-semibold text-neutral-900 mb-1">{title}</h3>}
      {description && <p className="text-sm text-neutral-500 mb-4">{description}</p>}
      {action}
    </div>
  );
}
