import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { getSpecializations } from '../api/doctors.api';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { DoctorFilters } from '../types';

interface DoctorFilterProps {
  filters: DoctorFilters;
  onFilterChange: (filters: DoctorFilters) => void;
}

export function DoctorFilter({ filters, onFilterChange }: DoctorFilterProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: specializations = [] } = useQuery({
    queryKey: QUERY_KEYS.doctors.specializations(),
    queryFn: getSpecializations,
    staleTime: 5 * 60 * 1000,
  });

  // Push debounced search to parent
  useEffect(() => {
    onFilterChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const hasActiveFilters = !!filters.specialization || !!filters.search;

  function clearFilters() {
    setSearchInput('');
    onFilterChange({ page: 1 });
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
      {/* Specialization select */}
      <div className="space-y-1 min-w-[180px]">
        <label className="text-xs font-medium text-neutral-500">Specialization</label>
        <select
          value={filters.specialization ?? ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              specialization: e.target.value || undefined,
              page: 1,
            })
          }
          className="w-full h-9 rounded-lg bg-neutral-100 px-2.5 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
        >
          <option value="">All Specializations</option>
          {specializations.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Search input */}
      <div className="space-y-1 flex-1 min-w-[180px]">
        <label className="text-xs font-medium text-neutral-500">Search</label>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name…"
          className="w-full h-9 rounded-lg bg-neutral-100 px-3 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
        />
      </div>

      {/* Clear filters */}
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
