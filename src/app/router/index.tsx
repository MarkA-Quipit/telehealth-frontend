import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { PatientDashboardPage } from '../../features/appointments/patient/PatientDashboardPage';
import { DoctorDashboardPage } from '../../features/appointments/doctor/DoctorDashboardPage';
import { PatientProfilePage } from '../../features/users/patient/PatientProfilePage';
import { DoctorProfilePage as DoctorSelfEditProfilePage } from '../../features/users/doctor/DoctorProfilePage';
import { DoctorListPage } from '../../features/doctors/patient/DoctorListPage';
import { DoctorProfilePage as PatientDoctorProfilePage } from '../../features/doctors/patient/DoctorProfilePage';

// ---------------------------------------------------------------------------
// ProtectedLayout — guards + renders MainLayout (Outlet receives each page)
// ---------------------------------------------------------------------------
function ProtectedLayout() {
  const { user, isLoading } = useAuthContext();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <MainLayout />;
}

// ---------------------------------------------------------------------------
// RoleGuard — redirects authenticated users to their correct dashboard
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
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/"         element={<Navigate to="/login" replace />} />

      {/* Authenticated — wrapped in MainLayout via Outlet */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<RoleDashboardRedirect />} />

        {/* ── Patient routes ─────────────────────────────────────────────── */}
        <Route
          path="/patient/dashboard"
          element={<RoleGuard role="patient"><PatientDashboardPage /></RoleGuard>}
        />
        <Route
          path="/patient/profile"
          element={<RoleGuard role="patient"><PatientProfilePage /></RoleGuard>}
        />
        <Route
          path="/patient/doctors"
          element={<RoleGuard role="patient"><DoctorListPage /></RoleGuard>}
        />
        <Route
          path="/patient/doctors/:id"
          element={<RoleGuard role="patient"><PatientDoctorProfilePage /></RoleGuard>}
        />

        {/* ── Doctor routes ──────────────────────────────────────────────── */}
        <Route
          path="/doctor/dashboard"
          element={<RoleGuard role="doctor"><DoctorDashboardPage /></RoleGuard>}
        />
        <Route
          path="/doctor/profile"
          element={<RoleGuard role="doctor"><DoctorSelfEditProfilePage /></RoleGuard>}
        />
      </Route>
    </Routes>
  );
}