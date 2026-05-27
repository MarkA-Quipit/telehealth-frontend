import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-8">
        {children}
      </div>
    </div>
  );
}
