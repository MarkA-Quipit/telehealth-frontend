import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '@/features/users/hooks/useUser';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentCard } from '../components/AppointmentCard';
import { AppointmentSkeletonCard } from '../components/AppointmentSkeletonCard';
import { QuickActions } from '../components/QuickActions';
import { EmptyState } from '@/shared/components/EmptyState';


export function DoctorDashboardPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();
  const { data: fullUser } = useUser(authUser?.id);
  const { data: appointmentsData, isLoading } = useAppointments();

  const lastName = fullUser?.lastName || 'Doctor';

  const todayStr = new Date().toDateString();

  const todayAppointments = (appointmentsData?.items ?? [])
    .filter((a) => {
      const apptDate = new Date(a.scheduledAt).toDateString();
      return apptDate === todayStr && a.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const pendingCount   = todayAppointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = todayAppointments.filter((a) => a.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Welcome back, Dr. {lastName}
        </h1>
        <p className="text-sm text-neutral-500">Here's an overview of your schedule today.</p>
      </div>

      {/* Stats row */}
      {!isLoading && todayAppointments.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-2xl font-semibold text-amber-700">{pendingCount}</p>
            <p className="text-sm text-amber-600 mt-1">Pending today</p>
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
            <p className="text-2xl font-semibold text-sky-700">{confirmedCount}</p>
            <p className="text-sm text-sky-600 mt-1">Confirmed today</p>
          </div>
        </div>
      )}

      {/* Today's Appointments */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-900">Today's Appointments</h3>
          <button
            onClick={() => navigate('/doctor/appointments')}
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
        ) : todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} role="doctor" />
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
            description="No appointments today."
          />
        )}
      </div>

      <QuickActions
        columns={3}
        actions={[
          {
            label: 'View All Appointments',
            description: 'See your full schedule',
            path: '/doctor/appointments',
            iconBg: 'bg-sky-100',
            iconColor: 'text-sky-700',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            ),
          },
          {
            label: 'Manage Availability',
            description: 'Set your weekly schedule',
            path: '/doctor/availability',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-700',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'View My Profile',
            description: 'Update your professional info',
            path: '/doctor/profile',
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
