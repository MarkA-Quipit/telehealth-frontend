import { LogoutAllSection } from './LogoutAllSection';

export function SessionsTabContent() {
  return (
    <div className="space-y-4">
      {/* Active Sessions */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Active Sessions</h3>
          <p className="text-sm text-neutral-500 mt-0.5">Devices currently signed in to your account.</p>
        </div>

        {/* TODO: Replace with real session list when GET /api/auth/sessions is available */}
        <div className="flex items-center justify-between py-2 border-t border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">This device</p>
              <p className="text-xs text-neutral-400">Current browser session</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-full px-2.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Active now
          </span>
        </div>
      </div>

      <LogoutAllSection />
    </div>
  );
}
