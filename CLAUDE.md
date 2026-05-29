# Telehealth Frontend — Claude Code Rules

## Planning Docs (read before implementing anything)

All architecture, module contracts, API shapes, and UI screen specs are defined in the `docs/` folder at the root of this repo. These are copied from the backend repo and kept in sync manually — treat them as the single source of truth.

- `docs/`         — project-wide rules: stack, architecture, DB design, API conventions, UI/UX guidelines, build order
- `docs/modules/` — per-module contracts: exact files to create, function signatures, endpoints, validation rules, completion criteria

> Note: The canonical home of these docs is the backend repo (`telehealth-backend`). If a doc here and a verbal instruction conflict, flag it — do not silently pick one. If you suspect a doc is outdated, say so before proceeding.

### Rules
- Before implementing any feature or module, read the relevant doc in `docs/modules/` first
- Before writing any shared component, layout, or hook, read `docs/05-frontend-structure.md` and `docs/06-ui-ux-guidelines.md`
- Do not invent file structures, API shapes, or component names — they are defined in the docs
- Do not add scope beyond what the module doc specifies
- If something is missing from the docs, ask — do not assume

### Doc Map
| Doc | When to read |
|---|---|
| `docs/00-project-overview.md` | Scope boundaries, what is and isn't in MVP |
| `docs/01-architecture.md` | System structure, request flow, deployment targets |
| `docs/02-tech-stack.md` | Exact versions, critical version notes |
| `docs/04-api-conventions.md` | Response envelope, status codes, all endpoint paths |
| `docs/05-frontend-structure.md` | Folder structure, feature pattern, shared layer |
| `docs/06-ui-ux-guidelines.md` | Component patterns, spacing, interaction states |
| `docs/07-development-rules.md` | Coding conventions, naming, state rules |
| `docs/08-build-order.md` | What to build in what order, scope cut priority |
| `docs/modules/auth-module.md` | Auth feature — register, login, JWT, AuthProvider |
| `docs/modules/patients-module.md` | Patient profile feature |
| `docs/modules/doctors-module.md` | Doctor discovery, availability, booking slots |
| `docs/modules/appointments-module.md` | Booking flow, status management, consultation |
| `docs/modules/users-roles-module.md` | User profile, avatar upload, RBAC seed |
| `docs/modules/notifications-module.md` | Notification bell, Pusher subscription, mark-read |
| `docs/modules/consultations-module.md` | Jitsi embed, ConsultationLayout, join eligibility |
| `docs/modules/ai-module.md` | SymptomChecker, AI recommendation, DoctorCard compact |

---

## Stack
- React v19.2.6, Vite v8.0.12, TypeScript v6.0.2 strict
- Tailwind CSS v4.3.0 — CSS-based config in index.css only, NO tailwind.config.js
- Shadcn v4.8.0 + radix-ui v1.4.3 unified package
- TanStack Query — all server state
- AuthContext — auth state only
- ESM module system
- No Redux, no Zustand

## Radix UI Imports (critical)
CORRECT:   import * as Dialog from 'radix-ui/react-dialog'
WRONG:     import * as Dialog from '@radix-ui/react-dialog'

## Feature Pattern
src/features/<feature>/
  api/        — axios call functions, return response.data.data (unwrapped)
  components/ — feature-scoped components only
  hooks/      — useQuery/useMutation wrappers
  types/      — TypeScript interfaces
  patient/    — patient-specific pages
  doctor/     — doctor-specific pages

## State Rules
Server data     → TanStack Query
Auth state      → AuthContext
Form state      → local useState + React Hook Form
UI toggles      → local useState
Nothing else.

## UI Rules
- Every list needs an empty state
- Loading states use Skeleton, not spinners (buttons are the exception)
- Every input has a visible label — never placeholder-only
- Every action has feedback: loading → success toast or error message
- No alert(), no window.confirm()
- Status colors: pending=amber, confirmed=sky, completed=green, cancelled=red

## Rules
- IMPLEMENT ONLY what is asked
- No new dependencies without being asked
- No bonus features
- Strict TypeScript — no `any`
- Ask ONE clarifying question if requirements are unclear

### Anti-Redundancy (enforce before writing any UI)

- **Never** define `getInitials` locally — import `Avatar` from `@/shared/components/Avatar`
- **Never** define `formatDate` / `formatTime` / any `toLocaleDateString` call locally — import from `@/shared/lib/date`
- **Never** write inline button Tailwind strings (`bg-sky-100 text-sky-700 …`) — use `<Button>` from `@/shared/ui/button`
- **Never** write inline input Tailwind strings (`bg-neutral-100 … focus:border-sky-400 …`) — use `<Input>` from `@/shared/ui/input`
- **Never** write an inline empty-state block (`flex flex-col items-center justify-center …`) — use `<EmptyState>` from `@/shared/components/EmptyState`
- **Never** copy-paste a `SkeletonCard` or `SkeletonRow` function into a page — use `AppointmentSkeletonCard` or `AppointmentSkeletonTable`
- **Never** write a tab bar loop inline — use `<FilterTabs>` from `@/features/appointments/components/FilterTabs`
- Before creating any new shared component, check `src/shared/` and the appointments `components/` folder first

---

## Shared Components

These exist. Use them. Do not recreate them.

### Utilities — `src/shared/lib/`

**`date.ts`** — all date/time formatting

```ts
import { formatDate, formatDateLong, formatDateWithWeekday, formatTime, formatDateUTC } from '@/shared/lib/date'

formatDate(iso)              // "Jan 15, 2025"
formatDateLong(iso)          // "Monday, January 15, 2025"
formatDateWithWeekday(iso)   // "Mon, Jan 15, 2025"
formatTime(iso)              // "09:30 AM"
formatDateUTC(dateStr)       // "June 3, 2026" — UTC-safe for YYYY-MM-DD strings
```

### UI Primitives — `src/shared/ui/`

**`button.tsx`** — `import { Button } from '@/shared/ui/button'`

| Variant | When to use |
|---|---|
| `primary` (default) | Main CTA, form submit |
| `secondary` | Cancel, back, outline actions |
| `destructive` | Delete, cancel appointment |
| `ghost` | Low-emphasis text actions |

Sizes: `default` (`px-4 py-2`), `sm` (`px-3 py-1.5`), `icon` (`p-2`). Pass `className` to override padding only.

**`input.tsx`** — `import { Input } from '@/shared/ui/input'`

Applies the filled `bg-neutral-100` style automatically. Pass height via `className`:

```tsx
<Input className="h-10" {...register('field')} />  // standard
<Input className="h-9" value={q} onChange={…} />   // compact
```

`<select>` and `<textarea>` are native elements — no shared wrapper exists yet.

### Layout Components — `src/shared/components/`

**`Avatar.tsx`** — `import { Avatar, getInitials } from '@/shared/components/Avatar'`

```tsx
<Avatar firstName="Jane" lastName="Doe" profilePictureUrl={url} size="md" />
// size: xs (w-8) | sm (w-10) | md (w-12) | lg (w-16) | xl (w-20)
```

**`EmptyState.tsx`** — `import { EmptyState } from '@/shared/components/EmptyState'`

```tsx
<EmptyState
  icon={<svg …>…</svg>}   // pass already-sized icon (w-6 h-6 text-neutral-400)
  title="No results"
  description="Try adjusting your filters."
  action={<Button onClick={…}>Clear</Button>}
  padding="lg"            // sm=py-8 | md=py-10 | lg=py-16 (default)
/>
```

### Feature-Scoped — `src/features/appointments/components/`

**`FilterTabs.tsx`** — generic tab bar, works for any `readonly string[]`

```tsx
import { FilterTabs } from '../components/FilterTabs'
<FilterTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
```

**`AppointmentSkeletonTable.tsx`** — skeleton for appointment tables

```tsx
import { AppointmentSkeletonTable } from '../components/AppointmentSkeletonTable'
<AppointmentSkeletonTable headers={['Patient', 'Date', 'Time', 'Status', '']} />
```

**`AppointmentSkeletonCard.tsx`** — skeleton for status-card lists (dashboards)

```tsx
import { AppointmentSkeletonCard } from '../components/AppointmentSkeletonCard'
<AppointmentSkeletonCard />
```

**`QuickActions.tsx`** — card grid of navigation shortcuts

```tsx
import { QuickActions } from '../components/QuickActions'
<QuickActions columns={3} actions={[{ label, description, path, icon, iconBg, iconColor }]} />
```

**`MedicalPill.tsx`** — labeled medical info badge

```tsx
import { MedicalPill } from '../components/MedicalPill'
<MedicalPill label="Blood type" value="O+" />
```

---

## Module-Specific Critical Notes

### Consultations — layout override
Consultation pages render outside `MainLayout` — no sidebar, minimal chrome.
Use a separate `ConsultationLayout` for these two routes:
```
/patient/consultation/:appointmentId
/doctor/consultation/:appointmentId
```
Join eligibility is checked **client-side only**:
```ts
status === 'confirmed'
AND now is within [scheduledAt - 5min, scheduledAt + durationMinutes + 15min]
```
If not eligible: toast + redirect to appointment detail. Never render JitsiRoom.

### Notifications — Pusher setup
Use **public** channels for MVP (no auth endpoint needed):
```ts
const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
})
const channel = pusher.subscribe(`user-${userId}`)
```
On any Pusher event: `queryClient.invalidateQueries(QUERY_KEYS.notifications.all())`.
Clean up subscription on unmount.

### AI — SymptomChecker placement
`SymptomChecker` lives inside `DoctorListPage` as a collapsible section — it is not a page.
Closed by default. Uses `DoctorCard` with a `compact` prop — do not create a separate component.
Always show the disclaimer: "This is a discovery tool only and does not constitute medical advice."

---

## Design System

### Mood
Friendly, Wellness-Focused, Patient-Centric — soft blue and mint, open whitespace, approachable and calm.
Never cold, never clinical. Healthcare that feels human and restorative.

### Colors
Primary:         #38bdf8  (sky-400)     — buttons, links, focus rings, active states
Primary hover:   #0ea5e9  (sky-500)     — hover state for primary elements
Primary light:   #e0f2fe  (sky-100)     — soft button fill, highlight backgrounds
Primary text:    #0369a1  (sky-700)     — text on light primary backgrounds

Accent:          #6ee7b7  (emerald-300) — secondary highlights, tags, wellness accents
Accent light:    #d1fae5  (emerald-100) — soft accent backgrounds
Accent text:     #065f46  (emerald-900) — text on light accent backgrounds

Success:         #22c55e  (green-500)
Warning:         #f59e0b  (amber-500)
Danger:          #ef4444  (red-500)

Page background: #f0fdf4  (green-50)   — never pure white for the page canvas
Card background: #ffffff  (white)
Border default:  #e2e8f0  (slate-200)
Text primary:    #1e293b  (slate-800)
Text secondary:  #64748b  (slate-500)
Text muted:      #94a3b8  (slate-400)

### Typography
Font: Geist Variable (loaded via @fontsource-variable/geist)

Page title (h1):      text-2xl font-semibold tracking-tight text-slate-800
Section heading (h2): text-xl font-semibold text-slate-800
Card heading (h3):    text-base font-semibold text-slate-800
Body:                 text-sm text-slate-700
Caption / label:      text-xs text-slate-500

Never font-bold for body. Use font-semibold for emphasis.

### Layout & Spacing
Page wrapper:         p-6 (desktop), p-4 (mobile)
Section gap:          space-y-6 between major sections
Card padding:         p-5 or p-6
Form field gap:       space-y-4
Grid gap:             gap-4 or gap-6

Page layout pattern:
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Title</h1>
        <p className="text-sm text-slate-500">Description</p>
      </div>
      <Button>Primary Action</Button>
    </div>
    {/* content */}
  </div>

### Sidebar
Background:   white (#ffffff)
Border:       border-r border-slate-200
Width:        w-64 (fixed)
Nav link:     text-sm text-slate-600, rounded-lg px-3 py-2
Active link:  bg-sky-50 text-sky-700 font-medium
Hover link:   bg-slate-100 text-slate-800
Logo area:    h-16 border-b border-slate-200, flex items-center px-4

### Header
Background:   #f0fdf4 (green-50)
Border:       border-b border-slate-200
Height:       h-16
Contents:     logo/title left, notification bell + user avatar right

### Cards
Background:   white
Border:       none by default — use left accent border for status cards
Border radius: rounded-xl
Shadow:       shadow-sm
Padding:      p-5 or p-6

Status card variant (appointments, records):
  border-l-4 on the left edge, color matches status:
  pending   → border-l-amber-400
  confirmed → border-l-sky-400
  completed → border-l-green-400
  cancelled → border-l-red-400

Standard card (no status):
  border border-slate-200 rounded-xl shadow-sm

### Form Inputs
Style:        filled — bg-neutral-100, no border by default
Focus:        bg-white border border-sky-400 ring-2 ring-sky-100
Border radius: rounded-lg
Height:       h-10 (standard), h-9 (compact)
Label:        text-sm font-medium text-slate-700, always visible above input
Error text:   text-xs text-red-500 mt-1

Use `<Input>` from `@/shared/ui/input` — never write the Tailwind class string by hand:

```tsx
<div className="space-y-1.5">
  <label className="text-sm font-medium text-slate-700">Label</label>
  <Input className="h-10" {...register('field')} />
  <p className="text-xs text-red-500">Error message</p>
</div>
```

### Buttons
Use `<Button>` from `@/shared/ui/button` — never write the Tailwind class string by hand:

```tsx
<Button>Primary</Button>                         {/* sky-100 fill, default */}
<Button variant="secondary">Cancel</Button>      {/* neutral outline */}
<Button variant="destructive">Delete</Button>    {/* red-50 fill */}
<Button variant="ghost">Link-style</Button>      {/* no background */}
<Button size="sm">Compact</Button>               {/* px-3 py-1.5 */}
<Button disabled>Loading…</Button>               {/* opacity-50, no-pointer */}
```

Loading pattern: show inline spinner + `disabled` prop — do not hide the button.

### Status Badges
pending:   bg-amber-100 text-amber-700  rounded-full px-2.5 py-0.5 text-xs font-medium
confirmed: bg-sky-100   text-sky-700    rounded-full px-2.5 py-0.5 text-xs font-medium
completed: bg-green-100 text-green-700  rounded-full px-2.5 py-0.5 text-xs font-medium
cancelled: bg-red-100   text-red-700    rounded-full px-2.5 py-0.5 text-xs font-medium

### Empty States
Use `<EmptyState>` from `@/shared/components/EmptyState` — never write the centered div block by hand:

```tsx
<EmptyState
  icon={<svg className="w-6 h-6 text-slate-400" …>…</svg>}
  title="No appointments yet"
  description="Book your first consultation to get started."
  action={<Button onClick={…}>Book Now</Button>}
  padding="lg"   // sm=py-8 | md=py-10 | lg=py-16 (default)
/>
```

### Loading States
Content areas: Skeleton components (never spinners)
  <Skeleton className="h-20 w-full rounded-xl" />

Buttons only: inline spinner + disabled

### Avatars
Use `<Avatar>` from `@/shared/components/Avatar` — never write the photo/initials conditional by hand:

```tsx
<Avatar firstName="Jane" lastName="Doe" profilePictureUrl={url} size="md" />
// size: xs=w-8 | sm=w-10 | md=w-12 | lg=w-16 | xl=w-20
```

If you only need the initials string: `import { getInitials } from '@/shared/components/Avatar'`

### Interaction States
All interactive elements must have:
  hover:    subtle bg or color shift
  focus-visible: ring-2 ring-sky-400 ring-offset-1
  active:   scale-[0.98] or darker bg
  disabled: opacity-50 cursor-not-allowed

### What to Avoid
- No gradients on cards or backgrounds
- No shadows heavier than shadow-sm on cards (shadow-md only for modals/dropdowns)
- No animation beyond simple transitions (duration-150 or duration-200)
- No colored page backgrounds — green-50 only
- No placeholder-only form fields
- No generic "AI" aesthetics (glowing rings, neon accents)
- No stacked modals
- No more than 6–8 form fields visible at once — use sections or steps