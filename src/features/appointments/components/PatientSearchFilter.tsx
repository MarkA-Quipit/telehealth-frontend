import { useState, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import type { PatientSearchFilters } from '../types';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'] as const;
const SEX_OPTIONS: { value: PatientSearchFilters['sex']; label: string }[] = [
  { value: 'male',              label: 'Male' },
  { value: 'female',            label: 'Female' },
  { value: 'other',             label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export type DatePeriod = 'all' | 'today' | 'week' | 'month' | 'nextMonth';

interface PatientSearchFilterProps {
  filters: PatientSearchFilters;
  onChange: (filters: PatientSearchFilters) => void;
  datePeriod?: DatePeriod;
  onDatePeriodChange?: (period: DatePeriod) => void;
}

export function PatientSearchFilter({ filters, onChange, datePeriod, onDatePeriodChange }: PatientSearchFilterProps) {
  const [searchInput, setSearchInput] = useState(filters.q ?? '');
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    onChange({ ...filters, q: debouncedSearch.trim() || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const hasActiveFilters =
    !!filters.q ||
    !!filters.bloodType ||
    !!filters.sex ||
    filters.minConsultations != null ||
    filters.maxConsultations != null;

  function clearFilters() {
    setSearchInput('');
    onChange({ page: 1 });
  }

  return (
    <div className={`relative bg-white border border-neutral-200 rounded-xl shadow-sm p-4 ${hasActiveFilters ? 'pb-8' : ''}`}>
      <div className="flex items-end gap-2 overflow-x-auto">
        <div className="space-y-1 flex-1 min-w-[160px]">
          <label className="text-xs font-medium text-neutral-500">Search</label>
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, allergy, medication, condition…"
            className="h-9"
          />
        </div>

        <div className="space-y-1 min-w-[110px]">
          <label className="text-xs font-medium text-neutral-500">Blood Type</label>
          <Select
            value={filters.bloodType ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                bloodType: (e.target.value as PatientSearchFilters['bloodType']) || undefined,
                page: 1,
              })
            }
            className="h-9 px-2.5"
          >
            <option value="">Any</option>
            {BLOOD_TYPES.map((bt) => (
              <option key={bt} value={bt}>{bt === 'unknown' ? 'Unknown' : bt}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-1 min-w-[130px]">
          <label className="text-xs font-medium text-neutral-500">Sex</label>
          <Select
            value={filters.sex ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                sex: (e.target.value as PatientSearchFilters['sex']) || undefined,
                page: 1,
              })
            }
            className="h-9 px-2.5"
          >
            <option value="">Any</option>
            {SEX_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-1 min-w-[96px]">
          <label className="text-xs font-medium text-neutral-500">Min Consults</label>
          <Input
            type="number"
            min={1}
            value={filters.minConsultations ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                minConsultations: e.target.value === '' || Number(e.target.value) < 1 ? undefined : Number(e.target.value),
                page: 1,
              })
            }
            placeholder="Any"
            className="h-9"
          />
        </div>

        <div className="space-y-1 min-w-[96px]">
          <label className="text-xs font-medium text-neutral-500">Max Consults</label>
          <Input
            type="number"
            min={1}
            value={filters.maxConsultations ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                maxConsultations: e.target.value === '' || Number(e.target.value) < 1 ? undefined : Number(e.target.value),
                page: 1,
              })
            }
            placeholder="Any"
            className="h-9"
          />
        </div>

        {onDatePeriodChange && (
          <div className="space-y-1 min-w-[110px]">
            <label className="text-xs font-medium text-neutral-500">Period</label>
            <select
              value={datePeriod ?? 'all'}
              onChange={(e) => onDatePeriodChange(e.target.value as DatePeriod)}
              className="w-full h-9 rounded-lg bg-neutral-100 px-2.5 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="nextMonth">Next month</option>
            </select>
          </div>
        )}
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
  );
}
