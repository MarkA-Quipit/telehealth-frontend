import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '@/features/users/hooks/useUser';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentCard } from '../components/AppointmentCard';

function SkeletonCard() {
  return (
    <div className="border-l-4 border-l-neutral-200 bg-white border border-neutral-200 rounded-xl shadow-sm p-4 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-neutral-100 rounded" />
          <div className="h-3 w-32 bg-neutral-100 rounded" />
        </div>
        <div className="h-5 w-20 bg-neutral-100 rounded-full" />
      </div>
    </div>
  );
}

export function PatientDashboardPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();
  const { data: fullUser } = useUser(authUser?.id);
  const { data: appointmentsData, isLoading } = useAppointments();

  const firstName = fullUser?.firstName || authUser?.email?.split('@')[0] || 'there';

  const upcoming = (appointmentsData?.items ?? [])
    .filter((a) => a.status === 'pending' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-neutral-500">Here's an overview of your health activity.</p>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-900">Upcoming Appointments</h3>
          <button
            onClick={() => navigate('/patient/appointments')}
            className="text-xs text-sky-700 hover:text-sky-600 font-medium transition"
          >
            View all →
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} role="patient" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-neutral-500 mb-4">No upcoming appointments.</p>
            <button
              onClick={() => navigate('/patient/doctors')}
              className="bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-2 text-sm transition"
            >
              Book an Appointment
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <h3 className="text-base font-semibold text-neutral-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/patient/doctors')}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 text-left hover:bg-neutral-50 transition"
          >
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Find a Doctor</p>
              <p className="text-xs text-neutral-500">Browse specialists near you</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/patient/profile')}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 text-left hover:bg-neutral-50 transition"
          >
            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">View My Profile</p>
              <p className="text-xs text-neutral-500">Update your personal info</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
