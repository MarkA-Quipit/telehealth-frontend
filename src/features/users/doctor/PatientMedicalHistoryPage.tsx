import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDateLong } from '@/shared/lib/date';
import { Avatar } from '@/shared/components/Avatar';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/ui/button';
import { usePatientHistory } from '@/features/patients/hooks/usePatient';
import type { PatientHistoryEntry } from '@/features/patients/types';

function SkeletonPage() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-4 w-32 bg-neutral-100 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-5 items-start">
        <div className="space-y-3">
          <div className="h-7 w-56 bg-neutral-100 rounded" />
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 shrink-0" />
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
        </div>
        <div className="space-y-4">
          <div className="h-7 w-48 bg-neutral-100 rounded" />
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3">
            <div className="h-4 w-28 bg-neutral-100 rounded" />
            <div className="h-3 w-full bg-neutral-100 rounded" />
            <div className="h-3 w-3/4 bg-neutral-100 rounded" />
          </div>
        </div>
      </div>
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
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
      <p className="text-sm font-semibold text-neutral-900">{formatDateLong(entry.scheduledAt)}</p>

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
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePatientHistory(patientId);

  const [page, setPage] = useState(0);
  const [pageInput, setPageInput] = useState('1');

  if (isLoading) return <SkeletonPage />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-neutral-500 mb-3">Failed to load patient history.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sky-700 text-sm hover:underline"
        >
          ← Back
        </button>
      </div>
    );
  }

  const { patient, consultationHistory } = data;
  const total = consultationHistory.length;
  const current = consultationHistory[page] ?? null;

  function commitPageInput() {
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(total, parsed));
      setPage(clamped - 1);
      setPageInput(String(clamped));
    } else {
      setPageInput(String(page + 1));
    }
  }

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 transition"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-5 items-start">

        {/* ── LEFT — patient info ──────────────────────────────────── */}
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Patient Medical History
          </h1>

          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar
                firstName={patient.firstName ?? ''}
                lastName={patient.lastName ?? ''}
                profilePictureUrl={patient.profilePictureUrl}
                size="md"
              />
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
        </div>

        {/* ── RIGHT — consultation history ─────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-neutral-900">Consultation History</h2>

            {total > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setPage((p) => p - 1); setPageInput(String(page)); }}
                  disabled={page === 0}
                >
                  ← Prev
                </Button>
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                  <input
                    type="number"
                    min={1}
                    max={total}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={commitPageInput}
                    onKeyDown={(e) => e.key === 'Enter' && commitPageInput()}
                    className="w-10 text-center rounded-md bg-neutral-100 px-1 py-0.5 text-sm tabular-nums focus:bg-white focus:outline focus:outline-sky-400"
                  />
                  <span>/ {total}</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setPage((p) => p + 1); setPageInput(String(page + 2)); }}
                  disabled={page === total - 1}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>

          {total === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
              <EmptyState
                icon={
                  <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="No completed consultations"
                description="No past consultations on record for this patient."
              />
            </div>
          ) : (
            current && <ConsultationCard entry={current} />
          )}
        </div>

      </div>
    </div>
  );
}
