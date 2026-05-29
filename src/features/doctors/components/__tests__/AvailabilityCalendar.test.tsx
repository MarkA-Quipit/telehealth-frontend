import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/mocks/server';
import { AvailabilityCalendar } from '../AvailabilityCalendar';

// Replace the Calendar primitive with a simple button that fires onSelect with a future date
let capturedOnSelect: ((date: Date | undefined) => void) | null = null;
vi.mock('@/shared/ui/calendar', () => ({
  Calendar: ({ onSelect, selected }: { onSelect: (d: Date | undefined) => void; selected: Date | undefined }) => {
    capturedOnSelect = onSelect;
    return (
      <div data-testid="mock-calendar">
        <button
          type="button"
          data-testid="pick-date"
          onClick={() => onSelect(new Date(Date.now() + 86400000))}
        >
          Pick tomorrow
        </button>
        {selected && <span data-testid="selected-date">{selected.toISOString()}</span>}
      </div>
    );
  },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('AvailabilityCalendar', () => {
  it('shows prompt text before a date is selected', () => {
    render(
      <AvailabilityCalendar doctorId="doc-1" selectedSlot={null} onSlotSelect={vi.fn()} />,
      { wrapper: makeWrapper() },
    );
    expect(screen.getByText(/select a date to see available time slots/i)).toBeInTheDocument();
  });

  it('renders slot buttons in 12-hour format after selecting a date', async () => {
    server.use(
      http.get('http://localhost:3000/api/doctors/:id/slots', () =>
        HttpResponse.json({
          success: true,
          data: [
            { startTime: '09:00', endTime: '09:30' },
            { startTime: '14:00', endTime: '14:30' },
          ],
        }),
      ),
    );

    render(
      <AvailabilityCalendar doctorId="doc-1" selectedSlot={null} onSlotSelect={vi.fn()} />,
      { wrapper: makeWrapper() },
    );

    await userEvent.click(screen.getByTestId('pick-date'));

    await waitFor(() => {
      expect(screen.getByText('9:00 AM')).toBeInTheDocument();
      expect(screen.getByText('2:00 PM')).toBeInTheDocument();
    });
  });

  it('shows empty state when no slots are available for the selected date', async () => {
    server.use(
      http.get('http://localhost:3000/api/doctors/:id/slots', () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
    );

    render(
      <AvailabilityCalendar doctorId="doc-1" selectedSlot={null} onSlotSelect={vi.fn()} />,
      { wrapper: makeWrapper() },
    );

    await userEvent.click(screen.getByTestId('pick-date'));

    await waitFor(() => {
      expect(screen.getByText(/no available slots for this date/i)).toBeInTheDocument();
    });
  });

  it('calls onSlotSelect with the correct data when a slot is clicked', async () => {
    const onSlotSelect = vi.fn();
    server.use(
      http.get('http://localhost:3000/api/doctors/:id/slots', () =>
        HttpResponse.json({
          success: true,
          data: [{ startTime: '10:00', endTime: '10:30' }],
        }),
      ),
    );

    render(
      <AvailabilityCalendar doctorId="doc-1" selectedSlot={null} onSlotSelect={onSlotSelect} />,
      { wrapper: makeWrapper() },
    );

    await userEvent.click(screen.getByTestId('pick-date'));
    await waitFor(() => expect(screen.getByText('10:00 AM')).toBeInTheDocument());
    await userEvent.click(screen.getByText('10:00 AM'));

    expect(onSlotSelect).toHaveBeenCalledWith(
      expect.objectContaining({ startTime: '10:00', endTime: '10:30' }),
    );
  });

  it('applies active style to the selected slot', async () => {
    server.use(
      http.get('http://localhost:3000/api/doctors/:id/slots', () =>
        HttpResponse.json({
          success: true,
          data: [{ startTime: '10:00', endTime: '10:30' }],
        }),
      ),
    );

    const tomorrow = new Date(Date.now() + 86400000);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    render(
      <AvailabilityCalendar
        doctorId="doc-1"
        selectedSlot={{ date: dateStr, startTime: '10:00', endTime: '10:30' }}
        onSlotSelect={vi.fn()}
      />,
      { wrapper: makeWrapper() },
    );

    await act(async () => {
      capturedOnSelect?.(tomorrow);
    });

    await waitFor(() => {
      const slotBtn = screen.getByText('10:00 AM');
      expect(slotBtn.className).toContain('bg-sky-100');
    });
  });
});
