import { Link, Outlet, useParams } from 'react-router-dom';

export function ConsultationLayout() {
  const { appointmentId } = useParams<{ appointmentId: string }>();

  // Determine the back link from the current path
  const isDoctor = window.location.pathname.startsWith('/doctor/');
  const backPath = isDoctor
    ? `/doctor/appointments/${appointmentId ?? ''}`
    : `/patient/appointments/${appointmentId ?? ''}`;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top bar */}
      <header className="h-14 border-b border-neutral-200 flex items-center justify-between px-4 shrink-0">
        <span className="font-semibold text-sky-700 text-base">TeleHealth</span>
        <Link
          to={backPath}
          className="text-sm text-neutral-500 hover:text-neutral-700 transition"
        >
          ← Back to Appointment
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <Outlet />
      </main>
    </div>
  );
}
