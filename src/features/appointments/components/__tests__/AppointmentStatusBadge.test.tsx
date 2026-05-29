import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppointmentStatusBadge } from '../AppointmentStatusBadge';
import type { AppointmentStatus } from '../../types';

describe('AppointmentStatusBadge', () => {
  const cases: { status: AppointmentStatus; label: string; colorClass: string }[] = [
    { status: 'pending',   label: 'Pending',   colorClass: 'bg-amber-100' },
    { status: 'confirmed', label: 'Confirmed', colorClass: 'bg-sky-100' },
    { status: 'completed', label: 'Completed', colorClass: 'bg-green-100' },
    { status: 'cancelled', label: 'Cancelled', colorClass: 'bg-red-100' },
  ];

  cases.forEach(({ status, label, colorClass }) => {
    it(`renders "${label}" with the correct color class for status "${status}"`, () => {
      render(<AppointmentStatusBadge status={status} />);
      const badge = screen.getByText(label);
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain(colorClass);
    });
  });

  it('falls back to pending config for an unknown status', () => {
    render(<AppointmentStatusBadge status={'unknown' as AppointmentStatus} />);
    const badge = screen.getByText('Pending');
    expect(badge.className).toContain('bg-amber-100');
  });
});
