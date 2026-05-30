import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '@/features/users/hooks/useUser';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentCard } from '../components/AppointmentCard';
import { AppointmentSkeletonCard } from '../components/AppointmentSkeletonCard';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { cn } from '@/shared/lib/utils';

const CAP = 5;

export function PatientDashboardPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();
  const { data: fullUser } = useUser(authUser?.id);
  const { data: appointmentsData, isLoading } = useAppointments({ limit: 100 });
  const { data: completedData } = useAppointments({ status: 'completed', limit: 1 });

  const firstName = fullUser?.firstName || authUser?.email?.split('@')[0] || 'there';

  const now = new Date();
  const todayStr = now.toDateString();

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

  const todayAppointments = todayAll.slice(0, CAP);
  const upcoming          = upcomingAll.slice(0, CAP);

  const todayCount     = todayAll.length;
  const upcomingCount  = upcomingAll.length;
  const completedCount = completedData?.total ?? 0;

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
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-neutral-500">Here's an overview of your health activity.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: CalendarDays, iconBg: 'bg-sky-50',   iconColor: 'text-sky-500',   count: isLoading ? '—' : todayCount,    label: "Today's" },
          { icon: Clock,        iconBg: 'bg-amber-50',  iconColor: 'text-amber-500', count: isLoading ? '—' : upcomingCount, label: 'Upcoming' },
          { icon: CheckCircle2, iconBg: 'bg-green-50',  iconColor: 'text-green-600', count: completedCount,                  label: 'Completed' },
        ].map(({ icon: Icon, iconBg, iconColor, count, label }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow duration-150">
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', iconBg)}>
              <Icon className={cn('size-5', iconColor)} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-800">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today + Upcoming — 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Appointments */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-neutral-900">Today's Appointments</h3>
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
            </div>
          ) : todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} role="patient" />
              ))}
              {todayAll.length > CAP && (
                <button
                  onClick={() => navigate('/patient/appointments')}
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
              {upcomingAll.length > CAP && (
                <button
                  onClick={() => navigate('/patient/appointments')}
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
              action={<Button onClick={() => navigate('/patient/doctors')}>Book an Appointment</Button>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
