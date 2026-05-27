import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppointment } from '@/features/appointments/hooks/useAppointments';
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
    <div className="w-full h-full">
      <JitsiRoom
        appointmentId={appointmentId!}
        displayName={displayName}
        email={authUser?.email}
        onLeave={() => navigate(`/patient/appointments/${appointmentId}`)}
      />
    </div>
  );
}
