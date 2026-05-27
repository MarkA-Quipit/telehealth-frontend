import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useDoctor } from '@/features/doctors/hooks/useDoctors';
import { AvailabilityCalendar } from '@/features/doctors/components/AvailabilityCalendar';
import { useCreateAppointment } from '../hooks/useAppointments';

interface SelectedSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export function BookAppointmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctorId') ?? '';

  const { data: doctor, isLoading: isDoctorLoading } = useDoctor(doctorId || null);
  const createAppointment = useCreateAppointment();

  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setError('');

    // Build ISO UTC datetime from local date + time
    const scheduledAt = new Date(`${selectedSlot.date}T${selectedSlot.startTime}:00`).toISOString();

    try {
      await createAppointment.mutateAsync({
        doctorId,
        scheduledAt,
        durationMinutes: 30,
        reasonForVisit: reason.trim() || undefined,
      });
      toast.success('Appointment booked successfully');
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
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        to={doctorId ? `/patient/doctors/${doctorId}` : '/patient/doctors'}
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 transition"
      >
        ← Back to Doctor Profile
      </Link>

      {/* Doctor summary */}
      {isDoctorLoading ? (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
          <div className="animate-pulse space-y-2">
            <div className="h-5 w-40 bg-neutral-100 rounded" />
            <div className="h-4 w-28 bg-neutral-100 rounded" />
          </div>
        </div>
      ) : doctor ? (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center shrink-0 text-sky-700 text-lg font-semibold">
            {doctor.profilePictureUrl ? (
              <img
                src={doctor.profilePictureUrl}
                alt={`${doctor.firstName} ${doctor.lastName}`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              `${doctor.firstName[0]}${doctor.lastName[0]}`
            )}
          </div>
          <div>
            <p className="text-base font-semibold text-neutral-900">
              Dr. {doctor.firstName} {doctor.lastName}
            </p>
            <p className="text-sm text-neutral-500">{doctor.specialization}</p>
            {doctor.consultationFee != null && (
              <p className="text-sm text-neutral-700 mt-1">
                Consultation fee: ₱{(doctor.consultationFee / 100).toFixed(2)}
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

      {/* Reason for visit */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <h3 className="text-base font-semibold text-neutral-900 mb-3">Reason for Visit</h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">
            Describe your reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Describe your reason for visit…"
            className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
          />
          <p className="text-xs text-neutral-400 text-right">{reason.length}/500</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Submit */}
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={!selectedSlot || createAppointment.isPending}
          className="w-full bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-3 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
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
        </button>
      </form>
    </div>
  );
}
