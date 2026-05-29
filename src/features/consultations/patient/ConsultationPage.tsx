import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppointment } from '@/features/appointments/hooks/useAppointments';
import { formatDuration } from '@/shared/lib/utils';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '@/features/users/hooks/useUser';
import { JitsiRoom } from '../components/JitsiRoom';

export function PatientConsultationPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();
  const { data: fullUser } = useUser(authUser?.id);
  const { data: appointment, isLoading } = useAppointment(appointmentId);

  useEffect(() => {
    if (!appointment || isLoading) return;

    const scheduled = new Date(appointment.scheduledAt);
    const endsAt    = new Date(appointment.endsAt);
    const now       = new Date();

    const joinStart = new Date(scheduled.getTime() - 5 * 60 * 1000);
    const joinEnd   = new Date(endsAt.getTime() + 15 * 60 * 1000);
    const eligible  = appointment.status === 'confirmed' && now >= joinStart && now <= joinEnd;

    if (!eligible) {
      toast.error('This session is not currently available');
      navigate(`/patient/appointments/${appointmentId}`);
    }
  }, [appointment, isLoading, appointmentId, navigate]);

  if (isLoading || !appointment) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-sm text-neutral-500">Loading session…</div>
      </div>
    );
  }

  const displayName = fullUser
    ? `${fullUser.firstName} ${fullUser.lastName}`
    : authUser?.email ?? 'Patient';

  return (
    <div className="flex flex-col w-full h-full">
      <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-neutral-900 border-b border-neutral-800">
        <span className="text-xs text-neutral-400">Session length</span>
        <span className="inline-flex items-center rounded-full bg-sky-500/20 text-sky-300 px-2.5 py-0.5 text-xs font-medium">
          {formatDuration(appointment.durationMinutes)}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <JitsiRoom
          appointmentId={appointmentId!}
          displayName={displayName}
          email={authUser?.email}
          onLeave={() => navigate(`/patient/appointments/${appointmentId}`)}
        />
      </div>
    </div>
  );
}
