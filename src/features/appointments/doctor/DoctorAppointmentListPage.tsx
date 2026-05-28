import { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentDataTable } from '../components/AppointmentDataTable';
import type { AppointmentStatus } from '../types';

const FILTER_TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const;
type FilterTab = typeof FILTER_TABS[number];

const STATUS_MAP: Record<FilterTab, AppointmentStatus | undefined> = {
  All:       undefined,
  Pending:   'pending',
  Confirmed: 'confirmed',
  Completed: 'completed',
  Cancelled: 'cancelled',
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-neutral-100 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function DoctorAppointmentListPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
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

      {/* Filter tabs */}
      <div className="flex border-b border-neutral-200 overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-sky-400 text-sky-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {['Patient', 'Date', 'Time', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
