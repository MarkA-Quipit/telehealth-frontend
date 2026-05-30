import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from '@/shared/ui/calendar';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { getAvailableSlots } from '../api/doctors.api';
import { useDoctorAvailability } from '../hooks/useDoctors';
import type { TimeSlot } from '../types';

interface SelectedSlot {
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
}

interface Props {
  doctorId: string;
  selectedSlot: SelectedSlot | null;
  onSlotSelect: (slot: SelectedSlot) => void;
}

/** Convert "HH:MM" → "h:MM AM/PM" */
function to12hr(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${period}`;
}

/** Format a Date to YYYY-MM-DD in local time */
function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function AvailabilityCalendar({ doctorId, selectedSlot, onSlotSelect }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const dateStr = selectedDate ? toDateString(selectedDate) : '';

  const { data: rawSlots, isLoading } = useQuery<TimeSlot[]>({
    queryKey: QUERY_KEYS.doctors.slots(doctorId, dateStr),
    queryFn: () => getAvailableSlots(doctorId, dateStr),
    enabled: !!dateStr,
    staleTime: 0,
  });

  // Filter out past slots when the selected date is today (compare local HH:MM)
  const slots = useMemo(() => {
    if (!rawSlots) return rawSlots;
    const isToday = dateStr === toDateString(new Date());
    if (!isToday) return rawSlots;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return rawSlots.filter((s) => {
      const [h, m] = s.startTime.split(':').map(Number);
      return h * 60 + m > nowMinutes;
    });
  }, [rawSlots, dateStr]);

  const { data: availability } = useDoctorAvailability(doctorId);

  // Set of day-of-week numbers (0=Sun…6=Sat) where the doctor is available
  const activeDays = useMemo(() => {
    if (!availability) return null; // null = unknown, don't disable anything yet
    const set = new Set(
      availability.filter((a) => a.isAvailable).map((a) => a.dayOfWeek),
    );
    return set;
  }, [availability]);

  function isDateDisabled(date: Date): boolean {
    if (date < today) return true;
    if (activeDays !== null && !activeDays.has(date.getDay())) return true;
    return false;
  }

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
  }

  return (
    <div className="space-y-4">
      {/* Date picker */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={isDateDisabled}
          className="rounded-xl border border-neutral-200 shadow-sm"
        />
      </div>

      {/* Time slot grid */}
      {selectedDate && (
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-2">
            Available slots for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-neutral-100 animate-pulse" />
              ))}
            </div>
          ) : slots && slots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const isSelected =
                  selectedSlot?.date === dateStr &&
                  selectedSlot.startTime === slot.startTime;
                return (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() =>
                      onSlotSelect({ date: dateStr, startTime: slot.startTime, endTime: slot.endTime })
                    }
                    className={`h-10 rounded-lg border text-sm font-medium transition ${
                      isSelected
                        ? 'bg-sky-100 border-sky-400 text-sky-700'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {to12hr(slot.startTime)}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-neutral-500">No available slots for this date</p>
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-center text-sm text-neutral-400 py-4">
          Select a date to see available time slots
        </p>
      )}
    </div>
  );
}
