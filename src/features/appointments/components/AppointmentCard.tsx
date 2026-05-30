import { useNavigate } from 'react-router-dom';
import { formatDateWithWeekday, formatTime } from '@/shared/lib/date';
import { formatDuration } from '@/shared/lib/utils';
import type { AppointmentWithDetails, AppointmentStatus } from '../types';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';

interface Props {
  appointment: AppointmentWithDetails;
  role: 'patient' | 'doctor';
}

const BORDER_COLOR: Record<AppointmentStatus, string> = {
  pending:   'border-l-amber-400',
  confirmed: 'border-l-sky-400',
  completed: 'border-l-green-400',
  cancelled: 'border-l-red-400',
};

export function AppointmentCard({ appointment, role }: Props) {
  const navigate = useNavigate();
  const status = appointment.status as AppointmentStatus;
  const borderColor = BORDER_COLOR[status] ?? 'border-l-neutral-300';

  const dateStr = formatDateWithWeekday(appointment.scheduledAt);
  const timeStr = formatTime(appointment.scheduledAt);

  const detailPath =
    role === 'patient'
      ? `/patient/appointments/${appointment.id}`
      : `/doctor/appointments/${appointment.id}`;

  return (
    <div
      className={`border-l-4 ${borderColor} bg-white border border-neutral-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow duration-150`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Date + time */}
          <p className="text-sm font-medium text-neutral-900">
            {dateStr} · {timeStr}
          </p>

          {/* Counter-party info */}
          {role === 'patient' ? (
            <p className="text-sm text-neutral-500 mt-0.5">
              Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
              <span className="text-neutral-400"> · {appointment.doctor.specialization}</span>
            </p>
          ) : (
            <p className="text-sm text-neutral-500 mt-0.5">
              {appointment.patient.firstName} {appointment.patient.lastName}
            </p>
          )}
          <p className="text-xs text-neutral-400 mt-1">
            {formatDuration(appointment.durationMinutes)} session
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <AppointmentStatusBadge status={status} />
          <button
            onClick={() => navigate(detailPath)}
            className="text-xs font-medium text-sky-700 hover:text-sky-600 transition"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
