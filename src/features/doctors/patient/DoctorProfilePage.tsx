import { useNavigate, useParams } from 'react-router-dom';
import { useDoctor } from '../hooks/useDoctors';

function getInitials(firstName: string, lastName: string): string {
  return (firstName[0]?.toUpperCase() ?? '') + (lastName[0]?.toUpperCase() ?? '');
}

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

export function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: doctor, isLoading, isError } = useDoctor(id);

  if (isLoading) return <ProfileSkeleton />;

  if (isError || !doctor) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.07 16.5C2.3 17.333 3.262 19 4.802 19z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-1">Doctor not found</h3>
        <p className="text-sm text-neutral-500 mb-4">
          This doctor profile could not be loaded.
        </p>
        <button
          onClick={() => navigate('/patient/doctors')}
          className="bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-2 text-sm transition"
        >
          Back to Doctors
        </button>
      </div>
    );
  }

  const initials = getInitials(doctor.firstName, doctor.lastName);
  const fullName = `${doctor.firstName} ${doctor.lastName}`;
  const feeDisplay =
    doctor.consultationFee != null
      ? `₱${(doctor.consultationFee / 100).toLocaleString()}`
      : null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-sky-600 hover:text-sky-800 font-medium transition flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Hero card */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          {doctor.profilePictureUrl ? (
            <img
              src={doctor.profilePictureUrl}
              alt={fullName}
              className="w-20 h-20 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-sky-100 text-sky-700 font-semibold flex items-center justify-center text-2xl shrink-0">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{fullName}</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{doctor.specialization}</p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  doctor.isAcceptingPatients
                    ? 'bg-green-100 text-green-700'
                    : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {doctor.isAcceptingPatients ? 'Accepting Patients' : 'Not Accepting'}
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
      {doctor.isAcceptingPatients && (
        <button
          onClick={() => navigate(`/patient/appointments/book?doctorId=${doctor.id}`)}
          className="w-full bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-3 text-sm transition"
        >
          Book Appointment
        </button>
      )}
    </div>
  );
}