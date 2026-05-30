import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { RegisterForm } from '../components/RegisterForm';
import { cn } from '@/shared/lib/utils';

type Role = 'patient' | 'doctor';

export function RegisterPage() {
  const [role, setRole] = useState<Role>('patient');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ── Desktop: two content panels (hidden on mobile) ── */}
      <div className="hidden lg:flex h-screen" aria-hidden>
        {/* Left — patient panel */}
        <div className="w-1/2 relative flex flex-col justify-between p-10 bg-slate-900 overflow-hidden">
          {/* Photo placeholder */}
          <img src="/images/register-patient.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/40 to-slate-900/85" />

          {/* Brand */}
          <div className="relative flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500 text-white shadow-sm">
              <HeartPulse className="size-4" />
            </div>
            <span className="font-semibold text-white tracking-tight">VitalLink</span>
          </div>

          {/* Patient quote */}
          <div className="relative space-y-3">
            <p className="text-2xl font-semibold text-white leading-snug">
              "Your health journey<br />starts with the right doctor."
            </p>
            <p className="text-sm text-slate-400">
              Connect with verified specialists and get the care you deserve, anywhere.
            </p>
          </div>
        </div>

        {/* Right — doctor panel */}
        <div className="w-1/2 relative flex flex-col justify-between p-10 bg-sky-950 overflow-hidden">
          {/* Photo placeholder */}
          <img src="/images/register-doctor.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950/85 via-sky-950/40 to-sky-950/85" />

          {/* Spacer for top */}
          <div className="relative" />

          {/* Doctor quote */}
          <div className="relative space-y-3">
            <p className="text-2xl font-semibold text-white leading-snug">
              "Reach more patients.<br />Practice without boundaries."
            </p>
            <p className="text-sm text-sky-300">
              VitalLink puts your practice online — manage appointments and consult from anywhere.
            </p>
          </div>
        </div>
      </div>

      {/* ── Sliding form panel ──
           Mobile: fills the screen (natural block flow)
           Desktop: absolute half-width, slides left/right based on role  ── */}
      <div
        className={cn(
          'bg-white flex flex-col',
          // Mobile: full-screen natural flow
          'min-h-screen',
          // Desktop: absolute overlay over the panels, slides on role change
          'lg:min-h-0 lg:absolute lg:top-0 lg:h-full lg:w-1/2',
          'lg:transition-[left] lg:duration-500 lg:ease-in-out',
          role === 'patient' ? 'lg:left-1/2' : 'lg:left-0',
        )}
      >
        {/* Back link — visible on all screen sizes, moves with the panel */}
        <div className="p-4 md:px-8 lg:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-600 transition-colors"
          >
            ← Back to VitalLink
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-6 lg:px-10 lg:pb-10">
          <div className="w-full max-w-lg">
            <div className="mb-6 text-center">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
                <HeartPulse className="size-5" />
              </div>
              <h1 className="text-xl font-semibold">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Join VitalLink today</p>
            </div>
            <RegisterForm onRoleChange={setRole} />
          </div>
        </div>
      </div>
    </div>
  );
}
