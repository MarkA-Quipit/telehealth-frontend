import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Pusher from 'pusher-js';
import { useAppointment } from '@/features/appointments/hooks/useAppointments';
import { formatDuration } from '@/shared/lib/utils';
import { ChatPanel } from '../components/ChatPanel';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '@/features/users/hooks/useUser';
import { JitsiRoom } from '../components/JitsiRoom';
import { useJoinConsultation } from '../hooks/useConsultations';

export function PatientConsultationPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();
  const { data: fullUser } = useUser(authUser?.id);
  const { data: appointment, isLoading } = useAppointment(appointmentId);
  const joinMutation = useJoinConsultation(appointmentId ?? '');

  // true once the doctor's user_joined event arrives via Pusher
  const [doctorJoined, setDoctorJoined] = useState(false);
  const pusherRef = useRef<Pusher | null>(null);

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
      return;
    }

    // Pre-populate joined state from appointment data (handles page reload)
    if (appointment.doctorJoinedAt) setDoctorJoined(true);

    // Record own join
    joinMutation.mutate();

    // Subscribe to join events on this appointment channel
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY as string, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER as string,
    });
    pusherRef.current = pusher;

    const channel = pusher.subscribe(`appointment-${appointmentId}`);
    channel.bind('user_joined', (data: { role: string }) => {
      if (data.role === 'doctor') setDoctorJoined(true);
    });

    return () => {
      pusher.unsubscribe(`appointment-${appointmentId}`);
      pusher.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment?.id, isLoading]);

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

  const doctorName = `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;

  return (
    <div className="flex flex-col w-full h-full">
      {/* Session header bar */}
      <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-2 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Session length</span>
          <span className="inline-flex items-center rounded-full bg-sky-500/20 text-sky-300 px-2.5 py-0.5 text-xs font-medium">
            {formatDuration(appointment.durationMinutes)}
          </span>
        </div>
        {/* Join indicator */}
        {doctorJoined ? (
          <span className="text-xs text-green-400 font-medium">{doctorName} is in the room ✓</span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Waiting for {doctorName} to join…
          </span>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          <JitsiRoom
            appointmentId={appointmentId!}
            displayName={displayName}
            email={authUser?.email}
            onLeave={() => navigate(`/patient/appointments/${appointmentId}`)}
          />
        </div>
        <div className="w-72 bg-white border-l border-neutral-200 p-4 overflow-hidden flex flex-col">
          <ChatPanel
            appointmentId={appointmentId!}
            currentUserId={authUser?.id ?? ''}
            otherPartyName={doctorName}
          />
        </div>
      </div>
    </div>
  );
}
