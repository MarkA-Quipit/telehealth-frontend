interface MedicalPillProps {
  label: string;
  value: string;
}

export function MedicalPill({ label, value }: MedicalPillProps) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-600 rounded-full px-2.5 py-0.5">
      <span className="text-neutral-400">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}
