import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useAppointment } from '@/features/appointments/hooks/useAppointments';
import { formatDuration } from '@/shared/lib/utils';
import { ChatPanel } from '../components/ChatPanel';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '@/features/users/hooks/useUser';
import { JitsiRoom } from '../components/JitsiRoom';

export function DoctorConsultationPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();
  const { data: fullUser } = useUser(authUser?.id);
  const { data: appointment, isLoading } = useAppointment(appointmentId);
  const [panelOpen, setPanelOpen] = useState(true);
  const [quickNote, setQuickNote] = useState('');

  useEffect(() => {
    if (!appointment || isLoading) return;

    const scheduled = new Date(appointment.scheduledAt);
    const endsAt    = new Date(appointment.endsAt);
    const now       = new Date();

    const joinStart = new Date(scheduled.getTime() - 5 * 60 * 1000);
    const joinEnd   = new Date(endsAt.getTime() + 15 * 60 * 1000);
    const eligible  = appointment.status === 'confirmed' && now >= joinStart && now <= joinEnd;

    if (!eligible) {
      navigate(`/doctor/appointments/${appointmentId}`);
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
    ? `Dr. ${fullUser.firstName} ${fullUser.lastName}`
    : authUser?.email ?? 'Doctor';

  return (
    <div className="flex h-full">
      {/* Jitsi room */}
      <div className="flex-1 min-w-0">
        <JitsiRoom
          appointmentId={appointmentId!}
          displayName={displayName}
          email={authUser?.email}
          onLeave={() => navigate(`/doctor/appointments/${appointmentId}`)}
        />
      </div>

      {/* Collapsible right panel */}
      <div
        className={`relative flex shrink-0 transition-all duration-200 ${
          panelOpen ? 'w-80' : 'w-8'
        }`}
      >
        {/* Toggle button */}
        <button
          onClick={() => setPanelOpen((o) => !o)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10
                     w-6 h-6 rounded-full bg-white border border-neutral-200 shadow
                     flex items-center justify-center text-neutral-500
                     hover:text-neutral-700 transition"
          title={panelOpen ? 'Collapse panel' : 'Expand panel'}
        >
          {panelOpen ? (
            <ChevronRightIcon className="w-3 h-3" />
          ) : (
            <ChevronLeftIcon className="w-3 h-3" />
          )}
        </button>

        {/* Panel content */}
        {panelOpen && (
          <div className="w-80 bg-white border-l border-neutral-200 p-4 flex flex-col gap-4 overflow-hidden">
            {/* Patient info */}
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {appointment.patient.firstName} {appointment.patient.lastName}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {appointment.reasonForVisit ?? 'No reason provided'}
              </p>
              <span className="mt-1.5 inline-flex items-center rounded-full bg-sky-100 text-sky-700 px-2 py-0.5 text-xs font-medium">
                {formatDuration(appointment.durationMinutes)} session
              </span>
            </div>

            {/* Quick note */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-600">Quick Notes</label>
              <textarea
                rows={4}
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Quick notes…"
                className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-xs
                           focus:bg-white focus:border focus:border-sky-400
                           focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
              />
              <p className="text-xs text-neutral-400">
                Not auto-saved — use "Open Full Notes" to save.
              </p>
            </div>

            {/* Link to full notes */}
            <Link
              to={`/doctor/appointments/${appointmentId}`}
              className="block text-xs font-medium text-sky-700 hover:text-sky-600 transition"
            >
              Open Full Notes →
            </Link>

            {/* Chat */}
            <div className="flex-1 min-h-0 border-t border-neutral-100 pt-3 flex flex-col overflow-hidden">
              <ChatPanel
                appointmentId={appointmentId!}
                currentUserId={authUser?.id ?? ''}
                otherPartyName={`${appointment.patient.firstName} ${appointment.patient.lastName}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
