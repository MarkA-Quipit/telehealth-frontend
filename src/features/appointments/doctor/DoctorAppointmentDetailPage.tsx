import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { useAppointment, useUpdateStatus, useCancelAppointment, useNotes, useSaveNotes, usePrescriptions, useAddPrescription, useDeletePrescription } from '../hooks/useAppointments';
import { usePatient } from '@/features/patients/hooks/usePatient';
import { AppointmentStatusBadge } from '../components/AppointmentStatusBadge';

function SkeletonPage() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto animate-pulse">
      <div className="h-4 w-24 bg-neutral-100 rounded" />
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
        <div className="h-5 w-48 bg-neutral-100 rounded" />
        <div className="h-4 w-32 bg-neutral-100 rounded" />
      </div>
    </div>
  );
}

export function DoctorAppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: appointment, isLoading } = useAppointment(id);
  const { data: patientMedical } = usePatient(appointment?.patient.id ?? null);
  const { data: notes } = useNotes(id);
  const { data: rxList = [], isLoading: rxLoading } = usePrescriptions(id);

  const updateStatus = useUpdateStatus();
  const cancelMutation = useCancelAppointment();
  const saveNotesMutation = useSaveNotes();
  const addRxMutation = useAddPrescription();
  const deleteRxMutation = useDeletePrescription();

  // Cancel dialog state
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Notes form state
  const [noteForm, setNoteForm] = useState({
    chiefComplaint: notes?.chiefComplaint ?? '',
    diagnosis: notes?.diagnosis ?? '',
    notes: notes?.notes ?? '',
    followUpDate: notes?.followUpDate ?? '',
  });

  // Sync form when notes load
  if (notes && noteForm.chiefComplaint === '' && noteForm.diagnosis === '' && noteForm.notes === '') {
    setNoteForm({
      chiefComplaint: notes.chiefComplaint ?? '',
      diagnosis: notes.diagnosis ?? '',
      notes: notes.notes ?? '',
      followUpDate: notes.followUpDate ?? '',
    });
  }

  // Prescription form state
  const [rxForm, setRxForm] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  if (isLoading) return <SkeletonPage />;
  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-neutral-500 mb-3">Appointment not found.</p>
        <Link to="/doctor/appointments" className="text-sky-700 text-sm hover:underline">← Back</Link>
      </div>
    );
  }

  const scheduled = new Date(appointment.scheduledAt);
  const endsAt    = new Date(appointment.endsAt);
  const now       = new Date();

  const joinStart  = new Date(scheduled.getTime() - 5 * 60 * 1000);
  const joinEnd    = new Date(endsAt.getTime() + 15 * 60 * 1000);
  const isEligible = appointment.status === 'confirmed' && now >= joinStart && now <= joinEnd;

  async function handleConfirm() {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({ id, dto: { status: 'confirmed' } });
      toast.success('Appointment confirmed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm');
    }
  }

  async function handleComplete() {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({ id, dto: { status: 'completed' } });
      toast.success('Appointment completed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete');
    }
  }

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

  async function handleSaveNotes(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    try {
      await saveNotesMutation.mutateAsync({
        appointmentId: id,
        data: {
          chiefComplaint: noteForm.chiefComplaint || undefined,
          diagnosis: noteForm.diagnosis || undefined,
          notes: noteForm.notes || undefined,
          followUpDate: noteForm.followUpDate || undefined,
        },
      });
      toast.success('Notes saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save notes');
    }
  }

  async function handleAddRx(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !rxForm.medicationName.trim()) return;
    try {
      await addRxMutation.mutateAsync({
        appointmentId: id,
        data: {
          medicationName: rxForm.medicationName.trim(),
          dosage: rxForm.dosage || undefined,
          frequency: rxForm.frequency || undefined,
          duration: rxForm.duration || undefined,
          instructions: rxForm.instructions || undefined,
        },
      });
      setRxForm({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add prescription');
    }
  }

  async function handleDeleteRx(prescriptionId: string) {
    if (!id) return;
    try {
      await deleteRxMutation.mutateAsync({ appointmentId: id, prescriptionId });
      toast.success('Prescription removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove');
    }
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Back */}
      <Link to="/doctor/appointments" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 transition">
        ← Appointments
      </Link>

      {/* Header card */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-neutral-900">
              {appointment.patient.firstName} {appointment.patient.lastName}
            </p>
            <p className="text-sm text-neutral-500 mt-0.5">
              {scheduled.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {' · '}
              {scheduled.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </p>
            {appointment.reasonForVisit && (
              <p className="text-sm text-neutral-600 mt-1 italic">"{appointment.reasonForVisit}"</p>
            )}
          </div>
          <AppointmentStatusBadge status={appointment.status as 'pending' | 'confirmed' | 'cancelled' | 'completed'} />
        </div>
      </div>

      {/* Action buttons */}
      {appointment.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={updateStatus.isPending}
            className="flex-1 bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-50"
          >
            {updateStatus.isPending ? 'Confirming…' : 'Confirm Appointment'}
          </button>
          <Dialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
            <Dialog.Trigger asChild>
              <button className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg px-4 py-2.5 text-sm transition">
                Cancel
              </button>
            </Dialog.Trigger>
            <CancelDialog
              reason={cancelReason}
              onChange={setCancelReason}
              onConfirm={handleCancel}
              isPending={cancelMutation.isPending}
            />
          </Dialog.Root>
        </div>
      )}

      {appointment.status === 'confirmed' && (
        <div className="flex gap-3">
          <button
            onClick={handleComplete}
            disabled={updateStatus.isPending}
            className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 font-medium rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-50"
          >
            {updateStatus.isPending ? 'Completing…' : 'Mark as Completed'}
          </button>
          <button
            onClick={() => isEligible && navigate(`/doctor/consultation/${id}`)}
            disabled={!isEligible}
            title={!isEligible ? 'Session not yet available' : undefined}
            className="flex-1 bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-2.5 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Session
          </button>
          <Dialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
            <Dialog.Trigger asChild>
              <button className="bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg px-4 py-2.5 text-sm transition">
                Cancel
              </button>
            </Dialog.Trigger>
            <CancelDialog
              reason={cancelReason}
              onChange={setCancelReason}
              onConfirm={handleCancel}
              isPending={cancelMutation.isPending}
            />
          </Dialog.Root>
        </div>
      )}

      {/* Patient medical info */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
        <h3 className="text-base font-semibold text-neutral-900">Patient Medical Info</h3>
        {!patientMedical ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-32 bg-neutral-100 rounded" />
            <div className="h-4 w-48 bg-neutral-100 rounded" />
          </div>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-neutral-500">Blood Type</dt>
              <dd className="text-neutral-800 mt-0.5">{patientMedical.bloodType ?? 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Allergies</dt>
              <dd className="text-neutral-800 mt-0.5">{patientMedical.allergies ?? 'Not provided'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-neutral-500">Medical History</dt>
              <dd className="text-neutral-800 mt-0.5 whitespace-pre-wrap">{patientMedical.medicalHistory ?? 'Not provided'}</dd>
            </div>
          </dl>
        )}
      </div>

      {/* Consultation notes form */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Consultation Notes</h3>
        <form onSubmit={handleSaveNotes} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Chief Complaint</label>
            <textarea
              rows={2}
              value={noteForm.chiefComplaint}
              onChange={(e) => setNoteForm((f) => ({ ...f, chiefComplaint: e.target.value }))}
              className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Diagnosis</label>
            <textarea
              rows={2}
              value={noteForm.diagnosis}
              onChange={(e) => setNoteForm((f) => ({ ...f, diagnosis: e.target.value }))}
              className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Notes</label>
            <textarea
              rows={4}
              value={noteForm.notes}
              onChange={(e) => setNoteForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Follow-up Date</label>
            <input
              type="date"
              value={noteForm.followUpDate}
              onChange={(e) => setNoteForm((f) => ({ ...f, followUpDate: e.target.value }))}
              className="w-full h-10 rounded-lg bg-neutral-100 px-3 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={saveNotesMutation.isPending}
            className="bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-2 text-sm transition disabled:opacity-50"
          >
            {saveNotesMutation.isPending ? 'Saving…' : 'Save Notes'}
          </button>
        </form>
      </div>

      {/* Prescriptions */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
        <h3 className="text-base font-semibold text-neutral-900">Prescriptions</h3>

        {/* Add form */}
        <form onSubmit={handleAddRx} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Medication Name *</label>
              <input
                type="text"
                required
                value={rxForm.medicationName}
                onChange={(e) => setRxForm((f) => ({ ...f, medicationName: e.target.value }))}
                className="w-full h-10 rounded-lg bg-neutral-100 px-3 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Dosage</label>
              <input
                type="text"
                value={rxForm.dosage}
                onChange={(e) => setRxForm((f) => ({ ...f, dosage: e.target.value }))}
                placeholder="e.g. 500mg"
                className="w-full h-10 rounded-lg bg-neutral-100 px-3 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Frequency</label>
              <input
                type="text"
                value={rxForm.frequency}
                onChange={(e) => setRxForm((f) => ({ ...f, frequency: e.target.value }))}
                placeholder="e.g. Twice daily"
                className="w-full h-10 rounded-lg bg-neutral-100 px-3 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Duration</label>
              <input
                type="text"
                value={rxForm.duration}
                onChange={(e) => setRxForm((f) => ({ ...f, duration: e.target.value }))}
                placeholder="e.g. 7 days"
                className="w-full h-10 rounded-lg bg-neutral-100 px-3 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Instructions</label>
            <input
              type="text"
              value={rxForm.instructions}
              onChange={(e) => setRxForm((f) => ({ ...f, instructions: e.target.value }))}
              placeholder="Take with food"
              className="w-full h-10 rounded-lg bg-neutral-100 px-3 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={addRxMutation.isPending || !rxForm.medicationName.trim()}
            className="bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-2 text-sm transition disabled:opacity-50"
          >
            {addRxMutation.isPending ? 'Adding…' : 'Add Prescription'}
          </button>
        </form>

        {/* Existing list */}
        {rxLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-full bg-neutral-100 rounded" />
            <div className="h-4 w-3/4 bg-neutral-100 rounded" />
          </div>
        ) : rxList.length > 0 ? (
          <ul className="divide-y divide-neutral-100">
            {rxList.map((rx) => (
              <li key={rx.id} className="flex items-center justify-between py-2.5 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">{rx.medicationName}</p>
                  <p className="text-xs text-neutral-500">
                    {[rx.dosage, rx.frequency].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteRx(rx.id)}
                  disabled={deleteRxMutation.isPending}
                  className="shrink-0 text-neutral-400 hover:text-red-500 transition disabled:opacity-50"
                  title="Remove prescription"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">No prescriptions added yet</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cancel dialog — reused for both pending + confirmed states
// ---------------------------------------------------------------------------
function CancelDialog({
  reason,
  onChange,
  onConfirm,
  isPending,
}: {
  reason: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
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
            value={reason}
            onChange={(e) => onChange(e.target.value)}
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
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg px-4 py-2 text-sm transition disabled:opacity-50"
          >
            {isPending ? 'Cancelling…' : 'Cancel Appointment'}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
