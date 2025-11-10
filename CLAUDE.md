# Budget Analyzer Web - React Financial Management Application

## Application Purpose

React 19 web application for managing and analyzing financial transactions.

**Type**: Single-page application (SPA)
**Responsibilities**:
- Transaction management UI (list, search, import, delete)
- Multi-bank CSV file upload
- Date-based filtering and search
- Light/dark theme support
- Responsive design (mobile and desktop)

## Frontend Architecture

### Technology Stack

**Discovery:**
```bash
# View React version
cat package.json | grep '"react"'

# Check build tool
cat package.json | grep '"vite"'

# See all dependencies
cat package.json | jq '.dependencies'
```

**Core Technologies:**
- React 19 with TypeScript
- Vite (build tool and dev server)
- TanStack Query (server state management)
- Redux Toolkit (UI state management)
- React Router v7 (routing)
- TanStack Table (data tables)
- Shadcn/UI + Tailwind CSS (styling)

### Project Structure

**Pattern**: Feature-based organization (Bulletproof React)

```
src/
├── features/              # Feature modules (PRIMARY)
│   ├── transactions/      # Transaction feature
│   │   ├── components/   # Feature-specific components
│   │   ├── hooks/        # useTransactions, etc.
│   │   ├── pages/        # Page-level components
│   │   └── utils/        # Feature utilities
│   └── analytics/        # Analytics feature (future)
│
├── components/           # Shared components
│   └── ui/              # Shadcn/UI primitives
│
├── api/                 # API client and endpoints
├── hooks/               # Shared hooks
├── store/               # Redux store (UI state)
├── types/               # TypeScript types
├── utils/               # Generic utilities
├── lib/                 # Third-party configs
├── mocks/               # MSW handlers
└── test/                # Test setup
```

**Key Principles:**
- **features/ is primary** - Most code lives in feature folders
- **Feature isolation** - Features don't import from other features
- **Shared stays flat** - Truly shared items at top level
- **Co-location** - Everything related to feature in its folder

See [CLAUDE.md:64-95](CLAUDE.md#L64-L95) for complete structure details.

### State Management Strategy

**Dual state approach** - Different tools for different state types:

**1. React Query (`@tanstack/react-query`)** - Server/async state:
- Transaction data, API calls
- Automatic caching (5-minute stale time)
- Loading/error states
- Query keys: `['transactions']` for list, `['transaction', id]` for single

**2. Redux Toolkit** - Client-only UI state:
- Theme (light/dark) with localStorage persistence
- Search query
- Selected items
- Single slice: `src/store/uiSlice.ts`

**Discovery:**
```bash
# Find React Query hooks
cat src/features/transactions/hooks/useTransactions.ts

# View Redux slice
cat src/store/uiSlice.ts

# Check typed hooks
cat src/store/hooks.ts
```

### API Layer

**Three-mode system** for development flexibility:

1. **Mock Data Mode** (default) - Static mocks from `src/api/mockData.ts`
2. **MSW Mode** (tests) - Mock Service Worker handlers
3. **Real API Mode** - Actual backend via axios

**Toggle:** `VITE_USE_MOCK_DATA` environment variable

**API Client (`src/api/client.ts`):**
- Axios instance with 10s timeout
- Request interceptor for auth tokens (future)
- Response interceptor normalizes all errors to `ApiError` class
- Base URL: `VITE_API_BASE_URL` (dev default: `/api`)

**Development Proxy:**
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
}
```

Frontend calls `/api/v1/transactions` → Vite proxies to `http://localhost:8080/api/v1/transactions` → NGINX gateway

See [vite.config.ts:14-23](vite.config.ts#L14-L23)

## Component Architecture Patterns

### CRITICAL: Separation of Concerns

**Components are ONLY for presentation and UI logic.**

**✅ Correct Patterns:**
- Use React Query hooks in custom hooks (`useTransactions`, `useDeleteTransaction`)
- Call mutations with `mutate(data, { onSuccess, onError })`
- Keep components synchronous and declarative
- Use `isPending`, `isLoading`, `isError` from hooks
- Memoize callbacks with `useCallback`

**❌ Anti-Patterns to AVOID:**
- `async` functions in components
- `await` in component code
- Direct API calls in components
- `mutateAsync` with try/catch in components
- Complex business logic in components
- Inline function definitions in JSX props
- IIFEs (Immediately Invoked Function Expressions) in JSX
- Multi-line logic directly in JSX expressions

**Example - Correct:**
```typescript
// ✅ Component uses mutation with callbacks
const { mutate: deleteItem, isPending } = useDeleteTransaction();

const handleDelete = useCallback(() => {
  deleteItem(id, {
    onSuccess: () => toast.success('Deleted'),
    onError: (error) => toast.error(error.message),
  });
}, [id, deleteItem]);

return <Button onClick={handleDelete} disabled={isPending}>Delete</Button>;
```

**Example - Wrong:**
```typescript
// ❌ async/await in component
const handleDelete = async () => {
  try {
    await deleteTransaction.mutateAsync(id);
    toast.success('Deleted');
  } catch (error) {
    toast.error(error.message);
  }
};
```

### useEffect - When to Use

**ONLY for synchronizing with external systems:**
- ✅ DOM manipulation (body overflow, scroll, focus)
- ✅ Event listener subscriptions (keyboard, mouse) - with cleanup
- ✅ Timer setup/cleanup (setTimeout, setInterval) - with cleanup
- ✅ External state sync (URL params ↔ Redux)
- ✅ Third-party library initialization (analytics, chat widgets)
- ✅ Browser API subscriptions (localStorage, WebSocket) - with cleanup

**NEVER for:**
- ❌ Computing derived state (use `useMemo` or calculate during render)
- ❌ Event handlers (use inline handlers or `useCallback`)
- ❌ Transforming data for rendering (do during render or in `useMemo`)
- ❌ State initialization (use `useState` initializer or `useMemo`)
- ❌ Triggering mutations on user actions (use event handlers)

**Golden rule:** If you're not syncing with an external system (DOM, browser API, third-party library, URL), you probably shouldn't use `useEffect`.

See [CLAUDE.md:250-354](CLAUDE.md#L250-L354) for complete useEffect guidelines.

### Performance - Memoization

Always use `useCallback` for functions passed as props:

```typescript
// ✅ Memoized callback
const handleChange = useCallback(
  (from: string | null, to: string | null) => {
    const params = new URLSearchParams();
    if (from && to) {
      params.set('dateFrom', from);
      params.set('dateTo', to);
    }
    setSearchParams(params);
  },
  [setSearchParams],
);

<ChildComponent onChange={handleChange} />
```

## UI Patterns

### Shadcn/UI Components

Components in `src/components/ui/` are **copy-pasted primitives** (not npm packages):
- Fully owned and customizable
- Built with Tailwind CSS
- Use `cn()` utility for conditional class merging

**Discovery:**
```bash
# Find all UI components
ls src/components/ui/

# View cn utility
cat src/utils/cn.ts
```

### TanStack Table

**Pattern**: Headless table library (v8) for data tables

**Discovery:**
```bash
# View table implementation
cat src/features/transactions/components/TransactionTable.tsx
```

Features:
- Column definitions with sorting
- Filtering
- Pagination
- Selection

### Form Validation

**CRITICAL**: All form field validation MUST match OpenAPI spec constraints.

**Pattern:**
1. Check API schema in [docs/budget-analyzer-api.yaml](docs/budget-analyzer-api.yaml)
2. Apply HTML5 validation attributes to inputs:
   - `maxLength`, `minLength`, `pattern`, `required`
3. Provides better UX (prevents errors before backend)

**Example:**
```typescript
// If API schema specifies maxLength: 100
<Input maxLength={100} required />
```

### Error Handling

**Components:**
- `ErrorBoundary.tsx` - React error boundary for crashes
- `ErrorBanner.tsx` - Displays API errors with retry

**API Error Mapping:**
- All API errors normalized through `ApiError` class
- **[src/utils/errorMessages.ts](src/utils/errorMessages.ts)** maps 422 error codes to user-friendly messages
- **ALWAYS** keep `errorMessages.ts` in sync with OpenAPI spec's 422 examples
- Use `formatApiError(error, defaultMessage)` in mutation `onError` callbacks

**Discovery:**
```bash
# View error message mappings
cat src/utils/errorMessages.ts

# Check OpenAPI error codes
cat docs/budget-analyzer-api.yaml | grep -A 10 "422"
```

### Animation Configuration

**CRITICAL**: All Framer Motion props MUST be defined in [src/lib/animations.ts](src/lib/animations.ts)

**Pattern:**
- ✅ Import animation constants from `animations.ts`
- ❌ NEVER inline animation values in components

```typescript
// ✅ CORRECT
import { fadeVariants, fadeTransition } from '@/lib/animations';
<motion.div variants={fadeVariants} transition={fadeTransition}>

// ❌ WRONG
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

### Date Handling

**CRITICAL**: [src/utils/dates.ts](src/utils/dates.ts) is the ONLY place for date operations.

**Rules:**
- ❌ NEVER import `date-fns` outside of `dates.ts`
- ❌ NEVER use `new Date()` constructor outside of `dates.ts`
- ❌ NEVER perform date parsing/formatting outside of `dates.ts`

**Date Format Types:**
- **LocalDate (YYYY-MM-DD)**: Transaction dates, filters - NO timezone (e.g., `"2025-07-01"`)
- **ISO 8601 (with timezone)**: Timestamps (createdAt, updatedAt) - HAS timezone (e.g., `"2025-07-01T12:34:56Z"`)

**Pattern:**
```typescript
// ✅ CORRECT
import { formatLocalDate, parseLocalDate, formatTimestamp } from '@/utils/dates';

const displayDate = formatLocalDate(transaction.date);
const displayTimestamp = formatTimestamp(transaction.createdAt);

// ❌ WRONG
import { format } from 'date-fns';
const date = new Date('2025-07-01');  // Timezone bug!
```

### UI/UX Principles

**No Tooltips:**
- ❌ NEVER use tooltips or hover states for information
- Tooltips don't work on mobile/touch devices
- All information must be visible inline

## Path Aliases

Use `@/*` for imports instead of relative paths:

```typescript
import { Transaction } from '@/types/transaction';
import { apiClient } from '@/api/client';
```

Configured in:
- `tsconfig.json` - TypeScript resolution
- `vite.config.ts` - Vite bundling
- `vitest.config.ts` - Test resolution

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Commands

**Build and Run:**
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000)
npm run build        # Type-check + build for production
npm run preview      # Preview production build
```

**IMPORTANT**: NEVER run `npm run dev` automatically. User controls dev server.

**Code Quality:**
```bash
npm run lint:fix     # Auto-fix ESLint issues (ALWAYS use this)
npm run format       # Format with Prettier
```

**IMPORTANT**: Always use `npm run lint:fix` to auto-fix. Don't run `npm run lint` first - wastes time.

**Testing:**
```bash
npm test             # Run tests in watch mode
npm run test:ui      # Run tests with Vitest UI

# Single test file
npx vitest src/test/Button.test.tsx

# Test pattern
npx vitest --grep "renders correctly"
```

### Testing Setup

**Vitest** with jsdom environment:
- Setup: `src/test/setup.ts` (MSW server, jest-dom matchers)
- MSW handlers: `src/mocks/handlers.ts`
- Server: `src/mocks/server.ts`

### Environment Variables

Required (see `.env.example`):

- `VITE_API_BASE_URL` - API endpoint
  - Dev default: `/api` (proxied to localhost:8080)
  - Production: Full URL like `https://api.bleurubin.com`

- `VITE_USE_MOCK_DATA` - Enable mock data
  - `true` - Use static mocks
  - `false` - Make real API calls

## Code Quality Standards

### Architecture Principles

- **Production Parity**: Dev configs work identically in production
- **Explicit over Clever**: Prefer verbose, clear code
- **Question Complexity**: Challenge solutions requiring unusual workarounds
- **No Magic**: Avoid environment-specific "magic" settings

### When Suggesting Solutions

1. **Explain tradeoffs** - Don't just provide solution, explain pros/cons
2. **Flag code smells** - If something feels hacky, say so upfront
3. **Offer alternatives** - Present multiple approaches
4. **Production implications** - State if something won't work same in production
5. **Ask for feedback** - When multiple valid approaches exist

### Red Flags to Avoid

- ❌ Solutions requiring DNS resolvers for internal routing
- ❌ Configs that only work in Docker/dev but not production
- ❌ "Magic" environment variables or undocumented dependencies
- ❌ Workarounds with race conditions or timing dependencies
- ❌ Hidden performance penalties

### When in Doubt

If solution requires >2 lines of explanation for "why this works", it's too complex. Find simpler approach.

## Code Style

**ESLint**: Flat config (ESLint 9) in `eslint.config.js`
- TypeScript strict mode
- React 19 (no `React` imports in JSX)
- Unused vars error (except `_` prefix)

**Prettier**: See `.prettierrc`
- 100 char line width
- Single quotes (JS/TS), double quotes (JSX)
- Semicolons, trailing commas

## Important Notes

**Theme Persistence**: Redux stores theme, syncs to localStorage and DOM class (`dark`)

**Transaction Types**: Defined in `src/types/transaction.ts`

**API Error Types**: Defined in `src/types/apiError.ts`

**Routing**: React Router v7 with data router pattern (routes in `src/App.tsx`)

## Discovery Commands

```bash
# View package scripts
cat package.json | jq '.scripts'

# Find all React components
find src -name "*.tsx" | grep -v test

# Find API endpoints
cat src/api/endpoints.ts

# View API client config
cat src/api/client.ts

# Check React Query hooks
find src -name "use*.ts" | grep -v test

# View Redux store
cat src/store/uiSlice.ts
```

## AI Assistant Guidelines

When working on this application:

### Critical Rules

1. **NEVER implement changes without explicit permission** - Always present a plan and wait for approval
2. **Distinguish between statements and requests** - "I did X" is informational, not a request
3. **Questions deserve answers first** - Provide information before implementing
4. **Wait for explicit action language** - Only implement when user says "do it", "implement", etc.
5. **Don't auto-start dev server** - User controls `npm run dev` manually

### ESLint Rules

- **NEVER disable ESLint rules without asking** first
- If rule seems problematic, explain issue and ask permission before adding `eslint-disable` comments

### Component Patterns

- **NO async/await in components** - Use React Query hooks with callbacks
- **Memoize callbacks** - Always use `useCallback` for props
- **NO IIFEs in JSX** - Extract to components or utilities
- **Question useRef** - If not DOM/imperative API, there's probably a better way
- **useEffect only for external systems** - Not for derived state or event handlers

### Configuration Files

- **Animations**: Only define in `src/lib/animations.ts`
- **Dates**: Only import from `src/utils/dates.ts`
- **Error messages**: Keep `errorMessages.ts` synced with OpenAPI spec

### Documentation

- **Update CLAUDE.md** when architecture changes
- **Check OpenAPI spec** before creating/editing forms
- **Sync error codes** when API changes
- **Document complex patterns** in comments

### Testing

- Write tests for new features
- Use MSW for API mocking
- Keep tests co-located with components
