import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useDoctors } from '../hooks/useDoctors';
import { DoctorCard } from '../components/DoctorCard';
import { DoctorFilter } from '../components/DoctorFilter';
import type { DoctorFilters } from '../types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';
import { SymptomChecker } from '@/features/ai/components/SymptomChecker';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';

function CardSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-full bg-neutral-200 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
          <div className="h-3 bg-neutral-200 rounded w-1/2" />
          <div className="h-3 bg-neutral-200 rounded w-1/3" />
        </div>
      </div>
      <div className="flex justify-between">
        <div className="h-4 bg-neutral-200 rounded w-1/3" />
        <div className="h-5 bg-neutral-200 rounded-full w-1/3" />
      </div>
      <div className="h-9 bg-neutral-200 rounded-lg w-full" />
    </div>
  );
}

export function DoctorListPage() {
  const { user } = useAuthContext();
  const isPatient = user?.roles.includes('patient') ?? false;

  const [filters, setFilters] = useState<DoctorFilters>({ page: 1, limit: 9 });
  const { data, isLoading } = useDoctors(filters);

  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? 1;

  function handleFilterChange(next: DoctorFilters) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Find a Doctor</h1>
        <p className="text-sm text-neutral-500">
          Browse and connect with qualified healthcare professionals
        </p>
      </div>

      {/* AI Symptom Checker — patients only */}
      {isPatient && (
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger asChild>
            <Button variant="secondary" className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-sky-500" />
              Find doctors by symptoms
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mb-6">
            <SymptomChecker />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Filter */}
      <DoctorFilter
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="No doctors found"
          description="No doctors found matching your search."
          action={
            <button
              onClick={() => handleFilterChange({ specialization: undefined, search: undefined, page: 1 })}
              className="text-sm text-sky-600 hover:text-sky-800 font-medium transition"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.items.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => handleFilterChange({ page: currentPage - 1 })}
            disabled={currentPage <= 1}
            className="disabled:cursor-not-allowed"
          >
            Prev
          </Button>
          <span className="text-sm text-neutral-500">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => handleFilterChange({ page: currentPage + 1 })}
            disabled={currentPage >= totalPages}
            className="disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}