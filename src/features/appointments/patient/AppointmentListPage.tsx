import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentDataTable } from '../components/AppointmentDataTable';
import { FilterTabs } from '../components/FilterTabs';
import { AppointmentSkeletonTable } from '../components/AppointmentSkeletonTable';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import type { AppointmentWithDetails } from '../types';

const TABS = ['Upcoming', 'Past'] as const;
type Tab = typeof TABS[number];

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
        <Button onClick={() => navigate('/patient/doctors')}>
          Book Appointment
        </Button>
      </div>

      {/* Tabs */}
      <FilterTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Content */}
      {isLoading ? (
        <AppointmentSkeletonTable headers={['Doctor', 'Date', 'Time', 'Status', '']} />
      ) : displayed.length > 0 ? (
        <AppointmentDataTable
          appointments={displayed}
          role="patient"
          detailBasePath="/patient/appointments"
        />
      ) : (
        <EmptyState
          icon={
            <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title={activeTab === 'Upcoming' ? 'No upcoming appointments' : 'No past appointments'}
          description={
            activeTab === 'Upcoming'
              ? 'Book your first consultation to get started.'
              : 'Your completed and cancelled appointments will appear here.'
          }
          action={
            activeTab === 'Upcoming' ? (
              <Button onClick={() => navigate('/patient/doctors')}>Book an Appointment</Button>
            ) : undefined
          }
        />
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
