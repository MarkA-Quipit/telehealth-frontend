import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/shared/components/UnsavedChangesDialog';
import { toast } from 'sonner';
import { Dialog } from 'radix-ui';
import { useAppointment, useCancelAppointment, useNotes, usePrescriptions, useRescheduleAppointment } from '../hooks/useAppointments';
import { useDoctorReviews, useAvailableSlots } from '@/features/doctors/hooks/useDoctors';
import { submitReview } from '@/features/doctors/api/doctors.api';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { formatDateLong, formatTime } from '@/shared/lib/date';
import { formatDuration } from '@/shared/lib/utils';
import api from '@/shared/lib/api';
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

  const { blocker } = useUnsavedChanges((rating > 0 || comment.trim() !== '') && !submitted);

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
      <UnsavedChangesDialog blocker={blocker} />
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
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');

  const { data: appointment, isLoading } = useAppointment(id);
  const cancelMutation = useCancelAppointment();
  const rescheduleMutation = useRescheduleAppointment();
  const { data: availableSlots = [], isFetching: slotsFetching } = useAvailableSlots(
    appointment?.doctor.id,
    rescheduleDate || undefined,
  );
  const { data: notes } = useNotes(id);
  const { data: prescriptions } = usePrescriptions(id);

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
    if (!id || !rescheduleSlot) return;
    try {
      const newAppt = await rescheduleMutation.mutateAsync({
        id,
        dto: { newScheduledAt: rescheduleSlot },
      });
      toast.success('Appointment rescheduled');
      setRescheduleOpen(false);
      navigate(`/patient/appointments/${newAppt.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reschedule');
    }
  }

  async function handleCalendarDownload() {
    try {
      const res = await api.get(`/api/appointments/${id}/calendar`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointment-${id}.ics`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download calendar file');
    }
  }

  function handleRescheduleOpenChange(open: boolean) {
    setRescheduleOpen(open);
    if (!open) {
      setRescheduleDate('');
      setRescheduleSlot('');
    }
  }

  const isCompleted = appointment.status === 'completed';

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link to="/patient/appointments" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 transition">
        ← My Appointments
      </Link>

      {/* Join session — full width when visible */}
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

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Doctor info */}
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

          {/* Details */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-900">Details</h3>
              {isActionable && (
                <button
                  onClick={handleCalendarDownload}
                  className="text-xs font-medium text-sky-700 hover:text-sky-600 transition"
                >
                  + Add to Calendar
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-neutral-500">Reason for visit</p>
                <p className="text-neutral-800 mt-0.5">{appointment.reasonForVisit ?? 'No reason provided'}</p>
              </div>
              <div>
                <p className="text-neutral-500">Duration</p>
                <span className="mt-1 inline-flex items-center rounded-full bg-sky-100 text-sky-700 px-2.5 py-0.5 text-xs font-medium">
                  {formatDuration(appointment.durationMinutes)} session
                </span>
              </div>
            </div>
          </div>

          {/* Cancel + Reschedule */}
          {isActionable && (
            <div className="flex gap-3">
              {/* Reschedule */}
              <Dialog.Root open={rescheduleOpen} onOpenChange={handleRescheduleOpenChange}>
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

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-neutral-700">Select a new date</label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => { setRescheduleDate(e.target.value); setRescheduleSlot(''); }}
                        className="w-full h-10 rounded-lg bg-neutral-100 px-3 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
                      />
                    </div>

                    {rescheduleDate && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-700">Available slots</p>
                        {slotsFetching ? (
                          <p className="text-sm text-neutral-400">Loading slots…</p>
                        ) : availableSlots.length === 0 ? (
                          <p className="text-sm text-neutral-500">No available slots on this date.</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot.startTime}
                                type="button"
                                onClick={() => setRescheduleSlot(slot.startTime)}
                                className={`rounded-lg px-2 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                                  rescheduleSlot === slot.startTime
                                    ? 'bg-sky-100 text-sky-700 ring-1 ring-sky-400'
                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                              >
                                {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Dialog.Close asChild>
                        <Button variant="secondary" className="flex-1">Keep Appointment</Button>
                      </Dialog.Close>
                      <Button
                        onClick={handleReschedule}
                        disabled={!rescheduleSlot || rescheduleMutation.isPending}
                        className="flex-1 disabled:cursor-not-allowed"
                      >
                        {rescheduleMutation.isPending ? 'Rescheduling…' : 'Confirm'}
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

          {/* Review — always shown; disabled if not completed */}
          <div className={isCompleted ? undefined : 'opacity-50 pointer-events-none select-none'}>
            {isCompleted ? (
              <LeaveReviewSection
                appointmentId={appointment.id}
                doctorId={appointment.doctor.id}
              />
            ) : (
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
                <h3 className="text-base font-semibold text-neutral-900">Leave a Review</h3>
                <p className="text-sm text-neutral-400">Available after the consultation is completed.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Consultation notes */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-base font-semibold text-neutral-900">Consultation Notes</h3>
            {isCompleted && notes ? (
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
              <p className="text-sm text-neutral-400">
                {isCompleted ? 'No consultation notes available.' : 'Available after the consultation is completed.'}
              </p>
            )}
          </div>

          {/* Prescriptions */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-base font-semibold text-neutral-900">Prescriptions</h3>
            {isCompleted && prescriptions && prescriptions.length > 0 ? (
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
              <p className="text-sm text-neutral-400">
                {isCompleted ? 'No prescriptions issued.' : 'Available after the consultation is completed.'}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
