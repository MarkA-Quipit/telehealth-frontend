import { AuthLayout } from '../../../app/layouts/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout>
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-foreground text-background text-lg font-bold select-none">
          T
        </div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
}
