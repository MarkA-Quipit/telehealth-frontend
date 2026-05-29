import * as React from 'react';
import { cn } from '../lib/utils';

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'w-full rounded-lg bg-neutral-100 px-3 text-sm outline-none transition',
        'focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100',
        'disabled:pointer-events-none disabled:opacity-50',
        'placeholder:text-neutral-400',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
