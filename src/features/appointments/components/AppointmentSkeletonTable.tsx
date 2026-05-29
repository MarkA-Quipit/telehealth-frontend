interface AppointmentSkeletonTableProps {
  headers: string[];
  rows?: number;
}

function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr className="animate-pulse">
      {[...Array(colCount)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-neutral-100 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function AppointmentSkeletonTable({ headers, rows = 3 }: AppointmentSkeletonTableProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {[...Array(rows)].map((_, i) => (
            <SkeletonRow key={i} colCount={headers.length} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
