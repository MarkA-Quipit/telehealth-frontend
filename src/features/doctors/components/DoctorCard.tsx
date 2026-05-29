import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/components/Avatar';
import type { DoctorWithUser } from '../types';

interface DoctorCardProps {
  doctor: DoctorWithUser;
  compact?: boolean;
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
  const fullName = `${doctor.firstName} ${doctor.lastName}`;
  const feeDisplay =
    doctor.consultationFee != null
      ? `₱${(doctor.consultationFee / 100).toLocaleString()} / session`
      : 'Fee not set';

  if (compact) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4 flex items-center gap-3">
        <Avatar
          firstName={doctor.firstName}
          lastName={doctor.lastName}
          profilePictureUrl={doctor.profilePictureUrl}
          size="sm"
        />
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
          <Avatar
            firstName={doctor.firstName}
            lastName={doctor.lastName}
            profilePictureUrl={doctor.profilePictureUrl}
            size="lg"
          />
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
        <span className="text-xs text-neutral-500">
          {doctor.completedConsultationsCount} {doctor.completedConsultationsCount === 1 ? 'consultation' : 'consultations'}
        </span>
      </div>

      {/* View profile button */}
      <Button onClick={() => navigate(`/patient/doctors/${doctor.id}`)} className="w-full">
        View Doctor Profile
      </Button>
    </div>
  );
}
