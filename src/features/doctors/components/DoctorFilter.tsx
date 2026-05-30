import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { getSpecializations } from '../api/doctors.api';
import { Input } from '@/shared/ui/input';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { DoctorFilters } from '../types';

interface DoctorFilterProps {
  filters: DoctorFilters;
  onFilterChange: (filters: DoctorFilters) => void;
}

export function DoctorFilter({ filters, onFilterChange }: DoctorFilterProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  // Price inputs stored as ₱ strings; converted to centavos on change
  const [minPriceInput, setMinPriceInput] = useState(
    filters.minFee != null ? String(Math.round(filters.minFee / 100)) : '',
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    filters.maxFee != null ? String(Math.round(filters.maxFee / 100)) : '',
  );
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: specializations = [] } = useQuery({
    queryKey: QUERY_KEYS.doctors.specializations(),
    queryFn: getSpecializations,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    onFilterChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const hasActiveFilters =
    !!filters.specialization ||
    !!filters.search ||
    filters.minFee != null ||
    filters.maxFee != null ||
    filters.minExperience != null ||
    filters.minRating != null;

  function clearFilters() {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    onFilterChange({
      page: 1,
      search: undefined,
      specialization: undefined,
      minFee: undefined,
      maxFee: undefined,
      minExperience: undefined,
      minRating: undefined,
    });
  }

  function handleMinPrice(raw: string) {
    setMinPriceInput(raw);
    const val = raw === '' ? undefined : Math.round(Number(raw) * 100);
    onFilterChange({ ...filters, minFee: val, page: 1 });
  }

  function handleMaxPrice(raw: string) {
    setMaxPriceInput(raw);
    const val = raw === '' ? undefined : Math.round(Number(raw) * 100);
    onFilterChange({ ...filters, maxFee: val, page: 1 });
  }

  return (
    <div className={`relative bg-white border border-neutral-200 rounded-xl shadow-sm p-4 ${hasActiveFilters ? 'pb-8' : ''}`}>
      {/* Filters row */}
      <div className="flex flex-wrap items-end gap-2 sm:flex-nowrap sm:overflow-x-auto">
        {/* Search input */}
        <div className="space-y-1 flex-1 min-w-[140px]">
          <label className="text-xs font-medium text-neutral-500">Search</label>
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name…"
            className="h-9"
          />
        </div>

        {/* Specialization select */}
        <div className="space-y-1 min-w-[140px]">
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

        {/* Min price */}
        <div className="space-y-1 min-w-[88px]">
          <label className="text-xs font-medium text-neutral-500">Min ₱</label>
          <Input
            type="number"
            min={0}
            value={minPriceInput}
            onChange={(e) => handleMinPrice(e.target.value)}
            placeholder="0"
            className="h-9"
          />
        </div>

        {/* Max price */}
        <div className="space-y-1 min-w-[88px]">
          <label className="text-xs font-medium text-neutral-500">Max ₱</label>
          <Input
            type="number"
            min={0}
            value={maxPriceInput}
            onChange={(e) => handleMaxPrice(e.target.value)}
            placeholder="Any"
            className="h-9"
          />
        </div>

        {/* Min experience */}
        <div className="space-y-1 min-w-[80px]">
          <label className="text-xs font-medium text-neutral-500">Exp (yrs)</label>
          <Input
            type="number"
            min={0}
            value={filters.minExperience ?? ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                minExperience: e.target.value === '' ? undefined : Number(e.target.value),
                page: 1,
              })
            }
            placeholder="Any"
            className="h-9"
          />
        </div>

        {/* Min rating */}
        <div className="space-y-1 min-w-[88px]">
          <label className="text-xs font-medium text-neutral-500">Min Rating</label>
          <select
            value={filters.minRating ?? ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                minRating: e.target.value === '' ? undefined : Number(e.target.value),
                page: 1,
              })
            }
            className="w-full h-9 rounded-lg bg-neutral-100 px-2.5 text-sm focus:bg-white focus:border focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
          >
            <option value="">Any</option>
            <option value="1">1★+</option>
            <option value="2">2★+</option>
            <option value="3">3★+</option>
            <option value="4">4★+</option>
            <option value="5">5★</option>
          </select>
        </div>
      </div>

      {/* Clear filters — absolutely positioned at bottom-right of card */}
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
