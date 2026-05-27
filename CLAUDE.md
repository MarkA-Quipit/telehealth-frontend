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
Warm & Approachable — soft neutrals, open whitespace, friendly but professional.
Never cold, never sterile. Healthcare that feels human.

### Colors
Primary:         #38bdf8  (sky-400)   — buttons, links, focus rings, active states
Primary hover:   #0ea5e9  (sky-500)   — hover state for primary elements
Primary light:   #e0f2fe  (sky-100)   — soft button fill, highlight backgrounds
Primary text:    #0369a1  (sky-700)   — text on light primary backgrounds

Success:         #22c55e  (green-500)
Warning:         #f59e0b  (amber-500)
Danger:          #ef4444  (red-500)

Page background: #f8fafc  (neutral-50) — never pure white for the page canvas
Card background: #ffffff  (white)
Border default:  #e2e8f0  (neutral-200)
Text primary:    #0f172a  (neutral-900)
Text secondary:  #64748b  (neutral-500)
Text muted:      #94a3b8  (neutral-400)

### Typography
Font: Geist Variable (loaded via @fontsource-variable/geist)

Page title (h1):      text-2xl font-semibold tracking-tight text-neutral-900
Section heading (h2): text-xl font-semibold text-neutral-900
Card heading (h3):    text-base font-semibold text-neutral-900
Body:                 text-sm text-neutral-700
Caption / label:      text-xs text-neutral-500

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
        <p className="text-sm text-neutral-500">Description</p>
      </div>
      <Button>Primary Action</Button>
    </div>
    {/* content */}
  </div>

### Sidebar
Background:   white (#ffffff)
Border:       border-r border-neutral-200
Width:        w-64 (fixed)
Nav link:     text-sm text-neutral-600, rounded-lg px-3 py-2
Active link:  bg-sky-50 text-sky-700 font-medium
Hover link:   bg-neutral-100 text-neutral-900
Logo area:    h-16 border-b border-neutral-200, flex items-center px-4

### Header
Background:   #f8fafc (neutral-50)
Border:       border-b border-neutral-200
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
  border border-neutral-200 rounded-xl shadow-sm

### Form Inputs
Style:        filled — bg-neutral-100, no border by default
Focus:        bg-white border border-sky-400 ring-2 ring-sky-100
Border radius: rounded-lg
Height:       h-10 (standard), h-9 (compact)
Label:        text-sm font-medium text-neutral-700, always visible above input
Error text:   text-xs text-red-500 mt-1

Input pattern:
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-neutral-700">Label</label>
    <input className="w-full h-10 rounded-lg bg-neutral-100 px-3 text-sm
                      focus:bg-white focus:border focus:border-sky-400
                      focus:ring-2 focus:ring-sky-100 outline-none transition" />
    <p className="text-xs text-red-500">Error message</p>
  </div>

### Buttons
Primary:
  bg-sky-100 text-sky-700 font-medium rounded-lg px-4 py-2 text-sm
  hover:bg-sky-200 transition
  loading: show spinner inline, disable button

Secondary / outline:
  border border-neutral-200 bg-white text-neutral-700 font-medium rounded-lg px-4 py-2 text-sm
  hover:bg-neutral-50 transition

Destructive:
  bg-red-50 text-red-600 font-medium rounded-lg px-4 py-2 text-sm
  hover:bg-red-100 transition

Disabled state (all):
  opacity-50 cursor-not-allowed

### Status Badges
pending:   bg-amber-100 text-amber-700  rounded-full px-2.5 py-0.5 text-xs font-medium
confirmed: bg-sky-100   text-sky-700    rounded-full px-2.5 py-0.5 text-xs font-medium
completed: bg-green-100 text-green-700  rounded-full px-2.5 py-0.5 text-xs font-medium
cancelled: bg-red-100   text-red-700    rounded-full px-2.5 py-0.5 text-xs font-medium

### Empty States
Pattern: centered, icon + message + CTA button
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-neutral-400" />
    </div>
    <h3 className="text-sm font-semibold text-neutral-900 mb-1">No appointments yet</h3>
    <p className="text-sm text-neutral-500 mb-4">Book your first consultation to get started.</p>
    <Button>Book Now</Button>
  </div>

### Loading States
Content areas: Skeleton components (never spinners)
  <Skeleton className="h-20 w-full rounded-xl" />

Buttons only: inline spinner + disabled

### Avatars
With photo:    rounded-full, object-cover
Without photo: rounded-full bg-sky-100 text-sky-700 font-semibold
               initials: first letter of first + last name

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
- No colored page backgrounds — neutral-50 only
- No placeholder-only form fields
- No generic "AI" aesthetics (glowing rings, neon accents)
- No stacked modals
- No more than 6–8 form fields visible at once — use sections or steps