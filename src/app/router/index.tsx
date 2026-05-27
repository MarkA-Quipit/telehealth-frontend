import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';

// ---------------------------------------------------------------------------
// ProtectedRoute — redirects unauthenticated users to /login
// ---------------------------------------------------------------------------
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthContext();
  if (isLoading) return null; // hold render while stored token is being verified
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// RoleGuard — redirects authenticated users to their correct dashboard
//             if they hit a route belonging to the wrong role
// ---------------------------------------------------------------------------
function RoleGuard({ role, children }: { role: 'patient' | 'doctor'; children: ReactNode }) {
  const { user } = useAuthContext();
  if (!user) return null;
  if (!user.roles.includes(role)) {
    return (
      <Navigate
        to={user.roles.includes('doctor') ? '/doctor/dashboard' : '/patient/dashboard'}
        replace
      />
    );
  }
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Placeholder dashboards — replaced when those modules are built
// ---------------------------------------------------------------------------
function PatientDashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Patient dashboard — coming soon
    </div>
  );
}

function DoctorDashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Doctor dashboard — coming soon
    </div>
  );
}

// Redirects /dashboard → role-specific dashboard
function RoleDashboardRedirect() {
  const { user } = useAuthContext();
  if (!user) return null;
  return (
    <Navigate
      to={user.roles.includes('doctor') ? '/doctor/dashboard' : '/patient/dashboard'}
      replace
    />
  );
}

// ---------------------------------------------------------------------------
// AppRouter
// ---------------------------------------------------------------------------
export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* / → /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* /dashboard → role dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleDashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* Patient */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute>
            <RoleGuard role="patient">
              <PatientDashboardPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Doctor */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute>
            <RoleGuard role="doctor">
              <DoctorDashboardPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
