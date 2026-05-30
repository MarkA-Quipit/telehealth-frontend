import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '@/features/users/hooks/useUser';
import { formatDuration } from '@/shared/lib/utils';
import { JitsiRoom } from '../components/JitsiRoom';

const PREVIEW_ROOM     = 'telehealth-preview-room';
const PREVIEW_PATIENT  = 'Preview Patient';
const PREVIEW_REASON   = 'General consultation';
const PREVIEW_DURATION = 30;

export function ConsultationPreviewPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthContext();
  const { data: fullUser } = useUser(authUser?.id);
  const [panelOpen, setPanelOpen] = useState(true);
  const [quickNote, setQuickNote] = useState('');

  const displayName = fullUser
    ? `Dr. ${fullUser.firstName} ${fullUser.lastName}`
    : authUser?.email ?? 'Doctor';

  return (
    <div className="flex h-full">
      {/* Jitsi room */}
      <div className="flex-1 min-w-0">
        <JitsiRoom
          appointmentId={PREVIEW_ROOM}
          displayName={displayName}
          email={authUser?.email}
          onLeave={() => navigate('/doctor/dashboard')}
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
            {/* Patient info + join status */}
            <div>
              <p className="text-sm font-semibold text-neutral-900">{PREVIEW_PATIENT}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{PREVIEW_REASON}</p>
              <span className="mt-1.5 inline-flex items-center rounded-full bg-sky-100 text-sky-700 px-2 py-0.5 text-xs font-medium">
                {formatDuration(PREVIEW_DURATION)} session
              </span>
              <div className="mt-2">
                <span className="flex items-center gap-1.5 text-xs text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Waiting for patient…
                </span>
              </div>
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

            {/* Chat placeholder */}
            <div className="flex-1 min-h-0 border-t border-neutral-100 pt-3 flex flex-col overflow-hidden">
              <p className="text-xs text-neutral-400">Chat not available in preview.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
