import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../providers/AuthProvider';
import { MainLayout } from '../layouts/MainLayout';
import { ConsultationLayout } from '../layouts/ConsultationLayout';

// Auth
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';

// Patient — dashboard
import { PatientDashboardPage } from '../../features/appointments/patient/PatientDashboardPage';

// Patient — profile
import { PatientProfilePage } from '../../features/users/patient/PatientProfilePage';

// Patient — doctors
import { DoctorListPage } from '../../features/doctors/patient/DoctorListPage';
import { DoctorProfilePage as PatientDoctorProfilePage } from '../../features/doctors/patient/DoctorProfilePage';

// Patient — appointments
import { BookAppointmentPage } from '../../features/appointments/patient/BookAppointmentPage';
import { AppointmentListPage } from '../../features/appointments/patient/AppointmentListPage';
import { AppointmentDetailPage } from '../../features/appointments/patient/AppointmentDetailPage';

// Patient — consultation
import { PatientConsultationPage } from '../../features/consultations/patient/ConsultationPage';

// Doctor — dashboard
import { DoctorDashboardPage } from '../../features/appointments/doctor/DoctorDashboardPage';

// Doctor — profile
import { DoctorProfilePage as DoctorSelfEditProfilePage } from '../../features/users/doctor/DoctorProfilePage';

// Doctor — appointments
import { DoctorAppointmentListPage } from '../../features/appointments/doctor/DoctorAppointmentListPage';
import { DoctorAppointmentDetailPage } from '../../features/appointments/doctor/DoctorAppointmentDetailPage';

// Doctor — consultation
import { DoctorConsultationPage } from '../../features/consultations/doctor/ConsultationPage';

// Doctor — availability
import { DoctorAvailabilityPage } from '../../features/appointments/doctor/DoctorAvailabilityPage';

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
// ProtectedConsultationLayout — guards + renders ConsultationLayout
// ---------------------------------------------------------------------------
function ProtectedConsultationLayout() {
  const { user, isLoading } = useAuthContext();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <ConsultationLayout />;
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

      {/* ── Consultation routes (no sidebar, ConsultationLayout) ──────────── */}
      <Route element={<ProtectedConsultationLayout />}>
        <Route
          path="/patient/consultation/:appointmentId"
          element={<PatientConsultationPage />}
        />
        <Route
          path="/doctor/consultation/:appointmentId"
          element={<DoctorConsultationPage />}
        />
      </Route>

      {/* ── Authenticated — wrapped in MainLayout via Outlet ─────────────── */}
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

        {/* Appointment routes — /book MUST come before /:id */}
        <Route
          path="/patient/appointments/book"
          element={<RoleGuard role="patient"><BookAppointmentPage /></RoleGuard>}
        />
        <Route
          path="/patient/appointments"
          element={<RoleGuard role="patient"><AppointmentListPage /></RoleGuard>}
        />
        <Route
          path="/patient/appointments/:id"
          element={<RoleGuard role="patient"><AppointmentDetailPage /></RoleGuard>}
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
        <Route
          path="/doctor/appointments"
          element={<RoleGuard role="doctor"><DoctorAppointmentListPage /></RoleGuard>}
        />
        <Route
          path="/doctor/appointments/:id"
          element={<RoleGuard role="doctor"><DoctorAppointmentDetailPage /></RoleGuard>}
        />
        <Route
          path="/doctor/availability"
          element={<RoleGuard role="doctor"><DoctorAvailabilityPage /></RoleGuard>}
        />
      </Route>
    </Routes>
  );
}
