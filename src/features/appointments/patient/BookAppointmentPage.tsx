import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/shared/components/UnsavedChangesDialog';
import { toast } from 'sonner';
import { useDoctor } from '@/features/doctors/hooks/useDoctors';
import { Avatar } from '@/shared/components/Avatar';
import { AvailabilityCalendar } from '@/features/doctors/components/AvailabilityCalendar';
import { useCreateAppointment, useBookingLimitCheck } from '../hooks/useAppointments';
import { Button } from '@/shared/ui/button';

interface SelectedSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export function BookAppointmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const locationState = location.state as { symptoms?: string; doctorId?: string } | null;

  const doctorId = searchParams.get('doctorId') ?? locationState?.doctorId ?? '';

  const { data: doctor, isLoading: isDoctorLoading } = useDoctor(doctorId || null);
  const { data: limitCheck } = useBookingLimitCheck(doctorId || null);
  const createAppointment = useCreateAppointment();

  const atLimit = limitCheck?.canBook === false;

  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [reason, setReason] = useState(locationState?.symptoms ?? '');
  const [error, setError] = useState('');

  const isDirty = selectedSlot !== null || reason.trim() !== '';
  const canSubmit = !!selectedSlot && reason.trim().length > 0 && !atLimit;
  const { blocker, clearDirty } = useUnsavedChanges(isDirty);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setError('');

    const scheduledAt = new Date(`${selectedSlot.date}T${selectedSlot.startTime}:00`).toISOString();

    try {
      await createAppointment.mutateAsync({
        doctorId,
        scheduledAt,
        durationMinutes: 30,
        reasonForVisit: reason.trim(),
      });
      toast.success('Appointment booked successfully');
      clearDirty();
      navigate('/patient/appointments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    }
  }

  if (!doctorId) {
    return (
      <div className="p-6 text-center text-neutral-500">
        No doctor selected.{' '}
        <Link to="/patient/doctors" className="text-sky-700 hover:underline">
          Browse doctors
        </Link>
      </div>
    );
  }

  return (
    <>
      <UnsavedChangesDialog blocker={blocker} />

      <div className="space-y-6">
        {/* Back link — full width */}
        <Link
          to={doctorId ? `/patient/doctors/${doctorId}` : '/patient/doctors'}
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 transition"
        >
          ← Back to Doctor Profile
        </Link>

        {/* 2-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left col — doctor summary + calendar */}
          <div className="flex-[3] min-w-0 space-y-4">

            {/* Doctor summary */}
            {isDoctorLoading ? (
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-neutral-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-36 bg-neutral-100 rounded" />
                    <div className="h-3 w-24 bg-neutral-100 rounded" />
                  </div>
                </div>
              </div>
            ) : doctor ? (
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
                <Avatar
                  firstName={doctor.firstName}
                  lastName={doctor.lastName}
                  profilePictureUrl={doctor.profilePictureUrl}
                  size="lg"
                />
                <div>
                  <p className="text-base font-semibold text-neutral-900">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </p>
                  <p className="text-sm text-neutral-500">{doctor.specialization}</p>
                  {doctor.consultationFee != null && (
                    <p className="text-sm text-neutral-700 mt-1">
                      ₱{(doctor.consultationFee / 100).toFixed(2)} / session
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {/* Calendar */}
            <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
              <h3 className="text-base font-semibold text-neutral-900 mb-4">Select Date &amp; Time</h3>
              <AvailabilityCalendar
                doctorId={doctorId}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
              />
            </div>
          </div>

          {/* Right col — reason, limit banner, submit */}
          <div className="flex-[2] min-w-0 space-y-4">

            {/* Limit banner */}
            {atLimit && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                You already have {limitCheck!.limit} active appointments with this doctor. Cancel or complete one before booking again.{' '}
                <Link to="/patient/appointments" className="font-medium underline hover:text-amber-900">
                  View My Appointments
                </Link>
              </div>
            )}

            {/* Reason for visit */}
            <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
              <h3 className="text-base font-semibold text-neutral-900 mb-3">Reason for Visit</h3>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  Describe your reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Describe your reason for visit…"
                  required
                  className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
                />
                <p className="text-xs text-neutral-400 text-right">{reason.length}/500</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Notice */}
            <p className="text-xs text-neutral-500">
              You may book up to {limitCheck?.limit ?? 2} appointments per doctor at a time.{' '}
              <Link to="/patient/appointments" className="text-sky-600 hover:text-sky-800 font-medium">
                My Appointments
              </Link>
            </p>

            {/* Submit */}
            <form onSubmit={handleSubmit}>
              <Button
                type="submit"
                disabled={!canSubmit || createAppointment.isPending}
                className="w-full py-3 disabled:cursor-not-allowed"
              >
                {createAppointment.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Booking…
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
