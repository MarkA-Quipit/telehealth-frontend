import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '../providers/AuthProvider';
import { MainLayout } from '../layouts/MainLayout';
import { ConsultationLayout } from '../layouts/ConsultationLayout';
import { useAuthContext } from '../providers/AuthProvider';

// Home
import { HomePage } from '../../features/home/HomePage';

// Auth
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';

// Patient — dashboard
import { PatientDashboardPage } from '../../features/appointments/patient/PatientDashboardPage';

// Profile + Settings pages (shared — role-aware)
import { ProfilePage } from '../../features/users/settings/ProfilePage';
import { SettingsPage } from '../../features/users/settings/SettingsPage';

// Patient — doctors
import { DoctorListPage } from '../../features/doctors/patient/DoctorListPage';
import { DoctorProfilePage as PatientDoctorProfilePage } from '../../features/doctors/patient/DoctorProfilePage';

// Patient — appointments
import { BookAppointmentPage } from '../../features/appointments/patient/BookAppointmentPage';
import { AppointmentListPage } from '../../features/appointments/patient/AppointmentListPage';
import { AppointmentDetailPage } from '../../features/appointments/patient/AppointmentDetailPage';

// Patient — consultation
import { PatientConsultationPage } from '../../features/consultations/patient/ConsultationPage';
import { ConsultationPreviewPage as PatientConsultationPreviewPage } from '../../features/consultations/patient/ConsultationPreviewPage';

// Doctor — dashboard
import { DoctorDashboardPage } from '../../features/appointments/doctor/DoctorDashboardPage';

// Doctor — appointments
import { DoctorAppointmentListPage } from '../../features/appointments/doctor/DoctorAppointmentListPage';
import { DoctorAppointmentDetailPage } from '../../features/appointments/doctor/DoctorAppointmentDetailPage';

// Doctor — consultation
import { DoctorConsultationPage } from '../../features/consultations/doctor/ConsultationPage';
import { ConsultationPreviewPage as DoctorConsultationPreviewPage } from '../../features/consultations/doctor/ConsultationPreviewPage';

// Doctor — availability
import { DoctorAvailabilityPage } from '../../features/appointments/doctor/DoctorAvailabilityPage';

// Doctor — patient history
import { PatientMedicalHistoryPage } from '../../features/users/doctor/PatientMedicalHistoryPage';

// ---------------------------------------------------------------------------
// RootLayout — provides AuthProvider to all routes (useNavigate requires
// being inside a router, so AuthProvider lives here, not in App.tsx)
// ---------------------------------------------------------------------------
function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

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
// Data router — required for useBlocker and other data router APIs
// ---------------------------------------------------------------------------
export const router = createBrowserRouter([
  {
    // RootLayout renders AuthProvider so all child routes have auth context
    // and useNavigate works inside AuthProvider
    element: <RootLayout />,
    children: [
      // Public
      { path: '/',         element: <HomePage /> },
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },

      // Consultation routes (no sidebar, ConsultationLayout)
      {
        element: <ProtectedConsultationLayout />,
        children: [
          { path: '/doctor/consultation/preview', element: <DoctorConsultationPreviewPage /> },
          { path: '/patient/consultation/preview', element: <PatientConsultationPreviewPage /> },
          { path: '/patient/consultation/:appointmentId', element: <PatientConsultationPage /> },
          { path: '/doctor/consultation/:appointmentId',  element: <DoctorConsultationPage /> },
        ],
      },

      // Authenticated — wrapped in MainLayout via Outlet
      {
        element: <ProtectedLayout />,
        children: [
          { path: '/dashboard', element: <RoleDashboardRedirect /> },

          // Patient routes
          { path: '/patient/dashboard',          element: <RoleGuard role="patient"><PatientDashboardPage /></RoleGuard> },
          { path: '/patient/profile',            element: <RoleGuard role="patient"><ProfilePage /></RoleGuard> },
          { path: '/patient/settings',           element: <RoleGuard role="patient"><SettingsPage /></RoleGuard> },
          { path: '/patient/doctors',            element: <RoleGuard role="patient"><DoctorListPage /></RoleGuard> },
          { path: '/patient/doctors/:id',        element: <RoleGuard role="patient"><PatientDoctorProfilePage /></RoleGuard> },
          // /book MUST come before /:id
          { path: '/patient/appointments/book',  element: <RoleGuard role="patient"><BookAppointmentPage /></RoleGuard> },
          { path: '/patient/appointments',       element: <RoleGuard role="patient"><AppointmentListPage /></RoleGuard> },
          { path: '/patient/appointments/:id',   element: <RoleGuard role="patient"><AppointmentDetailPage /></RoleGuard> },

          // Doctor routes
          { path: '/doctor/dashboard',           element: <RoleGuard role="doctor"><DoctorDashboardPage /></RoleGuard> },
          { path: '/doctor/profile',             element: <RoleGuard role="doctor"><ProfilePage /></RoleGuard> },
          { path: '/doctor/settings',            element: <RoleGuard role="doctor"><SettingsPage /></RoleGuard> },
          { path: '/doctor/appointments',        element: <RoleGuard role="doctor"><DoctorAppointmentListPage /></RoleGuard> },
          { path: '/doctor/appointments/:id',    element: <RoleGuard role="doctor"><DoctorAppointmentDetailPage /></RoleGuard> },
          { path: '/doctor/availability',        element: <RoleGuard role="doctor"><DoctorAvailabilityPage /></RoleGuard> },
          { path: '/doctor/patients/:patientId', element: <RoleGuard role="doctor"><PatientMedicalHistoryPage /></RoleGuard> },
        ],
      },
    ],
  },
]);
