import { useNavigate } from 'react-router-dom';
import type { DoctorWithUser } from '../types';

interface DoctorCardProps {
  doctor: DoctorWithUser;
  compact?: boolean;
}

function getInitials(firstName: string, lastName: string): string {
  return (firstName[0]?.toUpperCase() ?? '') + (lastName[0]?.toUpperCase() ?? '');
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-1 text-xs text-neutral-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={
            i < full
              ? 'text-amber-400'
              : i === full && half
                ? 'text-amber-300'
                : 'text-neutral-300'
          }
        >
          ★
        </span>
      ))}
      <span className="font-medium text-neutral-700">{rating.toFixed(1)}</span>
      <span>· {count} {count === 1 ? 'review' : 'reviews'}</span>
    </span>
  );
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
      {/* Avatar + name + accepting badge (top-right) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
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
            {doctor.reviewCount > 0 && (
              <div className="mt-0.5">
                <StarRating rating={doctor.averageRating ?? 0} count={doctor.reviewCount} />
              </div>
            )}
            {doctor.yearsOfExperience != null && (
              <p className="text-sm text-neutral-500 mt-0.5">{doctor.yearsOfExperience} yrs experience</p>
            )}
          </div>
        </div>
        {/* Accepting badge — top-right, inline with name */}
        <span
          className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            doctor.isAcceptingPatients
              ? 'bg-green-100 text-green-700'
              : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          {doctor.isAcceptingPatients ? 'Accepting' : 'Not Accepting'}
        </span>
      </div>

      {/* Fee (left) + consultations count (right) */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-neutral-700">{feeDisplay}</span>
        {doctor.completedConsultationsCount > 0 && (
          <span className="text-xs text-neutral-500">
            {doctor.completedConsultationsCount} {doctor.completedConsultationsCount === 1 ? 'consultation' : 'consultations'}
          </span>
        )}
      </div>

      {/* View profile button */}
      <button
        onClick={() => navigate(`/patient/doctors/${doctor.id}`)}
        className="w-full bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-2 text-sm transition"
      >
        View Doctor Profile
      </button>
    </div>
  );
}
