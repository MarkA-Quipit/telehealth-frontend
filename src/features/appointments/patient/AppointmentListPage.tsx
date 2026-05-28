import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentDataTable } from '../components/AppointmentDataTable';
import type { AppointmentWithDetails } from '../types';

const TABS = ['Upcoming', 'Past'] as const;
type Tab = typeof TABS[number];

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

export function AppointmentListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Upcoming');
  const { data, isLoading } = useAppointments();

  const upcoming: AppointmentWithDetails[] = (data?.items ?? [])
    .filter((a) => a.status === 'pending' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const past: AppointmentWithDetails[] = (data?.items ?? [])
    .filter((a) => a.status === 'completed' || a.status === 'cancelled')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const displayed = activeTab === 'Upcoming' ? upcoming : past;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">My Appointments</h1>
          <p className="text-sm text-neutral-500">Track and manage your consultations</p>
        </div>
        <button
          onClick={() => navigate('/patient/doctors')}
          className="bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-2 text-sm transition"
        >
          Book Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
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
                {['Doctor', 'Date', 'Time', 'Status', ''].map((h) => (
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
      ) : displayed.length > 0 ? (
        <AppointmentDataTable
          appointments={displayed}
          role="patient"
          detailBasePath="/patient/appointments"
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {activeTab === 'Upcoming' ? (
            <>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">No upcoming appointments</h3>
              <p className="text-sm text-neutral-500 mb-4">Book your first consultation to get started.</p>
              <button
                onClick={() => navigate('/patient/doctors')}
                className="bg-sky-100 text-sky-700 hover:bg-sky-200 font-medium rounded-lg px-4 py-2 text-sm transition"
              >
                Book an Appointment
              </button>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">No past appointments</h3>
              <p className="text-sm text-neutral-500">Your completed and cancelled appointments will appear here.</p>
            </>
          )}
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
