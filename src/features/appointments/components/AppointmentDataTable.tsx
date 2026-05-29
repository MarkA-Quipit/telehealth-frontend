import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatTime } from '@/shared/lib/date';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import type { AppointmentWithDetails, AppointmentStatus } from '../types';

type SortKey = 'name' | 'date' | 'time' | 'status';
type SortDir = 'asc' | 'desc';

interface Column {
  key: SortKey | 'actions';
  label: string;
  sortable: boolean;
}

interface AppointmentDataTableProps {
  appointments: AppointmentWithDetails[];
  role: 'patient' | 'doctor';
  detailBasePath: string; // e.g. '/patient/appointments' or '/doctor/appointments'
}

function SortIcon({ dir }: { dir: SortDir | null }) {
  if (!dir) return <span className="text-neutral-300 ml-1">↕</span>;
  return <span className="text-sky-500 ml-1">{dir === 'asc' ? '↑' : '↓'}</span>;
}


function getSortValue(appt: AppointmentWithDetails, key: SortKey, role: 'patient' | 'doctor'): string | number {
  switch (key) {
    case 'name':
      return role === 'patient'
        ? `${appt.doctor.lastName} ${appt.doctor.firstName}`.toLowerCase()
        : `${appt.patient.lastName} ${appt.patient.firstName}`.toLowerCase();
    case 'date':
    case 'time':
      return new Date(appt.scheduledAt).getTime();
    case 'status':
      return appt.status;
  }
}

export function AppointmentDataTable({ appointments, role, detailBasePath }: AppointmentDataTableProps) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const COLUMNS: Column[] = [
    { key: 'name', label: role === 'patient' ? 'Doctor' : 'Patient', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'time', label: 'Time', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: '', sortable: false },
  ];

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...appointments].sort((a, b) => {
    const av = getSortValue(a, sortKey, role);
    const bv = getSortValue(b, sortKey, role);
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (appointments.length === 0) return null;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-neutral-500 whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer select-none hover:text-neutral-700' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key as SortKey)}
                >
                  {col.label}
                  {col.sortable && (
                    <SortIcon dir={sortKey === col.key ? sortDir : null} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sorted.map((appt, index) => {
              const nameCell =
                role === 'patient' ? (
                  <div>
                    <p className="font-medium text-neutral-900">
                      Dr. {appt.doctor.firstName} {appt.doctor.lastName}
                    </p>
                    <p className="text-xs text-neutral-500">{appt.doctor.specialization}</p>
                  </div>
                ) : (
                  <p className="font-medium text-neutral-900">
                    {appt.patient.firstName} {appt.patient.lastName}
                  </p>
                );

              return (
                <tr key={appt.id} className="hover:bg-neutral-50 transition-colors animate-row-in" style={{ animationDelay: `${index * 35}ms` }}>
                  <td className="px-4 py-3">{nameCell}</td>
                  <td className="px-4 py-3 text-neutral-700 whitespace-nowrap">
                    {formatDate(appt.scheduledAt)}
                  </td>
                  <td className="px-4 py-3 text-neutral-700 whitespace-nowrap">
                    {formatTime(appt.scheduledAt)}
                  </td>
                  <td className="px-4 py-3">
                    <AppointmentStatusBadge status={appt.status as AppointmentStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`${detailBasePath}/${appt.id}`)}
                      className="text-xs font-medium text-sky-600 hover:text-sky-800 transition whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
