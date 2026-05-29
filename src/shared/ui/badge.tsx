import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-neutral-100 text-neutral-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger:  'bg-red-100 text-red-700',
        info:    'bg-sky-100 text-sky-700',
        neutral: 'bg-neutral-100 text-neutral-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
