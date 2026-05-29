# Section Component Architecture for Tab Pages

## Overview

Restructure all 7 major tab pages from monolithic components into independent section components. Enables genuine staggered entrance animations at the section level and improves long-term maintainability.

**Status:** Planned — not yet implemented  
**Estimated effort:** ~5–6 hours full scope, ~2.5 hours scoped (see below)

---

## Problem

All major tab pages are currently monolithic. The existing `page-enter` CSS animation in `MainLayout` applies to the page's single root `<div>` (one child of the wrapper), so stagger rules for `nth-child(2–5)` never fire — the whole page fades in as one unit.

```
Current:  <div class="page-enter">  ←  page-enter wrapper
              <div class="space-y-6">  ←  only child, gets animation-delay: 0ms
                  <Section1 />
                  <Section2 />
              </div>
          </div>
```

---

## Requirements

- Split page content into logical sections (header, statistics, lists, activity feeds, actions, etc.)
- Each section must be its own reusable component
- The parent page component orchestrates staggered entrance animations
- Animation applied at section level, not individual small UI elements
- First-visit state: staggered entrance plays once per tab per session; subsequent visits render instantly
- Keep business logic, data fetching, and UI presentation separated where practical
- Design for maintainability and future scalability, not solely for animation

---

## Architecture

### Animation ownership change

Move the `page-enter` class from `MainLayout`'s wrapper to each page's own root `<div>`. Sections become direct children, so `nth-child` stagger selectors apply to them.

```
Target:   <div class="space-y-6 page-enter">  ←  page root owns animation
              <SectionA />  ←  child 1, delay 0ms
              <SectionB />  ←  child 2, delay 80ms
              <SectionC />  ←  child 3, delay 155ms
          </div>
```

### First-visit tracking — `useFirstVisit` hook

```ts
// src/shared/hooks/useFirstVisit.ts
// Module-level Set survives React mount/unmount cycles (session lifetime)
const _visited = new Set<string>();

export function useFirstVisit(): boolean {
  const { pathname } = useLocation();
  const isFirst = !_visited.has(pathname);
  useEffect(() => { _visited.add(pathname); }, [pathname]);
  return isFirst;
}
```

Each page calls this and applies `page-enter` conditionally:

```tsx
const isFirstVisit = useFirstVisit();
<div className={cn('space-y-6', isFirstVisit && 'page-enter')}>
  ...sections...
</div>
```

### Re-visit behavior

No animation class → instant render. TanStack Query serves from cache so there is no visible flash.

### Data fetching in sections

| Scenario | Approach |
|----------|----------|
| Section data is **shared** with another section (e.g., dashboard fetches one query used in stats + list) | Page fetches once, passes as props |
| Section is **self-contained** (Documents, ChangePassword, ProfileForm) | Section fetches its own data internally |

---

## CSS Changes — `src/index.css`

Extend `.page-enter > *:nth-child(N)` delay rules from 5 to 8 children (PatientProfilePage has 7 section children):

```css
/* Add these 3 rules after the existing nth-child(5) rule */
.page-enter > *:nth-child(6) { animation-delay: 350ms; }
.page-enter > *:nth-child(7) { animation-delay: 405ms; }
.page-enter > *:nth-child(8) { animation-delay: 455ms; }
```

---

## `MainLayout.tsx` Change

Remove `visitedPaths` useState, `isFirstVisit`, `key={location.pathname}`, and `page-enter` class from wrapper div. Each page owns its own animation now.

```tsx
// Before
const [visitedPaths] = useState(() => new Set<string>());
const isFirstVisit = !visitedPaths.has(location.pathname);
<div key={location.pathname} className={isFirstVisit ? 'page-enter' : undefined}>
  <Outlet />
</div>

// After
<div className="flex-1 overflow-auto p-6">
  <Outlet />
</div>
```

---

## New Files to Create

### Shared hook
| File | Purpose |
|------|---------|
| `src/shared/hooks/useFirstVisit.ts` | Module-level visited-path tracking, returns `boolean` |

### Shared user section components
| File | Extracted from | Props |
|------|---------------|-------|
| `src/features/users/components/ChangePasswordSection.tsx` | Inline duplicate in both profile pages | `{ userId: string }` |
| `src/features/users/components/LogoutAllSection.tsx` | Inline duplicate in both profile pages | *(none)* |

### Patient sections
| File | Extracted from | Props |
|------|---------------|-------|
| `src/features/patients/components/DocumentsSection.tsx` | Inline function in `PatientProfilePage` | `{ patientId: string }` |

### Appointment sections
| File | Purpose | Props |
|------|---------|-------|
| `src/features/appointments/components/UpcomingAppointmentsSection.tsx` | "Upcoming Appointments" card (skeleton/list/empty) | `{ isLoading, appointments, onBook }` |
| `src/features/appointments/components/TodayAppointmentsSection.tsx` | "Today's Appointments" card | `{ isLoading, appointments, onViewAll }` |
| `src/features/appointments/components/DoctorStatsSection.tsx` | 2-column pending/confirmed stat tiles | `{ pendingCount, confirmedCount }` |
| `src/features/appointments/components/PatientSearchResults.tsx` | Inline function in `DoctorAppointmentListPage`, self-fetching | `{ filters: PatientSearchFilters }` |

### Doctor sections
| File | Extracted from | Purpose |
|------|---------------|---------|
| `src/features/doctors/components/DoctorCardSkeleton.tsx` | Inline `CardSkeleton` in `DoctorListPage` | Loading skeleton for doctor grid |

### Profile form sections
| File | Manages | Props |
|------|---------|-------|
| `src/features/users/components/PatientProfileForm.tsx` | Own `useForm`, `useUpdateUser`, `useUpdatePatient`; Personal + Medical + Emergency sub-sections + Save button | `{ fullUser: User; patient: Patient }` |
| `src/features/users/components/DoctorProfileForm.tsx` | Own `useForm`, `useUpdateUser`, `useUpdateDoctor`; Personal + Professional + AcceptingPatients toggle + Save button | `{ fullUser: User; doctor: Doctor }` |

---

## Page Section Breakdown After Refactor

### `PatientDashboardPage` — 3 sections
1. Header `<div>` (inline — no logic, just h1+p)
2. `<UpcomingAppointmentsSection isLoading={…} appointments={upcoming} onBook={…} />`
3. `<QuickActions … />` *(already a component)*

### `DoctorDashboardPage` — 3–4 sections
1. Header `<div>` (inline)
2. `{!isLoading && todayAppointments.length > 0 && <DoctorStatsSection … />}` *(conditional)*
3. `<TodayAppointmentsSection isLoading={…} appointments={todayAppointments} onViewAll={…} />`
4. `<QuickActions … />` *(already a component)*

### `AppointmentListPage` — 3–4 sections
1. Header `<div>` (inline)
2. `<FilterTabs … />` *(already a component)*
3. Content block (skeleton/table/empty — already uses existing components, keep inline conditional)
4. Pagination `<div>` (inline, conditional)

### `DoctorAppointmentListPage` — 3–4 sections
1. Header `<div>` (inline)
2. `<PatientSearchFilter … />` *(already a component)*
3. `<PatientSearchResults … />` *(new component)* or tabs + table when not searching
4. Pagination (inline, conditional)

### `DoctorListPage` — 4–5 sections
1. Header `<div>` (inline)
2. SymptomChecker collapsible *(already a component)*
3. `<DoctorFilter … />` *(already a component)*
4. Grid (skeleton/grid/empty — uses new `DoctorCardSkeleton`)
5. Pagination (inline, conditional)

### `PatientProfilePage` — 7 sections
1. Header `<div>` (inline)
2. `<ProfileCard user={fullUser} />` *(already a component)*
3. `<AvatarUpload … />` *(already a component)*
4. `<PatientProfileForm fullUser={fullUser} patient={patient} />` *(new)*
5. `{patient && <DocumentsSection patientId={patient.id} />}` *(new)*
6. `<ChangePasswordSection userId={fullUser.id} />` *(new shared)*
7. `<LogoutAllSection />` *(new shared)*

### `DoctorProfilePage` — 6 sections
1. Header `<div>` (inline)
2. `<ProfileCard user={fullUser} />` *(already a component)*
3. `<AvatarUpload … />` *(already a component)*
4. `<DoctorProfileForm fullUser={fullUser} doctor={doctor} />` *(new)*
5. `<ChangePasswordSection userId={fullUser.id} />` *(new shared)*
6. `<LogoutAllSection />` *(new shared)*

---

## Scoped-Down Version (if time is limited)

Delivers all user-visible animation improvements without the riskier form extractions:

1. `useFirstVisit` hook + CSS extension + `MainLayout` simplification *(animation system fully working)*
2. `ChangePasswordSection` + `LogoutAllSection` deduplication *(biggest maintainability win, low risk)*
3. Wire `useFirstVisit` + `page-enter` on all 7 pages *(animation goal fully met)*

Skip `PatientProfileForm`, `DoctorProfileForm`, and other section extractions — these are internal structural improvements with no user-visible impact.

---

## Verification Checklist

- [ ] Cold navigation to each tab: sections stagger in with delays (0ms → 80ms → 155ms…)
- [ ] Return navigation to visited tab: renders instantly, no animation
- [ ] Page reload: first-visit animations play again on all tabs
- [ ] `prefers-reduced-motion`: all animations disabled (existing CSS rule already handles this)
- [ ] Profile pages: form save, password change, logout-all still work
- [ ] `DoctorDashboard` stats: only appear when appointments exist; conditional renders correctly
- [ ] `npm run build` or `tsc --noEmit` passes with no TypeScript errors

---

## Files Changed Summary

| File | Type |
|------|------|
| `src/shared/hooks/useFirstVisit.ts` | New |
| `src/features/users/components/ChangePasswordSection.tsx` | New |
| `src/features/users/components/LogoutAllSection.tsx` | New |
| `src/features/patients/components/DocumentsSection.tsx` | New |
| `src/features/appointments/components/UpcomingAppointmentsSection.tsx` | New |
| `src/features/appointments/components/TodayAppointmentsSection.tsx` | New |
| `src/features/appointments/components/DoctorStatsSection.tsx` | New |
| `src/features/appointments/components/PatientSearchResults.tsx` | New |
| `src/features/doctors/components/DoctorCardSkeleton.tsx` | New |
| `src/features/users/components/PatientProfileForm.tsx` | New |
| `src/features/users/components/DoctorProfileForm.tsx` | New |
| `src/index.css` | Modified |
| `src/app/layouts/MainLayout.tsx` | Modified |
| `src/features/appointments/patient/PatientDashboardPage.tsx` | Modified |
| `src/features/appointments/doctor/DoctorDashboardPage.tsx` | Modified |
| `src/features/appointments/patient/AppointmentListPage.tsx` | Modified |
| `src/features/appointments/doctor/DoctorAppointmentListPage.tsx` | Modified |
| `src/features/doctors/patient/DoctorListPage.tsx` | Modified |
| `src/features/users/patient/PatientProfilePage.tsx` | Modified |
| `src/features/users/doctor/DoctorProfilePage.tsx` | Modified |
