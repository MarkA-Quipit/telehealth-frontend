import { useNavigate, useParams } from 'react-router-dom';
import { useDoctor, useDoctorReviews } from '../hooks/useDoctors';
import { formatDate } from '@/shared/lib/date';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import type { Review } from '../types';


function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-neutral-200 shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-6 bg-neutral-200 rounded w-1/2" />
            <div className="h-4 bg-neutral-200 rounded w-1/3" />
            <div className="h-5 bg-neutral-200 rounded-full w-1/4" />
          </div>
        </div>
      </div>
      <div className="h-32 bg-neutral-200 rounded-xl" />
      <div className="h-16 bg-neutral-200 rounded-xl" />
      <div className="h-12 bg-neutral-200 rounded-xl" />
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < Math.round(rating) ? 'text-amber-400' : 'text-neutral-300'}
          style={{ fontSize: '1rem' }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewsSection({ doctorId }: { doctorId: string }) {
  const { data: reviews = [], isLoading } = useDoctorReviews(doctorId);

  if (isLoading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3 animate-pulse">
        <div className="h-5 bg-neutral-200 rounded w-1/4" />
        <div className="h-12 bg-neutral-200 rounded-lg" />
        <div className="h-20 bg-neutral-200 rounded-lg" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Reviews</h3>
        <p className="text-sm text-neutral-400 italic">No reviews yet</p>
      </div>
    );
  }

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const total = reviews.length;

  // Count per star level
  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-5">
      <h3 className="text-base font-semibold text-neutral-900">Reviews</h3>

      {/* Summary */}
      <div className="flex items-start gap-6">
        <div className="text-center shrink-0">
          <p className="text-4xl font-semibold text-neutral-900">{avg.toFixed(1)}</p>
          <StarDisplay rating={avg} />
          <p className="text-xs text-neutral-500 mt-1">{total} {total === 1 ? 'review' : 'reviews'}</p>
        </div>

        {/* Star breakdown bars */}
        <div className="flex-1 space-y-1.5">
          {starCounts.map(({ star, count }) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="w-6 text-right shrink-0">{star}★</span>
                <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review list */}
      <div className="divide-y divide-neutral-100">
        {reviews.map((review: Review) => {
          const reviewDate = formatDate(review.createdAt);

          return (
            <div key={review.id} className="py-4 space-y-1.5">
              <div className="flex items-center gap-3">
                <Avatar
                  firstName={review.patient.firstName}
                  lastName={review.patient.lastName}
                  profilePictureUrl={review.patient.profilePictureUrl}
                  size="xs"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {review.patient.firstName} {review.patient.lastName}
                  </p>
                  <p className="text-xs text-neutral-400">{reviewDate}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < review.rating ? 'text-amber-400' : 'text-neutral-300'}
                      style={{ fontSize: '0.8rem' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-neutral-600 leading-relaxed pl-11">{review.comment}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: doctor, isLoading, isError } = useDoctor(id);

  if (isLoading) return <ProfileSkeleton />;

  if (isError || !doctor) {
    return (
      <EmptyState
        icon={
          <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.07 16.5C2.3 17.333 3.262 19 4.802 19z" />
          </svg>
        }
        title="Doctor not found"
        description="This doctor profile could not be loaded."
        action={<Button onClick={() => navigate('/patient/doctors')}>Back to Doctors</Button>}
      />
    );
  }

  const fullName = `${doctor.firstName} ${doctor.lastName}`;
  const feeDisplay =
    doctor.consultationFee != null
      ? `₱${(doctor.consultationFee / 100).toLocaleString()}`
      : null;

  return (
    <div className="space-y-6">
      {/* Back link — hardcoded to avoid history-stack issues after booking */}
      <button
        onClick={() => navigate('/patient/doctors')}
        className="text-sm text-sky-600 hover:text-sky-800 font-medium transition flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Doctors
      </button>

      {/* Hero card */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <Avatar
            firstName={doctor.firstName}
            lastName={doctor.lastName}
            profilePictureUrl={doctor.profilePictureUrl}
            size="xl"
          />

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{fullName}</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{doctor.specialization}</p>

            {/* Star rating — hidden if no reviews */}
            {doctor.reviewCount > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <StarDisplay rating={doctor.averageRating ?? 0} />
                <span className="text-sm font-medium text-neutral-700">
                  {(doctor.averageRating ?? 0).toFixed(1)}
                </span>
                <span className="text-sm text-neutral-500">
                  · {doctor.reviewCount} {doctor.reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}

            {/* Completed consultations */}
            {doctor.completedConsultationsCount > 0 && (
              <p className="text-sm text-neutral-500 mt-0.5">
                {doctor.completedConsultationsCount} completed {doctor.completedConsultationsCount === 1 ? 'consultation' : 'consultations'}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  doctor.isAcceptingPatients
                    ? 'bg-green-100 text-green-700'
                    : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {doctor.isAcceptingPatients ? 'Accepting' : 'Not Accepting'}
              </span>
              {doctor.isVerified && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-sky-100 text-sky-700">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">About</h3>
        {doctor.bio ? (
          <p className="text-sm text-neutral-600 leading-relaxed">{doctor.bio}</p>
        ) : (
          <p className="text-sm text-neutral-400 italic">No bio available.</p>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <h3 className="text-base font-semibold text-neutral-900 mb-3">Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-500">Years of Experience</p>
            <p className="text-sm font-medium text-neutral-900 mt-0.5">
              {doctor.yearsOfExperience != null ? `${doctor.yearsOfExperience} years` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Consultation Fee</p>
            <p className="text-sm font-medium text-neutral-900 mt-0.5">
              {feeDisplay ? `${feeDisplay} / session` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Book CTA */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="w-full">
              <button
                onClick={() => doctor.isAcceptingPatients ? navigate(`/patient/appointments/book?doctorId=${doctor.id}`) : undefined}
                disabled={!doctor.isAcceptingPatients}
                className={`w-full font-medium rounded-lg px-4 py-3 text-sm transition ${
                  doctor.isAcceptingPatients
                    ? 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                    : 'bg-sky-100 text-sky-700 opacity-50 cursor-not-allowed'
                }`}
              >
                Book Appointment
              </button>
            </span>
          </TooltipTrigger>
          {!doctor.isAcceptingPatients && (
            <TooltipContent side="top">Currently Not Accepting</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Reviews */}
      <ReviewsSection doctorId={doctor.id} />
    </div>
  );
}
