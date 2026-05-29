import { Badge, type BadgeProps } from '@/shared/ui/badge';
import type { AppointmentStatus } from '../types';

interface Props {
  status: AppointmentStatus;
}

const CONFIG: Record<AppointmentStatus, { label: string; variant: NonNullable<BadgeProps['variant']> }> = {
  pending:   { label: 'Pending',   variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'info'    },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger'  },
};

export function AppointmentStatusBadge({ status }: Props) {
  const cfg = CONFIG[status] ?? CONFIG.pending;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
