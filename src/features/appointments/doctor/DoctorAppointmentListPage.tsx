import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppointments, usePatientSearch } from '../hooks/useAppointments';
import { AppointmentDataTable } from '../components/AppointmentDataTable';
import { PatientSearchFilter } from '../components/PatientSearchFilter';
import { FilterTabs } from '../components/FilterTabs';
import { AppointmentSkeletonTable } from '../components/AppointmentSkeletonTable';
import type { AppointmentStatus, PatientSearchResult, PatientSearchFilters } from '../types';

const FILTER_TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const;
type FilterTab = typeof FILTER_TABS[number];

const STATUS_MAP: Record<FilterTab, AppointmentStatus | undefined> = {
  All:       undefined,
  Pending:   'pending',
  Confirmed: 'confirmed',
  Completed: 'completed',
  Cancelled: 'cancelled',
};


function PatientAvatar({ patient }: { patient: PatientSearchResult }) {
  if (patient.profilePictureUrl) {
    return (
      <img
        src={patient.profilePictureUrl}
        alt={`${patient.firstName} ${patient.lastName}`}
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-semibold text-sm flex items-center justify-center shrink-0">
      {patient.firstName[0]}{patient.lastName[0]}
    </div>
  );
}

function MedicalPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-600 rounded-full px-2.5 py-0.5">
      <span className="text-neutral-400">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

function PatientSearchResults({ filters }: { filters: PatientSearchFilters }) {
  const { data, isLoading } = usePatientSearch(filters);
  const patients = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm divide-y divide-neutral-100">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-neutral-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-neutral-100 rounded" />
              <div className="h-3 w-48 bg-neutral-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-1">No patients found</h3>
        <p className="text-sm text-neutral-500">No patients match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-neutral-500 px-1">
        {data!.total} patient{data!.total !== 1 ? 's' : ''} found
      </p>
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm divide-y divide-neutral-100">
        {patients.map((patient) => {
          const pills: { label: string; value: string }[] = [];
          if (patient.allergies) pills.push({ label: 'Allergies', value: patient.allergies });
          if (patient.currentMedications) pills.push({ label: 'Medications', value: patient.currentMedications });
          if (patient.pastMedicalConditions) pills.push({ label: 'Conditions', value: patient.pastMedicalConditions });
          if (patient.bloodType) pills.push({ label: 'Blood type', value: patient.bloodType });

          return (
            <Link
              key={patient.id}
              to={`/doctor/patients/${patient.id}`}
              className="flex items-start gap-3 px-5 py-4 hover:bg-neutral-50 transition group"
            >
              <PatientAvatar patient={patient} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 group-hover:text-sky-700 transition">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{patient.email}</p>
                {pills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {pills.map((p) => (
                      <MedicalPill key={p.label} label={p.label} value={p.value} />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <svg className="w-4 h-4 text-neutral-300 group-hover:text-sky-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
                {patient.consultationCount > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">
                    {patient.consultationCount} consult{patient.consultationCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {data && data.totalPages > 1 && (
        <p className="text-xs text-neutral-400 text-center pt-1">
          Showing page {data.page} of {data.totalPages}
        </p>
      )}
    </div>
  );
}

export function DoctorAppointmentListPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [searchFilters, setSearchFilters] = useState<PatientSearchFilters>({});

  const isSearching =
    (searchFilters.q?.length ?? 0) >= 2 ||
    !!searchFilters.bloodType ||
    !!searchFilters.sex ||
    searchFilters.minConsultations != null;

  const status = STATUS_MAP[activeTab];
  const { data, isLoading } = useAppointments(status ? { status } : undefined);
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Appointments</h1>
        <p className="text-sm text-neutral-500">Manage your patient consultations</p>
      </div>

      {/* Patient filter panel */}
      <PatientSearchFilter filters={searchFilters} onChange={setSearchFilters} />

      {isSearching ? (
        <PatientSearchResults filters={searchFilters} />
      ) : (
        <>
          {/* Filter tabs */}
          <FilterTabs tabs={FILTER_TABS} activeTab={activeTab} onChange={setActiveTab} />

          {/* Content */}
          {isLoading ? (
            <AppointmentSkeletonTable headers={['Patient', 'Date', 'Time', 'Status', '']} />
          ) : items.length > 0 ? (
            <AppointmentDataTable
              appointments={items}
              role="doctor"
              detailBasePath="/doctor/appointments"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                No {activeTab.toLowerCase()} appointments
              </h3>
              <p className="text-sm text-neutral-500">
                {activeTab === 'All'
                  ? 'Your appointments will appear here once patients start booking.'
                  : `No appointments with status "${activeTab.toLowerCase()}" yet.`}
              </p>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <span className="text-sm text-neutral-500">
                Page {data.page} of {data.totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
