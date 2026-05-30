import { Link } from 'react-router-dom';
import { HeartPulse, Search, CalendarCheck, Video, UserPlus, BookOpen, MonitorPlay } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export function HomePage() {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
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

function HeroSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 rounded-full px-4 py-1.5 text-sm font-medium border border-sky-100">
          <HeartPulse className="size-3.5" />
          Healthcare, reimagined
        </div>
        <h1 className="text-5xl font-semibold tracking-tight text-slate-800 leading-tight">
          Linking Patients and<br />Providers, Anywhere
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          VitalLink connects you with qualified doctors for secure video consultations — book an appointment in minutes, from anywhere.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/register">
            <Button className="px-6 py-2.5 text-sm">Get Started as a Patient</Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary" className="px-6 py-2.5 text-sm">Are you a provider? Join VitalLink</Button>
          </Link>
        </div>
      </div>

      {/* Decorative card strip */}
      <div className="mt-16 max-w-4xl mx-auto grid grid-cols-3 gap-4">
        {[
          { value: '500+', label: 'Verified Doctors' },
          { value: '10k+', label: 'Consultations Done' },
          { value: '4.9★', label: 'Average Rating' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center">
            <p className="text-2xl font-semibold text-sky-600">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Search,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    title: 'Find the Right Doctor',
    description: 'Browse verified specialists by specialty, read profiles, and choose a provider that fits your needs.',
  },
  {
    icon: CalendarCheck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    title: 'Book in Minutes',
    description: 'See real-time availability and confirm your appointment instantly — no phone calls, no waiting rooms.',
  },
  {
    icon: Video,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    title: 'Consult via Secure Video',
    description: 'Join your consultation from any device. Your session is private, encrypted, and starts right on time.',
  },
];

function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Everything you need, in one place</h2>
          <p className="text-sm text-slate-500">Built for patients and providers who value their time.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, iconBg, iconColor, title, description }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
              <div className={`inline-flex size-11 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className={`size-5 ${iconColor}`} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create your account',
    description: 'Sign up as a patient or provider. Takes less than 2 minutes.',
  },
  {
    number: '02',
    icon: BookOpen,
    title: 'Browse and book a doctor',
    description: 'Search by specialty or name, pick an available slot, and confirm your booking.',
  },
  {
    number: '03',
    icon: MonitorPlay,
    title: 'Join your consultation',
    description: 'At appointment time, click Join — your doctor is waiting in the secure video room.',
  },
];

function HowItWorksSection() {
  return (
    <section className="py-20 px-6 bg-green-50">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-800">How VitalLink works</h2>
          <p className="text-sm text-slate-500">Three steps from sign-up to consultation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="relative bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold text-sky-100 select-none">{number}</span>
                <div className="flex size-9 items-center justify-center rounded-lg bg-sky-50">
                  <Icon className="size-4 text-sky-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center pt-4">
          <Link to="/register">
            <Button className="px-8 py-2.5">Start for free</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-400 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-sky-500 text-white">
            <HeartPulse className="size-3.5" />
          </div>
          <span className="font-semibold text-slate-200 text-sm">VitalLink</span>
          <span className="text-slate-500 text-sm">— Linking Patients and Providers, Anywhere</span>
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
