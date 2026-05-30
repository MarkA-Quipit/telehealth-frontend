import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

const FEATURE_BULLETS = [
  'Find and book verified doctors online',
  'Secure, private video consultations',
  'Track your health history in one place',
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-800 flex-col justify-between p-10 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-sky-600/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-emerald-500/15 blur-3xl" aria-hidden />

        {/* Brand mark */}
        <div className="relative flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
            <HeartPulse className="size-5" />
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">VitalLink</span>
        </div>

        {/* Main copy */}
        <div className="relative space-y-6">
          <p className="text-3xl font-semibold text-white leading-snug">
            Linking Patients<br />and Providers,<br />Anywhere
          </p>
          <ul className="space-y-3">
            {FEATURE_BULLETS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-slate-300 text-sm">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 text-xs">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative text-slate-500 text-xs">© 2026 VitalLink</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 md:px-10 md:pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-600 transition-colors"
          >
            ← Back to VitalLink
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-10 md:px-10">
          <div className="w-full max-w-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
