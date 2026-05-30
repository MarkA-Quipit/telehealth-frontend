import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '@/features/users/hooks/useUser';
import { formatDuration } from '@/shared/lib/utils';
import { JitsiRoom } from '../components/JitsiRoom';

const PREVIEW_ROOM     = 'telehealth-preview-room';
const PREVIEW_DOCTOR   = 'Dr. Preview';
const PREVIEW_DURATION = 30;

export function ConsultationPreviewPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();
  const { data: fullUser } = useUser(authUser?.id);

  const displayName = fullUser
    ? `${fullUser.firstName} ${fullUser.lastName}`
    : authUser?.email ?? 'Patient';

  return (
    <div className="flex flex-col w-full h-full">
      {/* Session header bar */}
      <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-2 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Session length</span>
          <span className="inline-flex items-center rounded-full bg-sky-500/20 text-sky-300 px-2.5 py-0.5 text-xs font-medium">
            {formatDuration(PREVIEW_DURATION)}
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Waiting for {PREVIEW_DOCTOR} to join…
        </span>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0">
          <JitsiRoom
            appointmentId={PREVIEW_ROOM}
            displayName={displayName}
            email={authUser?.email}
            onLeave={() => navigate('/patient/dashboard')}
          />
        </div>
        <div className="w-72 bg-white border-l border-neutral-200 p-4 overflow-hidden flex flex-col">
          <p className="text-xs text-neutral-400">Chat not available in preview.</p>
        </div>
      </div>
    </div>
  );
}
