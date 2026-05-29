export function AppointmentSkeletonCard() {
  return (
    <div className="border-l-4 border-l-neutral-200 bg-white border border-neutral-200 rounded-xl shadow-sm p-4 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-neutral-100 rounded" />
          <div className="h-3 w-32 bg-neutral-100 rounded" />
        </div>
        <div className="h-5 w-20 bg-neutral-100 rounded-full" />
      </div>
    </div>
  );
}
