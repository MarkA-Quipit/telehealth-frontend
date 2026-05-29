import * as React from 'react';
import { cn } from '../lib/utils';

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'w-full rounded-lg bg-neutral-100 px-3 text-sm outline-none transition appearance-none',
        'focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
