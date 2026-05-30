# telehealth-frontend

React SPA for a telehealth platform. Patients discover doctors, book appointments, attend video consultations, and manage their medical profile. Doctors manage their schedule, review patient history, conduct consultations, and write notes and prescriptions.

## Tech Stack

| Package | Version | Notes |
|---|---|---|
| React | 19.2.6 | |
| Vite | 8.0.12 | Build tool + dev server |
| TypeScript | 6.0.2 | Strict mode, ESM |
| TanStack Query | 5.100.14 | All server state |
| React Router | 7.15.1 | Client-side routing |
| Tailwind CSS | 4.3.0 | CSS-only config in `index.css` — no `tailwind.config.js` |
| Shadcn | 4.8.0 | Component library |
| Radix UI | 1.4.3 | Import as `radix-ui/react-*` (unified package, not `@radix-ui/react-*`) |
| React Hook Form | 7.76.1 | Form state |
| Zod | 4.4.3 | Form + API validation |
| Axios | 1.16.1 | HTTP client with auth interceptors |
| Pusher JS | 8.5.0 | Real-time notifications |
| Jitsi React SDK | 1.4.4 | Video consultation embed |
| Sonner | 2.0.7 | Toast notifications |
| date-fns | 4.3.0 | Date utilities |
| Lucide React | 1.16.0 | Icon library |

## Getting Started

### Install

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Fill in all values — see Environment Variables below
```

### Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173` by default.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:3000`) |
| `VITE_JITSI_DOMAIN` | Jitsi server domain (e.g. `meet.jit.si`) |
| `VITE_PUSHER_KEY` | Pusher app key |
| `VITE_PUSHER_CLUSTER` | Pusher cluster (e.g. `ap1`) |

## Feature Overview

### Auth
| Route | Description |
|---|---|
| `/` | Public landing page |
| `/login` | Email + password login |
| `/register` | Registration with role selection (patient or doctor) |

### Patient
| Route | Description |
|---|---|
| `/patient/dashboard` | Upcoming appointments, quick actions |
| `/patient/doctors` | Doctor discovery with filters + AI symptom checker |
| `/patient/doctors/:id` | Doctor profile with availability calendar and booking |
| `/patient/appointments/book` | Booking flow (select doctor, date, time slot) |
| `/patient/appointments` | Appointment list with status tabs |
| `/patient/appointments/:id` | Appointment detail with reschedule / cancel actions |
| `/patient/consultation/:appointmentId` | Jitsi video room + chat panel |
| `/patient/profile` | View and edit patient profile |
| `/patient/settings` | Account settings (password, avatar, medical info, documents, emergency contact) |

### Doctor
| Route | Description |
|---|---|
| `/doctor/dashboard` | Today's appointments, quick actions |
| `/doctor/appointments` | All appointments with filters |
| `/doctor/appointments/:id` | Appointment detail + notes + prescriptions |
| `/doctor/availability` | Manage weekly schedule and blocked slots |
| `/doctor/patients/:patientId` | Patient medical history view |
| `/doctor/consultation/:appointmentId` | Jitsi video room + chat panel |
| `/doctor/profile` | View and edit doctor profile |
| `/doctor/settings` | Account settings (password, avatar, professional info) |

Consultation pages render outside `MainLayout` (no sidebar) via a separate `ConsultationLayout`. Join eligibility is enforced client-side: status must be `confirmed` and the current time must be within [scheduledAt − 5 min, scheduledAt + durationMinutes + 15 min].

## Architecture

### Feature Pattern

Each domain lives under `src/features/<feature>/`:

```
<feature>/
  api/          — axios call functions (return response.data.data, unwrapped)
  components/   — feature-scoped components
  hooks/        — useQuery / useMutation wrappers
  types/        — TypeScript interfaces
  patient/      — patient-specific pages
  doctor/       — doctor-specific pages
```

### State Management

| Data type | Tool |
|---|---|
| Server data (appointments, doctors, etc.) | TanStack Query |
| Auth state (user, token) | `AuthContext` |
| Form state | React Hook Form + local `useState` |
| UI toggles (modals, tabs) | local `useState` |

No Redux, no Zustand.

### Layouts

- **`MainLayout`** — sidebar + header, used for all authenticated pages
- **`ConsultationLayout`** — minimal chrome (logo + back link), no sidebar, used for consultation pages
- **`AuthLayout`** — minimal wrapper for login / register

### Auth Flow

1. Login / register returns `{ accessToken, refreshToken, user }`
2. `AuthProvider` stores tokens in localStorage, sets user state
3. Axios request interceptor attaches `Authorization: Bearer {token}`
4. On 401: interceptor exchanges `refreshToken` for a new access token and retries
5. On logout: localStorage cleared, state reset, redirect to `/login`

## Shared Component Library

These live in `src/shared/` and must be used instead of reimplementing inline.

### Components — `src/shared/components/`

| Component | Import | Description |
|---|---|---|
| `Avatar` | `@/shared/components/Avatar` | User avatar (initials or photo). Sizes: `xs` `sm` `md` `lg` `xl` |
| `EmptyState` | `@/shared/components/EmptyState` | Centered empty state with icon, title, description, and optional action |
| `PageHeader` | `@/shared/components/PageHeader` | Page title + subtitle + primary action button |

### UI Primitives — `src/shared/ui/`

| Component | Variants / Notes |
|---|---|
| `Button` | `primary` (default), `secondary`, `destructive`, `ghost`; sizes `default` `sm` `icon` |
| `Input` | Pre-styled with `bg-neutral-100` filled look; pass height via `className` |
| `Dialog` / `AlertDialog` | Modal wrappers |
| `Calendar` | Date picker |
| `Pagination` | Pagination controls |
| `Badge` | Status badges |

### Utilities — `src/shared/lib/`

**`date.ts`** — all date/time formatting:

```ts
import { formatDate, formatDateLong, formatDateWithWeekday, formatTime, formatDateUTC } from '@/shared/lib/date'

formatDate(iso)            // "Jan 15, 2025"
formatDateLong(iso)        // "Monday, January 15, 2025"
formatTime(iso)            // "09:30 AM"
formatDateUTC(dateStr)     // "June 3, 2026" — UTC-safe for YYYY-MM-DD strings
```

**`utils.ts`** — `cn()` (Tailwind merge) and `formatDuration(minutes)` → `"1 hr 30 min"`.

**`api.ts`** — Axios instance pre-configured with auth interceptors and response unwrapping.

### Query Keys — `src/shared/constants/queryKeys.ts`

Centralized TanStack Query key factory:

```ts
QUERY_KEYS.appointments.all(filters)
QUERY_KEYS.doctors.detail(id)
QUERY_KEYS.notifications.all()
// ...
```

### Feature-Scoped Reusables — `src/features/appointments/components/`

| Component | Description |
|---|---|
| `FilterTabs` | Generic status tab bar |
| `AppointmentSkeletonCard` | Loading skeleton for dashboard status cards |
| `AppointmentSkeletonTable` | Loading skeleton for appointment tables |
| `QuickActions` | Card grid of navigation shortcuts |
| `MedicalPill` | Labeled medical info badge |

## Design System

- **Primary color:** sky-400 (`#38bdf8`) — buttons, focus rings, active states
- **Accent:** emerald-300 (`#6ee7b7`) — tags, wellness accents
- **Page background:** green-50 (`#f0fdf4`) — never pure white
- **Font:** Geist Variable (via `@fontsource-variable/geist`)
- Status badge colors: `pending` → amber, `confirmed` → sky, `completed` → green, `cancelled` → red
- Cards: `rounded-xl shadow-sm`; status cards use a `border-l-4` left accent border

Full design tokens and component patterns: [`docs/06-ui-ux-guidelines.md`](../telehealth-backend/docs/06-ui-ux-guidelines.md)

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
src/
├── app/
│   ├── layouts/           # MainLayout, ConsultationLayout, AuthLayout
│   ├── providers/         # AuthProvider, QueryProvider (+ Sonner Toaster)
│   └── router/            # Route definitions with guards
├── features/
│   ├── ai/                # SymptomChecker (embedded in DoctorListPage)
│   ├── appointments/      # Booking, list, detail, dashboard
│   ├── auth/              # Login, register
│   ├── consultations/     # Jitsi room, chat panel, preview pages
│   ├── doctors/           # Doctor list, profile, availability calendar
│   ├── home/              # Public landing page
│   ├── notifications/     # NotificationBell, NotificationList, Pusher hook
│   ├── patients/          # Patient profile API + types
│   └── users/             # Profile page, settings page, avatar upload
├── shared/
│   ├── components/        # Avatar, EmptyState, PageHeader, layout components
│   ├── constants/         # Query key factory
│   ├── hooks/             # useDebounce, useUnsavedChanges
│   ├── lib/               # api.ts, date.ts, utils.ts
│   ├── types/             # Shared TypeScript interfaces
│   └── ui/                # Shadcn primitives (button, input, dialog, etc.)
├── test/                  # MSW mocks, Vitest setup
├── App.tsx
├── main.tsx
└── index.css              # Tailwind CSS config (CSS-only, no tailwind.config.js)
```
