import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from './select';

interface PaginationProps {
  page: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  rowsPerPageOptions?: number[];
}

export function Pagination({
  page,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 30],
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between pt-2">
      {/* Left — rows per page */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-500 whitespace-nowrap">Rows per page:</span>
        <Select
          value={String(rowsPerPage)}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="h-8 w-20 py-0 cursor-pointer"
        >
          {rowsPerPageOptions.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </Select>
      </div>

      {/* Right — prev / counter / next */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-sm text-neutral-600 tabular-nums min-w-[3.5rem] text-center">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
