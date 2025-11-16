# React Testing Plan 2025 - Integration-First Approach

## Core Philosophy (Modern Best Practices)

**"Write tests. Not too many. Mostly integration."** - Kent C. Dodds

1. **Test user behavior, not implementation details** - Use React Testing Library
2. **Prioritize integration over unit tests** - Follow the Testing Trophy model
3. **Mock network requests, not React Query** - Use MSW (already configured)
4. **Test as users interact with your app** - Render with real providers
5. **Keep it realistic** - Minimize mocking, let components work together

---

## Testing Trophy Model (Not Pyramid)

Modern React testing follows the **Testing Trophy** (not the traditional pyramid):

```
       /\
      /E2E\      ← Smallest (10%) - Critical user journeys
     /------\
    /  INT   \   ← LARGEST (70%) - Feature workflows ⭐
   /----------\
  /   UNIT     \ ← Medium (20%) - Shared utilities
 /--------------\
/     STATIC     \ ← Foundation - TypeScript + ESLint ✅
------------------
```

**Key insight:** Integration tests provide the best ROI (return on investment) - maximum confidence per time invested.

---

## What NOT to Test ❌

- React framework itself (rendering, hooks mechanics)
- Third-party libraries (TanStack Table, Shadcn UI, React Query)
- Styles and CSS
- TypeScript types
- Simple presentational components with no logic
- Implementation details (internal state, effect calls)

---

## Testing Strategy by Priority

### Priority 1: Integration Tests - HIGHEST PRIORITY ⭐ (70% of effort)

**Test complete feature workflows with real providers**

Integration tests render components with their actual dependencies (QueryClient, Redux, Router) and test how they work together. These provide the most confidence.

**Files to create:**

1. **[src/features/transactions/components/TransactionTable.test.tsx](../../src/features/transactions/components/TransactionTable.test.tsx)**
   - Render with all providers (QueryClient + Redux + Router)
   - Test transaction list displays after loading
   - Test filtering/search functionality
   - Test row selection
   - Test delete transaction flow
   - Test error states (API failures via MSW)
   - Test loading states

2. **[src/features/transactions/components/TransactionImport.test.tsx](../../src/features/transactions/components/TransactionImport.test.tsx)** (when implemented)
   - Test file upload workflow
   - Test CSV parsing and validation
   - Test success/error messages
   - Test multiple file uploads

3. **Error handling integration tests**
   - Test ErrorBoundary catches crashes
   - Test ErrorBanner displays API errors
   - Test retry mechanisms

**Why these are highest priority:**
- Test multiple units working together (components + hooks + state)
- Test with real providers, minimal mocking
- Match how users actually interact with the app
- Catch integration bugs that unit tests miss
- Provide highest confidence

**Example test structure:**
```typescript
// TransactionTable.test.tsx
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import { TransactionTable } from './TransactionTable'

describe('TransactionTable Integration', () => {
  it('displays transactions after loading', async () => {
    renderWithProviders(<TransactionTable />)

    // Wait for MSW to return mock data
    await waitFor(() =>
      expect(screen.getByText('Test Bank')).toBeInTheDocument()
    )
  })

  it('filters transactions by search query', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TransactionTable />)

    await waitFor(() => screen.getByText('Test Bank'))

    // User types in search
    const searchInput = screen.getByRole('textbox', { name: /search/i })
    await user.type(searchInput, 'Coffee Shop')

    // Verify filtered results
    expect(screen.getByText('Coffee Shop')).toBeInTheDocument()
    expect(screen.queryByText('Test Bank')).not.toBeInTheDocument()
  })

  it('deletes a transaction', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TransactionTable />)

    await waitFor(() => screen.getByText('Test transaction'))

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    // Verify transaction removed and success message shown
    await waitFor(() =>
      expect(screen.queryByText('Test transaction')).not.toBeInTheDocument()
    )
    expect(screen.getByText(/successfully deleted/i)).toBeInTheDocument()
  })
})
```

---

### Priority 2: Unit Tests - MEDIUM PRIORITY (20% of effort)

**Test shared components and pure utility functions in isolation**

Unit tests are appropriate for:
- Shared UI components used across the app
- Pure utility functions with no dependencies
- Complex isolated business logic

**Files to create/update:**

#### Shared UI Components

1. **[src/components/ui/Button.test.tsx](../../src/components/ui/Button.test.tsx)** (EXISTS - needs update)
   - ✅ Already exists
   - ❌ Uses `fireEvent` (outdated)
   - ⚠️ Update to use `@testing-library/user-event`

2. **[src/components/ui/Input.test.tsx](../../src/components/ui/Input.test.tsx)** (if Input is shared)

#### Pure Utility Functions

3. **[src/utils/dates.test.ts](../../src/utils/dates.test.ts)** - Date parsing, formatting, comparisons
   - LocalDate handling (YYYY-MM-DD, no timezone)
   - ISO 8601 conversion
   - Edge cases (invalid dates, boundary values)

4. **[src/utils/currency.test.ts](../../src/utils/currency.test.ts)** - Currency conversion
   - Exchange rate lookups
   - Currency formatting
   - Edge cases (null, zero, negative)

5. **[src/utils/jwt.test.ts](../../src/utils/jwt.test.ts)** - Token handling
   - Token decoding
   - Expiration checking
   - Invalid token handling

6. **[src/utils/errorMessages.test.ts](../../src/utils/errorMessages.test.ts)** - Error code mapping
   - Maps 422 codes to user-friendly messages
   - Handles unknown error codes
   - Stays in sync with OpenAPI spec

7. **[src/features/transactions/utils/messageBuilder.test.ts](../../src/features/transactions/utils/messageBuilder.test.ts)** - Message generation

8. **[src/features/analytics/utils/urlState.test.ts](../../src/features/analytics/utils/urlState.test.ts)** - URL building logic (when implemented)

**Why these are medium priority:**
- Pure functions (input → output), easy to test
- Critical business logic (money, dates, auth)
- Fast to run, high confidence for isolated logic
- But don't test component integration

**Example test structure:**
```typescript
// dates.test.ts
import { parseLocalDate, formatLocalDate, isValidLocalDate } from './dates'

describe('dates utilities', () => {
  describe('parseLocalDate', () => {
    it('parses valid YYYY-MM-DD format', () => {
      const result = parseLocalDate('2025-01-15')
      expect(result).toEqual(new Date(2025, 0, 15))
    })

    it('throws error for invalid format', () => {
      expect(() => parseLocalDate('01/15/2025')).toThrow()
    })

    it('handles edge cases', () => {
      expect(() => parseLocalDate('')).toThrow()
      expect(() => parseLocalDate(null as any)).toThrow()
    })
  })
})
```

---

### Priority 3: E2E Tests - LOWER PRIORITY (10% of effort, future)

**Test critical user journeys in real browser**

E2E tests are valuable but expensive (slow, brittle). Only add for critical paths.

**Potential tests (future consideration):**
- Complete transaction import workflow (upload → parse → save → view)
- Authentication flow (login → use app → logout)
- Multi-step workflows

**Recommended tool:** Playwright (modern, fast, good DX)

**Note:** Start with integration tests first. Only add E2E if you need cross-browser testing or true backend integration.

---

## Testing Setup Requirements

### 1. Install Missing Package

```bash
npm install -D @testing-library/user-event
```

**Why:** Modern replacement for `fireEvent`. Provides more realistic user interactions.

### 2. Create Test Utilities

**File:** `src/test/utils.tsx`

```typescript
import { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/store'

/**
 * Creates a fresh QueryClient for each test to prevent test pollution
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,      // Prevent test timeouts
        staleTime: 0,      // Always treat data as stale
        cacheTime: 0,      // Don't cache between tests
      },
      mutations: {
        retry: false,      // Prevent test timeouts
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},     // Suppress error logs in tests
    },
  })
}

/**
 * Renders component with all app providers (QueryClient, Redux, Router)
 * Use this for integration tests
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

/**
 * Renders component with only QueryClient provider
 * Use this for testing hooks that use React Query
 */
export function renderHookWithQuery<TProps, TResult>(
  hook: (props: TProps) => TResult,
  {
    queryClient = createTestQueryClient(),
    ...options
  } = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return {
    ...renderHook(hook, { wrapper: Wrapper, ...options }),
    queryClient,
  }
}
```

**Why:**
- Provides fresh QueryClient per test (prevents pollution)
- Wraps components with all necessary providers
- Reusable across all integration tests
- Follows TanStack Query testing best practices

### 3. Existing Setup (Already Correct) ✅

Your current setup is already excellent:
- **Vitest** - Modern test runner
- **React Testing Library** - User-centric testing
- **MSW** - Realistic API mocking
- **[src/test/setup.ts](../../src/test/setup.ts)** - MSW server lifecycle
- **[src/mocks/handlers.ts](../../src/mocks/handlers.ts)** - HTTP handlers
- **[src/mocks/server.ts](../../src/mocks/server.ts)** - MSW server

---

## Test File Organization

**Co-locate tests with code** (Bulletproof React recommendation)

**Pattern:** Test files live next to what they test

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx           ← Co-located
├── features/
│   └── transactions/
│       ├── components/
│       │   ├── TransactionTable.tsx
│       │   └── TransactionTable.test.tsx  ← Co-located
│       ├── hooks/
│       │   ├── useTransactions.ts
│       │   └── useTransactions.test.tsx   ← Co-located
│       └── utils/
│           ├── messageBuilder.ts
│           └── messageBuilder.test.ts     ← Co-located
├── utils/
│   ├── dates.ts
│   └── dates.test.ts                  ← Co-located
└── test/
    ├── setup.ts                       ← Global test config
    └── utils.tsx                      ← Test helpers (NEW)
```

**Benefits:**
- Easy to find related test
- Tests move with code during refactoring
- Clear what's tested vs. untested

---

## Best Practices (2024-2025)

### ✅ Do:

**1. Use semantic queries (priority order):**
```typescript
// Best - accessible to screen readers
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)

// Good - text content
screen.getByText(/welcome/i)

// Last resort - test IDs
screen.getByTestId('custom-element')
```

**2. Use `@testing-library/user-event` for interactions:**
```typescript
import { userEvent } from '@testing-library/user-event'

const user = userEvent.setup()
await user.click(button)
await user.type(input, 'text')
await user.selectOptions(select, 'option1')
```

**3. Wait for async operations:**
```typescript
await waitFor(() =>
  expect(screen.getByText('Loaded')).toBeInTheDocument()
)
```

**4. Test one behavior per test:**
```typescript
// Good
it('displays transactions after loading', async () => { ... })
it('filters transactions by search query', async () => { ... })

// Bad
it('does everything', async () => {
  // 50 lines testing multiple behaviors
})
```

**5. Use descriptive test names:**
```typescript
// Good
it('displays error message when API returns 500', async () => { ... })

// Bad
it('error test', async () => { ... })
```

### ❌ Don't:

**1. Test implementation details:**
```typescript
// Bad
expect(component.state.count).toBe(5)
expect(mockFn).toHaveBeenCalledWith(...)

// Good
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

**2. Over-mock:**
```typescript
// Bad - mocking everything
vi.mock('./useTransactions')
vi.mock('./TransactionRow')
vi.mock('@tanstack/react-query')

// Good - only mock network via MSW
// Let real components and hooks run
```

**3. Use `fireEvent` for user interactions:**
```typescript
// Bad (outdated)
fireEvent.click(button)

// Good (modern)
const user = userEvent.setup()
await user.click(button)
```

**4. Test without providers:**
```typescript
// Bad - will fail if component uses QueryClient/Redux/Router
render(<TransactionTable />)

// Good - provides all necessary context
renderWithProviders(<TransactionTable />)
```

**5. Ignore async operations:**
```typescript
// Bad
it('loads data', () => {
  const { result } = renderHook(() => useTransactions())
  expect(result.current.data).toBeDefined() // Will fail - not awaited
})

// Good
it('loads data', async () => {
  const { result } = renderHook(() => useTransactions(), { wrapper })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toBeDefined()
})
```

---

## TanStack Query Testing Patterns

### Setup (per test)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})
```

### Testing Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

it('fetches transactions', async () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  const { result } = renderHook(() => useTransactions(), { wrapper })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toHaveLength(5)
})
```

### Testing Mutations (callbacks, not async/await)

```typescript
it('deletes a transaction', async () => {
  const onSuccess = vi.fn()

  const { result } = renderHook(() => useDeleteTransaction(), { wrapper })

  // Use callback-based API
  result.current.mutate('transaction-id', {
    onSuccess,
  })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(onSuccess).toHaveBeenCalled()
})
```

---

## MSW Integration

Your MSW setup is already correct. Use it for all integration tests.

**Handlers in [src/mocks/handlers.ts](../../src/mocks/handlers.ts):**
```typescript
export const handlers = [
  http.get('/api/v1/transactions', () => {
    return HttpResponse.json([
      { id: '1', description: 'Test transaction', amount: 100 }
    ])
  }),

  http.delete('/api/v1/transactions/:id', () => {
    return HttpResponse.json({ success: true })
  }),
]
```

**Override handlers per test:**
```typescript
it('handles API error', async () => {
  server.use(
    http.get('/api/v1/transactions', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 })
    })
  )

  renderWithProviders(<TransactionTable />)

  await waitFor(() =>
    expect(screen.getByText(/server error/i)).toBeInTheDocument()
  )
})
```

---

## Coverage Guidelines

**Target:** ~70% coverage (diminishing returns beyond this)

**What to measure:**
- ✅ Confidence in critical user paths
- ❌ Not line coverage percentage

**Critical paths for this app:**
1. View transactions
2. Filter/search transactions
3. Select transactions
4. Delete transaction(s)
5. Error handling (network failures)
6. Loading states

**Don't obsess over 100% coverage** - it's expensive and doesn't provide proportional value.

---

## Implementation Roadmap

### Phase 1: Foundation (Immediate)

1. **Install user-event:**
   ```bash
   npm install -D @testing-library/user-event
   ```

2. **Create test utilities:**
   - Create `src/test/utils.tsx` with `renderWithProviders`

3. **Update existing test:**
   - Update `src/components/ui/Button.test.tsx` to use `user-event`

### Phase 2: Integration Tests (Priority)

1. **TransactionTable integration test:**
   - Create `src/features/transactions/components/TransactionTable.test.tsx`
   - Test loading, filtering, selection, deletion

2. **Error handling tests:**
   - Test ErrorBoundary catches crashes
   - Test ErrorBanner displays API errors

3. **Add more MSW handlers as needed:**
   - Add handlers for all transaction API endpoints

### Phase 3: Unit Tests (Complementary)

1. **Utility function tests:**
   - `src/utils/dates.test.ts`
   - `src/utils/currency.test.ts`
   - `src/utils/jwt.test.ts`
   - `src/utils/errorMessages.test.ts`

2. **Feature utilities:**
   - `src/features/transactions/utils/messageBuilder.test.ts`

### Phase 4: E2E Tests (Future)

1. **Evaluate need** - Do integration tests provide enough confidence?
2. **If needed:** Install Playwright and test critical workflows

---

## Estimated Effort

- **Phase 1 (Foundation)**: ~1-2 hours
- **Phase 2 (Integration tests)**: ~4-6 hours
- **Phase 3 (Unit tests)**: ~3-4 hours
- **Phase 4 (E2E)**: Optional, ~4-6 hours if pursued

**Total for Phases 1-3**: ~8-12 hours for comprehensive integration + unit coverage

---

## Key Principles Summary

1. **"Write tests. Not too many. Mostly integration."** - Kent C. Dodds
2. **Test behavior, not implementation** - React Testing Library philosophy
3. **Integration tests provide best ROI** - Bulletproof React recommendation
4. **Mock network, not libraries** - Use MSW for realistic tests
5. **Co-locate tests with code** - Easy to find and maintain
6. **~70% coverage is the sweet spot** - Diminishing returns beyond this

---

## Resources

- [Testing Library Docs](https://testing-library.com/react)
- [TanStack Query Testing Guide](https://tanstack.com/query/latest/docs/framework/react/guides/testing)
- [Bulletproof React Testing](https://github.com/alan2207/bulletproof-react/blob/master/docs/testing.md)
- [Kent C. Dodds: Write Tests](https://kentcdodds.com/blog/write-tests)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Vitest Documentation](https://vitest.dev/)
- [MSW Documentation](https://mswjs.io/)

---

*Document created: 2025-11-15*
*Last updated: 2025-11-16 (Revised to integration-first approach)*
