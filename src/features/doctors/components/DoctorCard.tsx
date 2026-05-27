import { useNavigate } from 'react-router-dom';
import type { DoctorWithUser } from '../types';

interface DoctorCardProps {
  doctor: DoctorWithUser;
  compact?: boolean;
}

function getInitials(firstName: string, lastName: string): string {
  return (firstName[0]?.toUpperCase() ?? '') + (lastName[0]?.toUpperCase() ?? '');
}

export function DoctorCard({ doctor, compact = false }: DoctorCardProps) {
  const navigate = useNavigate();
  const initials = getInitials(doctor.firstName, doctor.lastName);
  const fullName = `${doctor.firstName} ${doctor.lastName}`;
  const feeDisplay =
    doctor.consultationFee != null
      ? `₱${(doctor.consultationFee / 100).toLocaleString()} / session`
      : 'Fee not set';

  if (compact) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4 flex items-center gap-3">
        {doctor.profilePictureUrl ? (
          <img
            src={doctor.profilePictureUrl}
            alt={fullName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-semibold flex items-center justify-center text-sm shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">{fullName}</p>
          <p className="text-xs text-neutral-500 truncate">{doctor.specialization}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 flex flex-col gap-3">
      {/* Avatar + name */}
      <div className="flex items-start gap-3">
        {doctor.profilePictureUrl ? (
          <img
            src={doctor.profilePictureUrl}
            alt={fullName}
            className="w-16 h-16 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-700 font-semibold flex items-center justify-center text-xl shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-neutral-900 truncate">{fullName}</p>
          <p className="text-sm text-neutral-500 truncate">{doctor.specialization}</p>
          {doctor.yearsOfExperience != null && (
            <p className="text-sm text-neutral-500">{doctor.yearsOfExperience} yrs experience</p>
          )}
        </div>
      </div>

      {/* Fee + accepting badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700">{feeDisplay}</span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            doctor.isAcceptingPatients
              ? 'bg-green-100 text-green-700'
              : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          {doctor.isAcceptingPatients ? 'Accepting Patients' : 'Not Accepting'}
        </span>
      </div>

      {/* Book button */}
      <button
        onClick={() => navigate(`/patient/doctors/${doctor.id}`)}
        className="w-full bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-2 text-sm transition"
      >
        Book Appointment
      </button>
    </div>
  );
}
