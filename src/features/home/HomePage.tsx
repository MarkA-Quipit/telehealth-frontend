import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse, Search, CalendarCheck, Video,
  UserPlus, BookOpen, MonitorPlay,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

// Triggers .visible when the element enters the viewport
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const STATS = [
  { value: '500+', label: 'Verified Doctors' },
  { value: '10k+', label: 'Consultations Done' },
  { value: '4.9★', label: 'Average Rating' },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}

// ── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200 transition-shadow duration-200',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500 text-white shadow-sm">
            <HeartPulse className="size-4" />
          </div>
          <span className="font-semibold text-slate-800 tracking-tight">VitalLink</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="secondary" size="sm">Log In</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  const statsRef = useReveal();

  return (
    <section className="hero-mesh-bg relative overflow-hidden py-28 px-6">

      {/* Headline block — staggered via .hero-content */}
      <div className="hero-content max-w-3xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 rounded-full px-4 py-1.5 text-sm font-medium border border-sky-100">
          <HeartPulse className="size-3.5" />
          Healthcare, reimagined
        </div>

        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-800 leading-[1.1]">
          Linking Patients<br className="hidden md:block" /> and Providers,<br className="hidden md:block" /> Anywhere
        </h1>

        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          VitalLink connects you with qualified doctors for secure video consultations — book an appointment in minutes, from anywhere.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link to="/register">
            <Button className="px-7 py-2.5">Get Started Free</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" className="px-7 py-2.5">Sign In</Button>
          </Link>
        </div>
      </div>

      {/* Stats strip — glassmorphism, scroll-triggered */}
      <div
        ref={statsRef}
        className="reveal mt-16 max-w-2xl mx-auto grid grid-cols-3 gap-4"
      >
        {STATS.map(({ value, label }) => (
          <div
            key={label}
            className="backdrop-blur-sm bg-white/70 border border-white/60 rounded-xl shadow-sm p-5 text-center"
          >
            <p className="text-2xl font-semibold text-sky-600">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features — Bento grid ────────────────────────────────────────────────────

function FeaturesSection() {
  const ref = useReveal();

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Photo placeholder background */}
      <div className="absolute inset-0 bg-slate-900" aria-hidden>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="absolute inset-0" aria-hidden>
            <img src="/images/features-bg.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/65" />
          </div>
        </div>
        {/* Overlay keeps text readable once real photo is dropped in */}
        <div className="absolute inset-0 bg-slate-900/65" />
      </div>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Everything you need, in one place
          </h2>
          <p className="text-slate-300">Built for patients and providers who value their time.</p>
        </div>

        {/* Bento: large card left + two stacked cards right — all glassmorphic */}
        <div ref={ref} className="reveal grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Large card */}
          <div className="md:row-span-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8
                          flex flex-col gap-8 hover:bg-white/15 transition-colors duration-200">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-sky-400/20">
              <Search className="size-7 text-sky-300" />
            </div>
            <div className="space-y-2.5 mt-auto">
              <h3 className="text-xl font-semibold text-white">Find the Right Doctor</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Browse verified specialists by specialty, read profiles and reviews, and choose a provider that truly fits your needs.
              </p>
            </div>
          </div>

          {/* Small card 1 — emerald tinted glass */}
          <div className="backdrop-blur-md bg-emerald-400/10 border border-emerald-300/25 rounded-2xl p-6
                          flex gap-4 items-start hover:bg-emerald-400/15 transition-colors duration-200">
            <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20">
              <CalendarCheck className="size-5 text-emerald-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">Book in Minutes</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                See real-time availability and confirm your slot instantly — no phone calls, no waiting rooms.
              </p>
            </div>
          </div>

          {/* Small card 2 — sky tinted glass */}
          <div className="backdrop-blur-md bg-sky-400/10 border border-sky-300/25 rounded-2xl p-6
                          flex gap-4 items-start hover:bg-sky-400/15 transition-colors duration-200">
            <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/20">
              <Video className="size-5 text-sky-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">Consult via Secure Video</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Private, encrypted sessions. Join your consultation from any device, right on time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    icon: UserPlus,
    glow: 'flip-card-sky',
    title: 'Create your account',
    description: 'Sign up as a patient or provider in under 2 minutes.',
    backDetail: "Choose your role — patient or provider. Verify your email and complete your profile. You'll be connected to the VitalLink network in minutes.",
  },
  {
    number: '02',
    icon: BookOpen,
    glow: 'flip-card-emerald',
    title: 'Browse and book a doctor',
    description: 'Search by specialty, pick an available slot, and confirm instantly.',
    backDetail: 'Filter doctors by specialty, availability, or rating. Read full profiles and patient reviews. Pick a time slot that fits your schedule and confirm in one click.',
  },
  {
    number: '03',
    icon: MonitorPlay,
    glow: 'flip-card-violet',
    title: 'Join your consultation',
    description: 'At appointment time, click Join — your doctor is ready in the secure video room.',
    backDetail: 'At the scheduled time, click Join from your dashboard. Connect via encrypted video — no downloads needed. Your doctor will be there, ready to help.',
  },
];

function HowItWorksSection() {
  const ref = useReveal();

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-800">How VitalLink works</h2>
          <p className="text-slate-500">Hover each step to learn more.</p>
        </div>

        <div ref={ref} className="reveal grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ number, icon: Icon, glow, title, description, backDetail }, index) => (
            <div key={number} className={cn('flip-card relative', glow)}>
              <div className="flip-card-inner rounded-2xl" style={{ minHeight: '220px' }}>
                {/* Front */}
                <div className="flip-card-front bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-4 h-full">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-semibold text-slate-100 select-none leading-none">{number}</span>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-sky-50">
                      <Icon className="size-4 text-sky-500" />
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                  </div>
                  <p className="text-xs text-slate-400">Hover to learn more →</p>
                </div>

                {/* Back */}
                <div className="flip-card-back bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col justify-center gap-4 h-full">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="size-4 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-white">{title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{backDetail}</p>
                  </div>
                </div>
              </div>

              {/* Dashed connector between steps */}
              {index < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-9 -right-3 w-6 border-t-2 border-dashed border-slate-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Band ─────────────────────────────────────────────────────────────────

function CtaBand() {
  return (
    <section className="bg-sky-500 py-16 px-6">
      <div className="max-w-3xl mx-auto text-center space-y-5">
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Ready to take control of your health?
        </h2>
        <p className="text-sky-100">
          Join thousands of patients and providers on VitalLink — it's free to get started.
        </p>
        <Link to="/register" className="inline-block mt-2">
          <Button
            variant="secondary"
            className="bg-white border-white text-sky-700 hover:bg-sky-50 px-8 py-2.5"
          >
            Get Started Free
          </Button>
        </Link>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-400 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-sky-500 text-white">
            <HeartPulse className="size-3.5" />
          </div>
          <span className="font-semibold text-slate-200 text-sm">VitalLink</span>
          <span className="text-slate-500 text-sm hidden sm:inline">
            — Linking Patients and Providers, Anywhere
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/login" className="hover:text-slate-200 transition-colors">Log In</Link>
          <Link to="/register" className="hover:text-slate-200 transition-colors">Register</Link>
          <span className="text-slate-600">© 2026 VitalLink</span>
        </div>
      </div>
    </footer>
  );
}
