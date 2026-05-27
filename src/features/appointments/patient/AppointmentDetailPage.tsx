import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { useAppointment, useCancelAppointment, useNotes, usePrescriptions } from '../hooks/useAppointments';
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

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);

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

  // Join eligibility: confirmed + within [scheduled - 5min, ends + 15min]
  const joinStart = new Date(scheduled.getTime() - 5 * 60 * 1000);
  const joinEnd   = new Date(endsAt.getTime() + 15 * 60 * 1000);
  const isEligible = appointment.status === 'confirmed' && now >= joinStart && now <= joinEnd;
  const isConfirmed = appointment.status === 'confirmed';

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
              {scheduled.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {' · '}
              {scheduled.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
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
            <button
              onClick={() => isEligible && navigate(`/patient/consultation/${id}`)}
              disabled={!isEligible}
              title={!isEligible ? 'Session not yet available' : undefined}
              className="bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Consultation
            </button>
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

      {/* Cancel appointment */}
      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
        <Dialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
          <Dialog.Trigger asChild>
            <button className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg px-4 py-2.5 text-sm transition">
              Cancel Appointment
            </button>
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
                  <button className="flex-1 border border-neutral-200 bg-white text-neutral-700 font-medium rounded-lg px-4 py-2 text-sm hover:bg-neutral-50 transition">
                    Keep Appointment
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg px-4 py-2 text-sm transition disabled:opacity-50"
                >
                  {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Appointment'}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
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
        </>
      )}
    </div>
  );
}
