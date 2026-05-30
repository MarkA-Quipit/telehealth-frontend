import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '@/features/users/hooks/useUser';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentCard } from '../components/AppointmentCard';
import { AppointmentSkeletonCard } from '../components/AppointmentSkeletonCard';
import { EmptyState } from '@/shared/components/EmptyState';

const CAP = 5;


export function DoctorDashboardPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();
  const { data: fullUser } = useUser(authUser?.id);
  const { data: appointmentsData, isLoading } = useAppointments({ limit: 100 });
  const { data: completedData } = useAppointments({ status: 'completed', limit: 1 });

  const lastName = fullUser?.lastName || 'Doctor';

  const now = new Date();
  const todayStr = now.toDateString();

  // Current week bounds (Mon–Sun)
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const allItems = appointmentsData?.items ?? [];

  const todayAll = allItems
    .filter((a) => {
      const d = new Date(a.scheduledAt);
      return d.toDateString() === todayStr && (a.status === 'pending' || a.status === 'confirmed');
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const upcomingAll = allItems
    .filter((a) => {
      const d = new Date(a.scheduledAt);
      return d.toDateString() !== todayStr && d > now && (a.status === 'pending' || a.status === 'confirmed');
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const todayAppointments    = todayAll.slice(0, CAP);
  const upcomingAppointments = upcomingAll.slice(0, CAP);

  const pendingCount   = todayAll.filter((a) => a.status === 'pending').length;
  const confirmedCount = todayAll.filter((a) => a.status === 'confirmed').length;
  const thisWeekCount  = allItems.filter((a) => {
    const d = new Date(a.scheduledAt);
    return d >= monday && d <= sunday && a.status !== 'cancelled';
  }).length;
  const completedAllTime = completedData?.total ?? 0;

  const calendarIcon = (
    <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-2xl font-semibold text-amber-700">{isLoading ? '—' : pendingCount}</p>
          <p className="text-sm text-amber-600 mt-1">Pending today</p>
        </div>
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
          <p className="text-2xl font-semibold text-sky-700">{isLoading ? '—' : confirmedCount}</p>
          <p className="text-sm text-sky-600 mt-1">Confirmed today</p>
        </div>
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
          <p className="text-2xl font-semibold text-violet-700">{isLoading ? '—' : thisWeekCount}</p>
          <p className="text-sm text-violet-600 mt-1">This week</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-2xl font-semibold text-green-700">{completedAllTime}</p>
          <p className="text-sm text-green-600 mt-1">Completed all-time</p>
        </div>
      </div>

      {/* Appointments: Today + Upcoming side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {todayAll.length > CAP && (
                <button
                  onClick={() => navigate('/doctor/appointments')}
                  className="w-full text-xs text-sky-600 hover:text-sky-800 font-medium py-1 transition"
                >
                  Show more ({todayAll.length - CAP} more) →
                </button>
              )}
            </div>
          ) : (
            <EmptyState
              padding="sm"
              icon={calendarIcon}
              description="No appointments today."
            />
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-neutral-900">Upcoming Appointments</h3>
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
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} role="doctor" />
              ))}
              {upcomingAll.length > CAP && (
                <button
                  onClick={() => navigate('/doctor/appointments')}
                  className="w-full text-xs text-sky-600 hover:text-sky-800 font-medium py-1 transition"
                >
                  Show more ({upcomingAll.length - CAP} more) →
                </button>
              )}
            </div>
          ) : (
            <EmptyState
              padding="sm"
              icon={calendarIcon}
              description="No upcoming appointments."
            />
          )}
        </div>
      </div>
    </div>
  );
}
