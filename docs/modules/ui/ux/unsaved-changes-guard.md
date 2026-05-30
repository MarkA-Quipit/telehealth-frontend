# Unsaved Changes Guard — Design Document

## Problem

The app has no protection against accidental data loss. A user editing their profile, appointment notes, availability schedule, or a booking form can freely navigate away mid-edit with no warning. This document specifies the system-wide guard that intercepts navigation whenever unsaved changes exist.

---

## Scope

**Covered:**
- Profile page — personal, professional, and medical info sections (React Hook Form)
- Settings page — change password section (controlled state)
- Book Appointment page (controlled state)
- Doctor Appointment Detail page — notes and prescription form (controlled state)
- Doctor Availability page — schedule editor (controlled state + ref snapshot)
- Patient Appointment Detail page — leave review section (controlled state)

**Excluded:**
- Auth pages (Login, Register) — abandoning signup is not meaningful data loss
- Consultation pages — real-time Jitsi video views with no standalone form editing
- Read-only pages — dashboards, appointment lists, doctor discovery, patient detail views

---

## UX Behavior

When a user attempts to leave a page with unsaved changes:

1. **In-app navigation** (clicking sidebar links, back buttons, any `<Link>`) — an `AlertDialog` intercepts the route change and presents two choices:
   - **Stay** (secondary button) — dismisses the dialog, user remains on the page with their edits intact
   - **Leave** (destructive button) — proceeds with the navigation, discarding changes

2. **Browser tab close or refresh** — the browser's native "Leave site?" prompt appears (triggered by `beforeunload`)

The dialog does NOT appear after a successful form save — the guard deactivates automatically once the form is clean.

---

## Architecture

### New Shared Files

```
src/shared/ui/alert-dialog.tsx
src/shared/hooks/useUnsavedChanges.ts
src/shared/components/UnsavedChangesDialog.tsx
```

### Modified Files

```
Settings sections (add onDirtyChange callback prop):
  src/features/users/settings/sections/PersonalInfoSection.tsx
  src/features/users/settings/sections/DoctorProfessionalInfoSection.tsx
  src/features/users/settings/sections/PatientMedicalInfoSection.tsx
  src/features/users/settings/sections/ChangePasswordSection.tsx

Pages (consume hook + render dialog):
  src/features/users/settings/ProfilePage.tsx
  src/features/users/settings/SettingsPage.tsx
  src/features/appointments/patient/BookAppointmentPage.tsx
  src/features/appointments/doctor/DoctorAppointmentDetailPage.tsx
  src/features/appointments/doctor/DoctorAvailabilityPage.tsx
  src/features/appointments/patient/AppointmentDetailPage.tsx
```

---

## `alert-dialog.tsx` — UI Primitive

Mirrors the authoring style of `src/shared/ui/dialog.tsx`. Built on the unified `radix-ui` package:

```ts
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
```

Named exports: `AlertDialog`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`.

Key differences from `Dialog`:
- No close X button — AlertDialogs are confirmation flows
- Radix disables overlay-click dismissal by default (intentional — user must make a deliberate choice)
- Same animation classes (fade-in/out, zoom-in/out, slide-in-from-center)

---

## `useUnsavedChanges` — Hook

```ts
import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import type { Blocker } from 'react-router-dom';

export function useUnsavedChanges(isDirty: boolean): { blocker: Blocker } {
  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return { blocker };
}
```

Notes:
- `useBlocker(boolean)` — React Router v7 accepts a plain boolean condition
- Programmatic `navigate()` after a successful save is NOT intercepted — no special handling needed
- Returns `blocker` so the caller can render `UnsavedChangesDialog` declaratively

---

## `UnsavedChangesDialog` — Component

```tsx
import type { Blocker } from 'react-router-dom';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
         AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction }
  from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';

interface Props { blocker: Blocker; }

export function UnsavedChangesDialog({ blocker }: Props) {
  return (
    <AlertDialog open={blocker.state === 'blocked'}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abandon changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. If you leave now, your work will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" onClick={() => blocker.reset?.()}>Stay</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={() => blocker.proceed?.()}>Leave</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

The `open` state is fully declarative — no internal `useState` needed.

---

## Integration Patterns

### Pattern A — React Hook Form sections (lifted dirty state)

Used for: `PersonalInfoSection`, `DoctorProfessionalInfoSection`, `PatientMedicalInfoSection`

Because these are child components of a route-level page, dirty state is propagated upward via a callback prop:

```ts
// Section component
interface Props {
  // ... existing props
  onDirtyChange?: (isDirty: boolean) => void;
}

// Inside the component:
const { register, handleSubmit, reset, formState: { isDirty } } = useForm<FormValues>({ ... });

useEffect(() => {
  onDirtyChange?.(isDirty);
}, [isDirty, onDirtyChange]);

// In onSubmit success:
reset(values); // sets defaultValues to saved data → isDirty becomes false
```

`ProfilePage` aggregates all three sections:

```ts
const [dirtyMap, setDirtyMap] = useState({ personal: false, professional: false, medical: false });
const isAnyDirty = Object.values(dirtyMap).some(Boolean);

const handleDirtyChange = useCallback(
  (key: string) => (isDirty: boolean) =>
    setDirtyMap(prev => ({ ...prev, [key]: isDirty })),
  []
);

const { blocker } = useUnsavedChanges(isAnyDirty);
```

The `useCallback` is required to prevent infinite `useEffect` loops in children that list `onDirtyChange` as a dependency.

### Pattern B — Controlled state pages (direct)

Used for: `BookAppointmentPage`, `SettingsPage` (ChangePassword), `DoctorAvailabilityPage`

```ts
const isDirty = selectedSlot !== null || reason.trim() !== '';
const { blocker } = useUnsavedChanges(isDirty);
// render <UnsavedChangesDialog blocker={blocker} /> at end of JSX
```

### Pattern C — Compare against server snapshot (notes)

Used for: `DoctorAppointmentDetailPage` notes form

Notes remain populated after saving (they show what was saved). Dirty is detected by comparing against the server-fetched `notes` object:

```ts
const isNotesDirty = notes
  ? noteForm.chiefComplaint !== (notes.chiefComplaint ?? '')
    || noteForm.diagnosis   !== (notes.diagnosis ?? '')
    || noteForm.notes       !== (notes.notes ?? '')
    || noteForm.followUpDate !== (notes.followUpDate ?? '')
  : Boolean(noteForm.chiefComplaint || noteForm.diagnosis || noteForm.notes);
```

After `handleSaveNotes` succeeds, TanStack Query refetches the `notes` object — the comparison becomes equal, `isNotesDirty` returns to `false` automatically.

### Pattern D — Ref snapshot (schedule)

Used for: `DoctorAvailabilityPage` schedule editor

```ts
const savedScheduleRef = useRef<typeof schedule | null>(null);

// In useEffect that loads from server:
savedScheduleRef.current = loadedSchedule;

// After handleSaveSchedule succeeds:
savedScheduleRef.current = { ...schedule };

const isScheduleDirty = savedScheduleRef.current !== null &&
  DAYS.some(({ index }) => {
    const s = savedScheduleRef.current![index], c = schedule[index];
    return s.isAvailable !== c.isAvailable
      || s.startTime !== c.startTime
      || s.endTime !== c.endTime
      || s.slotDurationMinutes !== c.slotDurationMinutes;
  });
```

---

## Dirty → Clean Lifecycle

| Component | Form type | What clears isDirty |
|---|---|---|
| PersonalInfoSection | RHF | `reset(values)` in onSubmit success |
| DoctorProfessionalInfoSection | RHF | `reset(values)` in onSubmit success |
| PatientMedicalInfoSection | RHF | `reset(values)` in onSubmit success |
| ChangePasswordSection | useState | `setCurrentPassword('')` + `setNewPassword('')` on success |
| BookAppointmentPage | useState | Successful booking → programmatic navigate (not blocked) |
| DoctorAppointmentDetailPage (notes) | useState | Server refetch makes comparison equal |
| DoctorAppointmentDetailPage (rx) | useState | Existing form reset after successful add |
| DoctorAvailabilityPage | useState + ref | `savedScheduleRef.current` updated after save |
| AppointmentDetailPage review | useState | `submitted` becomes non-null → `useUnsavedChanges(false)` |

---

## Verification Checklist

- [ ] Edit any profile field → click sidebar link → AlertDialog appears
- [ ] Click "Stay" → dialog closes, edits preserved, URL unchanged
- [ ] Click "Leave" → navigation proceeds, edits discarded
- [ ] Save the form → navigate away → no dialog (guard deactivated)
- [ ] Book appointment: select slot or type reason → click back → dialog appears
- [ ] Doctor availability: toggle a day → click nav link → dialog appears
- [ ] Doctor appointment detail: type in notes → click back → dialog appears
- [ ] Patient appointment detail: select a star rating → click nav link → dialog appears
- [ ] Edit any form → refresh browser tab → browser native "Leave site?" prompt appears
