import { HeartPulse } from 'lucide-react';
import { AuthLayout } from '../../../app/layouts/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
          <HeartPulse className="size-5" />
        </div>
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join VitalLink today</p>
      </div>
      <RegisterForm />
    </AuthLayout>
  );
}
