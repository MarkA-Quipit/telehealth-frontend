import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { useAppointment, useCancelAppointment, useNotes, usePrescriptions } from '../hooks/useAppointments';
import { useDoctorReviews } from '@/features/doctors/hooks/useDoctors';
import { submitReview } from '@/features/doctors/api/doctors.api';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { formatDateLong, formatTime } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { AppointmentStatusBadge } from '../components/AppointmentStatusBadge';

function SkeletonPage() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto animate-pulse">
      <div className="h-4 w-24 bg-neutral-100 rounded" />
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
        <div className="h-5 w-48 bg-neutral-100 rounded" />
        <div className="h-4 w-32 bg-neutral-100 rounded" />
        <div className="h-5 w-20 bg-neutral-100 rounded-full" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Star selector
// ---------------------------------------------------------------------------
function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-colors focus:outline-none"
          style={{ color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db' }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Leave Review section
// ---------------------------------------------------------------------------
function LeaveReviewSection({
  appointmentId,
  doctorId,
}: {
  appointmentId: string;
  doctorId: string;
}) {
  const queryClient = useQueryClient();
  const { data: reviews = [] } = useDoctorReviews(doctorId);

  const existing = reviews.find((r) => r.appointmentId === appointmentId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ rating: number; comment: string | null } | null>(
    existing ? { rating: existing.rating, comment: existing.comment } : null,
  );

  if (submitted) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-2">
        <h3 className="text-base font-semibold text-neutral-900">Your Review</h3>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} style={{ color: s <= submitted.rating ? '#f59e0b' : '#d1d5db', fontSize: '1.2rem' }}>
              ★
            </span>
          ))}
        </div>
        {submitted.comment && (
          <p className="text-sm text-neutral-600 leading-relaxed">{submitted.comment}</p>
        )}
      </div>
    );
  }

  async function handleSubmit() {
    if (!rating) {
      toast.error('Please select a star rating');
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(doctorId, { appointmentId, rating, comment: comment || undefined });
      toast.success('Review submitted');
      setSubmitted({ rating, comment: comment || null });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctors.reviews(doctorId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.doctors.detail(doctorId) });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review';
      if (msg.includes('already')) {
        toast.error("You've already reviewed this consultation");
        setSubmitted({ rating, comment: comment || null });
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
      <h3 className="text-base font-semibold text-neutral-900">Leave a Review</h3>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">Rating</label>
        <StarSelector value={rating} onChange={setRating} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">
          Comment <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Share your experience…"
          className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
        />
        <p className="text-xs text-neutral-400 text-right">{comment.length}/1000</p>
      </div>

      <Button onClick={handleSubmit} disabled={submitting || !rating} className="disabled:cursor-not-allowed">
        {submitting ? 'Submitting…' : 'Submit Review'}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const { data: appointment, isLoading } = useAppointment(id);
  const cancelMutation = useCancelAppointment();
  const { data: notes } = useNotes(appointment?.status === 'completed' ? id : null);
  const { data: prescriptions } = usePrescriptions(appointment?.status === 'completed' ? id : null);

  if (isLoading) return <SkeletonPage />;
  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-neutral-500 mb-3">Appointment not found.</p>
        <Link to="/patient/appointments" className="text-sky-700 text-sm hover:underline">
          ← Back to appointments
        </Link>
      </div>
    );
  }

  const scheduled = new Date(appointment.scheduledAt);
  const endsAt = new Date(appointment.endsAt);
  const now = new Date();

  const joinStart = new Date(scheduled.getTime() - 5 * 60 * 1000);
  const joinEnd   = new Date(endsAt.getTime() + 15 * 60 * 1000);
  const isEligible = appointment.status === 'confirmed' && now >= joinStart && now <= joinEnd;
  const isConfirmed = appointment.status === 'confirmed';
  const isActionable = appointment.status === 'pending' || appointment.status === 'confirmed';

  async function handleCancel() {
    if (!id) return;
    try {
      await cancelMutation.mutateAsync({ id, dto: { cancellationReason: cancelReason } });
      toast.success('Appointment cancelled');
      setCancelOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel');
    }
  }

  async function handleReschedule() {
    if (!id || !appointment) return;
    try {
      await cancelMutation.mutateAsync({
        id,
        dto: { cancellationReason: 'Rescheduled by patient' },
      });
      setRescheduleOpen(false);
      navigate(`/patient/appointments/book?doctorId=${appointment.doctor.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel for reschedule');
    }
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Back link */}
      <Link to="/patient/appointments" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 transition">
        ← My Appointments
      </Link>

      {/* Header card */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center shrink-0 text-sky-700 font-semibold">
            {appointment.doctor.profilePictureUrl ? (
              <img src={appointment.doctor.profilePictureUrl} className="w-full h-full object-cover rounded-full" alt="" />
            ) : (
              `${appointment.doctor.firstName[0]}${appointment.doctor.lastName[0]}`
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-neutral-900">
              Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
            </p>
            <p className="text-sm text-neutral-500">{appointment.doctor.specialization}</p>
            <p className="text-sm text-neutral-700 mt-1">
              {formatDateLong(appointment.scheduledAt)}
              {' · '}
              {formatTime(appointment.scheduledAt)}
            </p>
          </div>
          <AppointmentStatusBadge status={appointment.status as 'pending' | 'confirmed' | 'cancelled' | 'completed'} />
        </div>
      </div>

      {/* Join session */}
      {isConfirmed && (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
          <h3 className="text-base font-semibold text-neutral-900 mb-3">Video Consultation</h3>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => isEligible && navigate(`/patient/consultation/${id}`)}
              disabled={!isEligible}
              title={!isEligible ? 'Session not yet available' : undefined}
              className="disabled:cursor-not-allowed"
            >
              Join Consultation
            </Button>
            {!isEligible && (
              <p className="text-xs text-neutral-500">
                Session opens 5 minutes before scheduled time.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Appointment details */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
        <h3 className="text-base font-semibold text-neutral-900">Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-neutral-500">Reason for visit</p>
            <p className="text-neutral-800 mt-0.5">{appointment.reasonForVisit ?? 'No reason provided'}</p>
          </div>
          <div>
            <p className="text-neutral-500">Duration</p>
            <p className="text-neutral-800 mt-0.5">{appointment.durationMinutes} minutes</p>
          </div>
        </div>
      </div>

      {/* Cancel + Reschedule — shown when pending or confirmed */}
      {isActionable && (
        <div className="flex gap-3">
          {/* Reschedule */}
          <Dialog.Root open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
            <Dialog.Trigger asChild>
              <Button variant="secondary" className="flex-1 py-2.5">
                Reschedule
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-xl shadow-md p-6 z-50 space-y-4">
                <Dialog.Title className="text-base font-semibold text-neutral-900">
                  Reschedule Appointment
                </Dialog.Title>
                <p className="text-sm text-neutral-600">
                  Rescheduling will cancel this appointment and take you to book a new time with the same doctor.
                </p>
                <div className="flex gap-3">
                  <Dialog.Close asChild>
                    <Button variant="secondary" className="flex-1">Keep Appointment</Button>
                  </Dialog.Close>
                  <Button
                    onClick={handleReschedule}
                    disabled={cancelMutation.isPending}
                    className="flex-1"
                  >
                    {cancelMutation.isPending ? 'Processing…' : 'Confirm Reschedule'}
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Cancel */}
          <Dialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
            <Dialog.Trigger asChild>
              <Button variant="destructive" className="flex-1 py-2.5">
                Cancel Appointment
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-xl shadow-md p-6 z-50 space-y-4">
                <Dialog.Title className="text-base font-semibold text-neutral-900">
                  Cancel Appointment
                </Dialog.Title>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    placeholder="Reason for cancellation (optional)"
                    className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <Dialog.Close asChild>
                    <Button variant="secondary" className="flex-1">Keep Appointment</Button>
                  </Dialog.Close>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="flex-1"
                  >
                    {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Appointment'}
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      )}

      {/* Medical records — completed only */}
      {appointment.status === 'completed' && (
        <>
          {/* Consultation notes */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-base font-semibold text-neutral-900">Consultation Notes</h3>
            {notes ? (
              <dl className="space-y-2 text-sm">
                {notes.chiefComplaint && (
                  <div>
                    <dt className="text-neutral-500">Chief Complaint</dt>
                    <dd className="text-neutral-800 mt-0.5">{notes.chiefComplaint}</dd>
                  </div>
                )}
                {notes.diagnosis && (
                  <div>
                    <dt className="text-neutral-500">Diagnosis</dt>
                    <dd className="text-neutral-800 mt-0.5">{notes.diagnosis}</dd>
                  </div>
                )}
                {notes.notes && (
                  <div>
                    <dt className="text-neutral-500">Notes</dt>
                    <dd className="text-neutral-800 mt-0.5 whitespace-pre-wrap">{notes.notes}</dd>
                  </div>
                )}
                {notes.followUpDate && (
                  <div>
                    <dt className="text-neutral-500">Follow-up Date</dt>
                    <dd className="text-neutral-800 mt-0.5">{notes.followUpDate}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-neutral-500">No consultation notes available</p>
            )}
          </div>

          {/* Prescriptions */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-base font-semibold text-neutral-900">Prescriptions</h3>
            {prescriptions && prescriptions.length > 0 ? (
              <ul className="space-y-3">
                {prescriptions.map((rx) => (
                  <li key={rx.id} className="text-sm border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                    <p className="font-semibold text-neutral-900">{rx.medicationName}</p>
                    {rx.dosage    && <p className="text-neutral-600">Dosage: {rx.dosage}</p>}
                    {rx.frequency && <p className="text-neutral-600">Frequency: {rx.frequency}</p>}
                    {rx.duration  && <p className="text-neutral-600">Duration: {rx.duration}</p>}
                    {rx.instructions && (
                      <p className="text-neutral-500 mt-1 italic">{rx.instructions}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">No prescriptions issued</p>
            )}
          </div>

          {/* Leave a Review */}
          <LeaveReviewSection
            appointmentId={appointment.id}
            doctorId={appointment.doctor.id}
          />
        </>
      )}
    </div>
  );
}
