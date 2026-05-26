# Shared Directory

Reusable code shared across all features.

## Structure

### components/
Shared components used across features
- **layout/** - Header, Sidebar, Footer, MainLayout

### ui/
shadcn/ui components (design system)
- button.tsx, input.tsx, card.tsx, etc.

### hooks/
Global custom hooks
- useAuth, useApi, useDebounce, useLocalStorage

### lib/
Utility functions and helpers
- **api.ts** - Axios instance and API configuration
- **utils.ts** - Helper functions (cn, formatDate, etc.)

### types/
Global TypeScript types and interfaces
- **index.ts** - Shared types used across features

### constants/
Application-wide constants
- API endpoints, app config, etc.

## Import Aliases

Use these aliases to import from shared:
```typescript
import { Button } from '@/shared/ui/button'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/utils'
import type { User } from '@/shared/types'
```
