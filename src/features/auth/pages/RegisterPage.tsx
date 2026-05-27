import { AuthLayout } from '../../../app/layouts/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-foreground text-background text-lg font-bold select-none">
          T
        </div>
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join the platform today</p>
      </div>
      <RegisterForm />
    </AuthLayout>
  );
}
