import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentDataTable } from '../components/AppointmentDataTable';
import { FilterTabs } from '../components/FilterTabs';
import { AppointmentSkeletonTable } from '../components/AppointmentSkeletonTable';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/ui/pagination';
import type { AppointmentWithDetails } from '../types';

const TABS = ['Upcoming', 'Past'] as const;
type Tab = typeof TABS[number];

type DatePeriod = 'all' | 'today' | 'week' | 'month' | 'nextMonth';

function getDateBounds(period: DatePeriod): { from?: Date; to?: Date } {
  if (period === 'all') return {};
  const now = new Date();
  if (period === 'today') {
    const from = new Date(now); from.setHours(0, 0, 0, 0);
    const to   = new Date(now); to.setHours(23, 59, 59, 999);
    return { from, to };
  }
  if (period === 'week') {
    const day    = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { from: monday, to: sunday };
  }
  if (period === 'nextMonth') {
    const from = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const to   = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);
    return { from, to };
  }
  // month
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

export function AppointmentListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState<Tab>('Upcoming');
  const [search, setSearch]               = useState('');
  const [specialization, setSpecialization] = useState('');
  const [datePeriod, setDatePeriod]       = useState<DatePeriod>('all');
  const [page, setPage]                   = useState(1);
  const [rowsPerPage, setRowsPerPage]     = useState(10);

  const { data, isLoading } = useAppointments({ limit: 200 });

  const allItems = data?.items ?? [];

  // Collect unique specializations for the filter dropdown
  const specializations = useMemo(() => {
    const set = new Set(allItems.map((a) => a.doctor.specialization));
    return [...set].sort();
  }, [allItems]);

  const upcoming: AppointmentWithDetails[] = allItems
    .filter((a) => a.status === 'pending' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const past: AppointmentWithDetails[] = allItems
    .filter((a) => a.status === 'completed' || a.status === 'cancelled')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  // Apply secondary filters
  const { from: dateFrom, to: dateTo } = getDateBounds(datePeriod);
  const q = search.trim().toLowerCase();

  const filtered = (activeTab === 'Upcoming' ? upcoming : past).filter((a) => {
    if (q) {
      const fullName = `${a.doctor.firstName} ${a.doctor.lastName}`.toLowerCase();
      if (!fullName.includes(q)) return false;
    }
    if (specialization && a.doctor.specialization !== specialization) return false;
    if (dateFrom) {
      const d = new Date(a.scheduledAt);
      if (d < dateFrom || (dateTo && d > dateTo)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const displayed  = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const hasActiveFilters = !!q || !!specialization || datePeriod !== 'all';

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setPage(1);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  function handleSpecializationChange(val: string) {
    setSpecialization(val);
    setPage(1);
  }

  function handleDatePeriodChange(val: DatePeriod) {
    setDatePeriod(val);
    setPage(1);
  }

  function handleRowsPerPageChange(rows: number) {
    setRowsPerPage(rows);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setSpecialization('');
    setDatePeriod('all');
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">My Appointments</h1>
          <p className="text-sm text-neutral-500">Track and manage your consultations</p>
        </div>
        <Button onClick={() => navigate('/patient/doctors')}>
          Book Appointment
        </Button>
      </div>

      {/* Tabs */}
      <FilterTabs tabs={TABS} activeTab={activeTab} onChange={handleTabChange} />

      {/* Filter bar */}
      <div className={`relative bg-white border border-neutral-200 rounded-xl shadow-sm p-4 ${hasActiveFilters ? 'pb-8' : ''}`}>
        <div className="flex flex-wrap items-end gap-2 sm:flex-nowrap sm:overflow-x-auto">
          <div className="space-y-1 flex-1 min-w-[160px]">
            <label className="text-xs font-medium text-neutral-500">Search doctor</label>
            <Input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Doctor name…"
              className="h-9"
            />
          </div>

          <div className="space-y-1 min-w-[150px]">
            <label className="text-xs font-medium text-neutral-500">Specialization</label>
            <Select
              value={specialization}
              onChange={(e) => handleSpecializationChange(e.target.value)}
              className="h-9 px-2.5"
            >
              <option value="">All</option>
              {specializations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1 min-w-[120px]">
            <label className="text-xs font-medium text-neutral-500">Period</label>
            <Select
              value={datePeriod}
              onChange={(e) => handleDatePeriodChange(e.target.value as DatePeriod)}
              className="h-9 px-2.5"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="nextMonth">Next month</option>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="absolute bottom-3 right-4 text-xs text-sky-600 hover:text-sky-800 font-medium transition"
          >
            Clear filters
          </button>
        )}
      </div>

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
          title={hasActiveFilters ? 'No results' : activeTab === 'Upcoming' ? 'No upcoming appointments' : 'No past appointments'}
          description={
            hasActiveFilters
              ? 'No appointments match the current filters.'
              : activeTab === 'Upcoming'
                ? 'Book your first consultation to get started.'
                : 'Your completed and cancelled appointments will appear here.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
            ) : activeTab === 'Upcoming' ? (
              <Button onClick={() => navigate('/patient/doctors')}>Book an Appointment</Button>
            ) : undefined
          }
        />
      )}

      {/* Pagination */}
      {!isLoading && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 20, 30]}
          onPageChange={setPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </div>
  );
}
