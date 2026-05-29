import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Trash2, CalendarOff } from 'lucide-react';
import { formatDateUTC } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { useAuthContext } from '@/app/providers/AuthProvider';
import { useUser } from '@/features/users/hooks/useUser';
import {
  getAvailability,
  setAvailability,
  getBlockedSlots,
  addBlockedSlot,
  deleteBlockedSlot,
} from '@/features/doctors/api/doctors.api';
import type { DoctorAvailability, BlockedSlot, AvailabilityInput } from '@/features/doctors/types';

// ---------------------------------------------------------------------------
// Day column config
// ---------------------------------------------------------------------------
const DAYS = [
  { index: 0, short: 'Sun', label: 'Sunday' },
  { index: 1, short: 'Mon', label: 'Monday' },
  { index: 2, short: 'Tue', label: 'Tuesday' },
  { index: 3, short: 'Wed', label: 'Wednesday' },
  { index: 4, short: 'Thu', label: 'Thursday' },
  { index: 5, short: 'Fri', label: 'Friday' },
  { index: 6, short: 'Sat', label: 'Saturday' },
];

interface DayState {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

const DEFAULT_DAY: DayState = { isAvailable: false, startTime: '09:00', endTime: '17:00' };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}


// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export function DoctorAvailabilityPage() {
  const { user: authUser } = useAuthContext();
  const { data: fullUser } = useUser(authUser?.id ?? '');
  const doctorId = fullUser?.doctorId ?? '';

  // ── Weekly schedule state ────────────────────────────────────────────────
  const [schedule, setSchedule] = useState<Record<number, DayState>>(() =>
    Object.fromEntries(DAYS.map((d) => [d.index, { ...DEFAULT_DAY }])),
  );
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  // ── Blocked slots state ───────────────────────────────────────────────────
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [blockedLoading, setBlockedLoading] = useState(true);

  // Add blocked slot form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [newReason, setNewReason] = useState('');
  const [addingSlot, setAddingSlot] = useState(false);

  // ── Load availability on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!doctorId) return;

    getAvailability(doctorId)
      .then((rows: DoctorAvailability[]) => {
        const next: Record<number, DayState> = Object.fromEntries(
          DAYS.map((d) => [d.index, { ...DEFAULT_DAY }]),
        );
        for (const row of rows) {
          next[row.dayOfWeek] = {
            isAvailable: row.isAvailable,
            startTime: row.startTime,
            endTime: row.endTime,
          };
        }
        setSchedule(next);
      })
      .catch(() => toast.error('Failed to load schedule'))
      .finally(() => setScheduleLoading(false));

    getBlockedSlots(doctorId)
      .then(setBlockedSlots)
      .catch(() => toast.error('Failed to load blocked slots'))
      .finally(() => setBlockedLoading(false));
  }, [doctorId]);

  // ── Save weekly schedule ──────────────────────────────────────────────────
  async function handleSaveSchedule() {
    if (!doctorId) return;

    // Validate enabled days
    for (const [idxStr, day] of Object.entries(schedule)) {
      if (!day.isAvailable) continue;
      const [sh, sm] = day.startTime.split(':').map(Number);
      const [eh, em] = day.endTime.split(':').map(Number);
      if (eh * 60 + em <= sh * 60 + sm) {
        toast.error(`Day ${DAYS[Number(idxStr)].label}: end time must be after start time`);
        return;
      }
    }

    setScheduleSaving(true);
    try {
      const slots: AvailabilityInput[] = DAYS.map(({ index }) => ({
        dayOfWeek: index,
        startTime: schedule[index].startTime,
        endTime: schedule[index].endTime,
        isAvailable: schedule[index].isAvailable,
      }));
      await setAvailability(doctorId, slots);
      toast.success('Schedule saved');
    } catch {
      toast.error('Failed to save schedule');
    } finally {
      setScheduleSaving(false);
    }
  }

  // ── Add blocked slot ──────────────────────────────────────────────────────
  async function handleAddSlot() {
    if (!doctorId || !newDate || !newStart || !newEnd) {
      toast.error('Please fill in date, start time, and end time');
      return;
    }
    const [sh, sm] = newStart.split(':').map(Number);
    const [eh, em] = newEnd.split(':').map(Number);
    if (eh * 60 + em <= sh * 60 + sm) {
      toast.error('End time must be after start time');
      return;
    }

    setAddingSlot(true);
    try {
      const slot = await addBlockedSlot(doctorId, {
        blockedDate: newDate,
        startTime: newStart,
        endTime: newEnd,
        reason: newReason || undefined,
      });
      setBlockedSlots((prev) => [...prev, slot].sort((a, b) => a.blockedDate.localeCompare(b.blockedDate)));
      setNewDate('');
      setNewStart('');
      setNewEnd('');
      setNewReason('');
      setShowAddForm(false);
      toast.success('Blocked slot added');
    } catch {
      toast.error('Failed to add blocked slot');
    } finally {
      setAddingSlot(false);
    }
  }

  // ── Delete blocked slot ───────────────────────────────────────────────────
  async function handleDeleteSlot(slotId: string) {
    if (!doctorId) return;
    try {
      await deleteBlockedSlot(doctorId, slotId);
      setBlockedSlots((prev) => prev.filter((s) => s.id !== slotId));
      toast.success('Slot removed');
    } catch {
      toast.error('Failed to remove slot');
    }
  }

  // ── Update a single day in state ──────────────────────────────────────────
  function updateDay(index: number, patch: Partial<DayState>) {
    setSchedule((prev) => ({ ...prev, [index]: { ...prev[index], ...patch } }));
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">My Schedule</h1>
        <p className="text-sm text-neutral-500">Manage your weekly availability and blocked times</p>
      </div>

      {/* ── Weekly Schedule Card ─────────────────────────────────────────── */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-5">
        <h2 className="text-base font-semibold text-neutral-900">Weekly Schedule</h2>

        {scheduleLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Desktop: grid */}
            <div className="hidden md:grid grid-cols-7 gap-3">
              {DAYS.map(({ index, short }) => {
                const day = schedule[index];
                return (
                  <div key={index} className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-neutral-500 text-center">{short}</span>

                    {/* Toggle */}
                    <label className="flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={day.isAvailable}
                        onChange={(e) => updateDay(index, { isAvailable: e.target.checked })}
                      />
                      <div
                        className={`w-10 h-5 rounded-full transition-colors ${
                          day.isAvailable ? 'bg-sky-400' : 'bg-neutral-200'
                        } relative`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            day.isAvailable ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </label>

                    {/* Times */}
                    {day.isAvailable && (
                      <div className="flex flex-col gap-1">
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => updateDay(index, { startTime: e.target.value })}
                          className="w-full h-8 rounded-lg bg-neutral-100 px-2 text-xs focus:bg-white focus:border focus:border-sky-400 outline-none"
                        />
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => updateDay(index, { endTime: e.target.value })}
                          className="w-full h-8 rounded-lg bg-neutral-100 px-2 text-xs focus:bg-white focus:border focus:border-sky-400 outline-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile: stacked list */}
            <div className="md:hidden space-y-3">
              {DAYS.map(({ index, label }) => {
                const day = schedule[index];
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 border border-neutral-100 rounded-lg px-4 py-3"
                  >
                    <span className="w-24 text-sm font-medium text-neutral-700 shrink-0">{label}</span>

                    {/* Toggle */}
                    <label className="flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={day.isAvailable}
                        onChange={(e) => updateDay(index, { isAvailable: e.target.checked })}
                      />
                      <div
                        className={`w-10 h-5 rounded-full transition-colors ${
                          day.isAvailable ? 'bg-sky-400' : 'bg-neutral-200'
                        } relative`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            day.isAvailable ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </label>

                    {day.isAvailable ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => updateDay(index, { startTime: e.target.value })}
                          className="h-9 rounded-lg bg-neutral-100 px-2 text-sm focus:bg-white focus:border focus:border-sky-400 outline-none"
                        />
                        <span className="text-neutral-400 text-xs">–</span>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => updateDay(index, { endTime: e.target.value })}
                          className="h-9 rounded-lg bg-neutral-100 px-2 text-sm focus:bg-white focus:border focus:border-sky-400 outline-none"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">Unavailable</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveSchedule}
                disabled={scheduleSaving}
                className="flex items-center gap-2 px-5 disabled:cursor-not-allowed"
              >
                {scheduleSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Schedule
              </Button>
            </div>
          </>
        )}
      </div>

      {/* ── Blocked Slots Card ───────────────────────────────────────────── */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900">Blocked Slots</h2>
          <Button
            onClick={() => setShowAddForm((v) => !v)}
            size="sm"
            className="flex items-center gap-1.5"
          >
            {showAddForm ? 'Cancel' : 'Add'}
          </Button>
        </div>

        {/* Add form — collapsed by default, toggled by "Add" button */}
        {showAddForm && (
          <div className="border border-neutral-100 rounded-xl p-4 space-y-3 bg-neutral-50">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">New Blocked Slot</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-600">Date</label>
                <input
                  type="date"
                  min={todayISO()}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full h-9 rounded-lg bg-white border border-neutral-200 px-3 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-600">Start time</label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-full h-9 rounded-lg bg-white border border-neutral-200 px-3 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-600">End time</label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="w-full h-9 rounded-lg bg-white border border-neutral-200 px-3 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-600">Reason (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Personal appointment"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full h-9 rounded-lg bg-white border border-neutral-200 px-3 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleAddSlot}
                disabled={addingSlot}
                className="flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {addingSlot && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Blocked slots list */}
        {blockedLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : blockedSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <CalendarOff className="w-5 h-5 text-neutral-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-900">No blocked slots upcoming</p>
            <p className="text-xs text-neutral-500 mt-1">Add a blocked slot above to prevent bookings</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {blockedSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between py-3 gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="shrink-0">
                    <p className="text-sm font-medium text-neutral-900">
                      {formatDateUTC(slot.blockedDate)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {slot.startTime} – {slot.endTime}
                    </p>
                  </div>
                  {slot.reason && (
                    <span className="text-xs text-neutral-400 truncate">{slot.reason}</span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="shrink-0 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition"
                  aria-label="Delete blocked slot"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
