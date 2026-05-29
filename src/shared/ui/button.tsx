import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition disabled:opacity-50 disabled:pointer-events-none shrink-0 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1',
  {
    variants: {
      variant: {
        primary:     'bg-sky-100 text-sky-700 hover:bg-sky-200',
        secondary:   'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
        destructive: 'bg-red-50 text-red-600 hover:bg-red-100',
        ghost:       'text-neutral-700 hover:bg-neutral-100',
      },
      size: {
        default: 'px-4 py-2 text-sm rounded-lg',
        sm:      'px-3 py-1.5 text-xs rounded-lg',
        icon:    'p-2 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
