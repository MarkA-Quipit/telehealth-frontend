import { useParams, Link } from 'react-router-dom';
import { usePatientHistory } from '@/features/patients/hooks/usePatient';
import type { PatientHistoryEntry } from '@/features/patients/types';

function SkeletonPage() {
  return (
    <div className="space-y-5 max-w-2xl mx-auto animate-pulse">
      <div className="h-4 w-32 bg-neutral-100 rounded" />
      <div className="h-7 w-56 bg-neutral-100 rounded" />
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100" />
          <div className="space-y-1.5">
            <div className="h-4 w-36 bg-neutral-100 rounded" />
            <div className="h-3 w-48 bg-neutral-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-neutral-100 rounded" />
          ))}
        </div>
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
          <div className="h-4 w-28 bg-neutral-100 rounded" />
          <div className="h-3 w-full bg-neutral-100 rounded" />
          <div className="h-3 w-3/4 bg-neutral-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyField({ value }: { value: string | null | undefined }) {
  return (
    <span className={value ? 'text-neutral-800' : 'text-neutral-400'}>
      {value || '—'}
    </span>
  );
}

function ConsultationCard({ entry }: { entry: PatientHistoryEntry }) {
  const date = new Date(entry.scheduledAt);
  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
      <p className="text-sm font-semibold text-neutral-900">{formattedDate}</p>

      {entry.notes ? (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-neutral-500">Chief Complaint</dt>
            <dd className="mt-0.5"><EmptyField value={entry.notes.chiefComplaint} /></dd>
          </div>
          <div>
            <dt className="text-neutral-500">Diagnosis</dt>
            <dd className="mt-0.5"><EmptyField value={entry.notes.diagnosis} /></dd>
          </div>
          {entry.notes.notes && (
            <div className="sm:col-span-2">
              <dt className="text-neutral-500">Clinical Notes</dt>
              <dd className="mt-0.5 text-neutral-800 whitespace-pre-wrap">{entry.notes.notes}</dd>
            </div>
          )}
          {entry.notes.followUpDate && (
            <div>
              <dt className="text-neutral-500">Follow-up</dt>
              <dd className="mt-0.5 text-neutral-800">{entry.notes.followUpDate}</dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="text-sm text-neutral-400">No consultation notes recorded.</p>
      )}

      <div className="pt-1 border-t border-neutral-100">
        <p className="text-xs font-medium text-neutral-500 mb-2">Prescriptions</p>
        {entry.prescriptions.length > 0 ? (
          <ul className="space-y-1.5">
            {entry.prescriptions.map((rx) => (
              <li key={rx.id} className="text-sm text-neutral-800">
                <span className="font-medium">{rx.medicationName}</span>
                {[rx.dosage, rx.frequency, rx.duration].filter(Boolean).length > 0 && (
                  <span className="text-neutral-500">
                    {' '}— {[rx.dosage, rx.frequency, rx.duration].filter(Boolean).join(' · ')}
                  </span>
                )}
                {rx.instructions && (
                  <span className="block text-xs text-neutral-400">{rx.instructions}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400">No prescriptions for this visit.</p>
        )}
      </div>
    </div>
  );
}

export function PatientMedicalHistoryPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const { data, isLoading, isError } = usePatientHistory(patientId);

  if (isLoading) return <SkeletonPage />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-2xl mx-auto">
        <p className="text-sm text-neutral-500 mb-3">Failed to load patient history.</p>
        <Link to="/doctor/appointments" className="text-sky-700 text-sm hover:underline">
          ← Back to Appointments
        </Link>
      </div>
    );
  }

  const { patient, consultationHistory } = data;

  const initials =
    (patient.firstName?.[0] ?? '') + (patient.lastName?.[0] ?? '');

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Back */}
      <Link
        to="/doctor/appointments"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 transition"
      >
        ← Appointments
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        Patient Medical History
      </h1>

      {/* Medical profile card */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
        {/* Patient header */}
        <div className="flex items-center gap-3">
          {patient.profilePictureUrl ? (
            <img
              src={patient.profilePictureUrl}
              alt={`${patient.firstName} ${patient.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 font-semibold flex items-center justify-center text-sm">
              {initials}
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-neutral-900">
              {patient.firstName} {patient.lastName}
            </p>
            <p className="text-sm text-neutral-500">
              {[
                patient.dateOfBirth,
                patient.bloodType !== 'unknown' ? patient.bloodType : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        {/* Vitals */}
        {(patient.weightKg || patient.heightCm) && (
          <div className="flex gap-6 text-sm">
            {patient.weightKg && (
              <div>
                <span className="text-neutral-500">Weight </span>
                <span className="text-neutral-800">{patient.weightKg} kg</span>
              </div>
            )}
            {patient.heightCm && (
              <div>
                <span className="text-neutral-500">Height </span>
                <span className="text-neutral-800">{patient.heightCm} cm</span>
              </div>
            )}
          </div>
        )}

        {/* Medical fields */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-neutral-500">Allergies</dt>
            <dd className="mt-0.5 whitespace-pre-wrap"><EmptyField value={patient.allergies} /></dd>
          </div>
          <div>
            <dt className="text-neutral-500">Medical History</dt>
            <dd className="mt-0.5 whitespace-pre-wrap"><EmptyField value={patient.medicalHistory} /></dd>
          </div>
        </dl>
      </div>

      {/* Consultation history */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-neutral-900">Consultation History</h2>

        {consultationHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-neutral-200 rounded-xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">No completed consultations</h3>
            <p className="text-sm text-neutral-500">No past consultations on record for this patient.</p>
          </div>
        ) : (
          consultationHistory.map((entry) => (
            <ConsultationCard key={entry.appointmentId} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
