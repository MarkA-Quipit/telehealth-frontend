import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { AuthLayout } from '../../../app/layouts/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
          <HeartPulse className="size-5" />
        </div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your VitalLink account</p>
      </div>
      <LoginForm />
      <p className="mt-6 text-center text-xs text-slate-400">
        <Link to="/" className="hover:text-sky-600 transition-colors">← Back to VitalLink</Link>
      </p>
    </AuthLayout>
  );
}
