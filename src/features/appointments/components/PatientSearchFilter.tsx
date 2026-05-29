import { useState, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { PatientSearchFilters } from '../types';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'] as const;
const SEX_OPTIONS: { value: PatientSearchFilters['sex']; label: string }[] = [
  { value: 'male',             label: 'Male' },
  { value: 'female',           label: 'Female' },
  { value: 'other',            label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

interface PatientSearchFilterProps {
  filters: PatientSearchFilters;
  onChange: (filters: PatientSearchFilters) => void;
}

export function PatientSearchFilter({ filters, onChange }: PatientSearchFilterProps) {
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
    filters.minConsultations != null;

  function clearFilters() {
    setSearchInput('');
    onChange({ page: 1 });
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4 flex flex-wrap items-end gap-3">
      {/* Keyword search */}
      <div className="space-y-1 flex-1 min-w-[180px]">
        <label className="text-xs font-medium text-neutral-500">Search</label>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Allergy, medication, condition, name…"
          className="w-full h-9 rounded-lg bg-neutral-100 px-3 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
        />
      </div>

      {/* Blood type */}
      <div className="space-y-1 min-w-[120px]">
        <label className="text-xs font-medium text-neutral-500">Blood Type</label>
        <select
          value={filters.bloodType ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              bloodType: (e.target.value as PatientSearchFilters['bloodType']) || undefined,
              page: 1,
            })
          }
          className="w-full h-9 rounded-lg bg-neutral-100 px-2.5 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
        >
          <option value="">Any</option>
          {BLOOD_TYPES.map((bt) => (
            <option key={bt} value={bt}>
              {bt === 'unknown' ? 'Unknown' : bt}
            </option>
          ))}
        </select>
      </div>

      {/* Sex */}
      <div className="space-y-1 min-w-[150px]">
        <label className="text-xs font-medium text-neutral-500">Sex</label>
        <select
          value={filters.sex ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              sex: (e.target.value as PatientSearchFilters['sex']) || undefined,
              page: 1,
            })
          }
          className="w-full h-9 rounded-lg bg-neutral-100 px-2.5 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
        >
          <option value="">Any</option>
          {SEX_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Min consultations */}
      <div className="space-y-1 min-w-[130px]">
        <label className="text-xs font-medium text-neutral-500">Min Consultations</label>
        <input
          type="number"
          min={1}
          value={filters.minConsultations ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              minConsultations: e.target.value === '' ? undefined : Number(e.target.value),
              page: 1,
            })
          }
          placeholder="Any"
          className="w-full h-9 rounded-lg bg-neutral-100 px-3 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
        />
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="self-end text-sm text-sky-600 hover:text-sky-800 font-medium transition pb-0.5"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
