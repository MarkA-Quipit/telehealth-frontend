import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '@/features/users/hooks/useUser';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentCard } from '../components/AppointmentCard';
import { AppointmentSkeletonCard } from '../components/AppointmentSkeletonCard';
import { QuickActions } from '../components/QuickActions';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';


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
            <AppointmentSkeletonCard />
            <AppointmentSkeletonCard />
            <AppointmentSkeletonCard />
          </div>
        ) : upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} role="patient" />
            ))}
          </div>
        ) : (
          <EmptyState
            padding="sm"
            icon={
              <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            description="No upcoming appointments."
            action={<Button onClick={() => navigate('/patient/doctors')}>Book an Appointment</Button>}
          />
        )}
      </div>

      <QuickActions
        columns={2}
        actions={[
          {
            label: 'Find a Doctor',
            description: 'Browse specialists near you',
            path: '/patient/doctors',
            iconBg: 'bg-sky-100',
            iconColor: 'text-sky-700',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ),
          },
          {
            label: 'View My Profile',
            description: 'Update your personal info',
            path: '/patient/profile',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-700',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
          },
        ]}
      />
    </div>
  );
}
