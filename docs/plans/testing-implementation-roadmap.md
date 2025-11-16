# Testing Implementation Roadmap - Step-by-Step Breakdown

Based on the testing plan and current codebase analysis, here's the implementation broken into context-sized steps. Each step is designed to fit within a single work session and accomplish a clear, testable goal.

---

## **STEP 1: Foundation Setup** (~30-45 min session)
**Goal:** Install dependencies and create test utilities

**Tasks:**
1. Install `@testing-library/user-event` package
2. Create `src/test/utils.tsx` with:
   - `createTestQueryClient()` function
   - `renderWithProviders()` helper (wraps Redux + QueryClient + Router)
   - `renderHookWithQuery()` helper (for hook testing)
3. Update `src/components/ui/Button.test.tsx` to use user-event instead of fireEvent
4. Run tests to verify everything works

**Success criteria:** All existing tests pass with new utilities

**Commands:**
```bash
npm install -D @testing-library/user-event
npm test
```

---

## **STEP 2: Update Existing Hook Test** (~15-20 min session)
**Goal:** Refactor existing test to use new utilities

**Tasks:**
1. Update `src/test/useTransactions.test.tsx` to use `renderHookWithQuery` helper
2. Remove inline wrapper code
3. Verify test still passes

**Success criteria:** Hook test cleaner and uses shared utilities

**Commands:**
```bash
npm test
```

---

## **STEP 3: Utility Tests - Simple Functions** (~45-60 min session)
**Goal:** Test simple, pure utility functions

**Tasks:**
1. Create `src/utils/cn.test.ts` - Test class name merging (7 lines, very simple)
2. Create `src/features/transactions/utils/messageBuilder.test.ts` - Test message generation (34 lines, straightforward)
3. Run tests to verify coverage

**Success criteria:** 2 utility test files with full coverage of simple functions

**Commands:**
```bash
npm test
```

---

## **STEP 4: Utility Tests - Error Messages** (~60-90 min session)
**Goal:** Test error message formatting and mapping

**Tasks:**
1. Create `src/utils/errorMessages.test.ts` covering:
   - `formatApiError()` - Maps error codes to user messages
   - `formatFieldErrors()` - Formats validation errors
   - `getErrorMessage()` - Generic error formatter
2. Test all 422 error code mappings
3. Test edge cases (unknown codes, null values)
4. Verify sync with OpenAPI spec

**Success criteria:** Complete coverage of error handling logic

**Commands:**
```bash
npm test src/utils/errorMessages.test.ts
```

---

## **STEP 5: Utility Tests - Date Functions (Part 1)** (~90-120 min session)
**Goal:** Test critical date parsing and formatting functions

**Tasks:**
1. Create `src/utils/dates.test.ts` with tests for:
   - `parseLocalDate()` - Parse YYYY-MM-DD format
   - `formatLocalDate()` - Format to YYYY-MM-DD
   - `toISOString()` / `fromISOString()` - ISO 8601 conversion
   - `isValidLocalDate()` - Date validation
2. Test edge cases (invalid formats, leap years, boundary dates)
3. Run tests

**Success criteria:** Core date functions fully tested

**Commands:**
```bash
npm test src/utils/dates.test.ts
```

---

## **STEP 6: Utility Tests - Date Functions (Part 2)** (~60-90 min session)
**Goal:** Test date comparison and calculation functions

**Tasks:**
1. Continue `src/utils/dates.test.ts` with tests for:
   - `compareLocalDates()` - Date comparison
   - `getDaysDifference()` - Calculate days between dates
   - `addDays()` / `subtractDays()` - Date arithmetic
   - Date range functions
2. Test boundary conditions
3. Run full test suite

**Success criteria:** All date utility functions tested

**Commands:**
```bash
npm test src/utils/dates.test.ts
```

---

## **STEP 7: Utility Tests - Currency Conversion** (~90-120 min session)
**Goal:** Test complex currency conversion logic

**Tasks:**
1. Create `src/utils/currency.test.ts` covering:
   - `buildExchangeRateMap()` - Build rate lookup map
   - `findNearestExchangeRate()` - Find closest rate by date
   - `convertCurrency()` - Convert between currencies
2. Test edge cases (missing rates, null values, zero amounts, negative amounts)
3. Test date-based rate selection
4. Run tests

**Success criteria:** Currency logic fully tested with edge cases

**Commands:**
```bash
npm test src/utils/currency.test.ts
```

---

## **STEP 8: Utility Tests - JWT (Optional)** (~30-45 min session)
**Goal:** Test JWT token handling

**Tasks:**
1. Create `src/utils/jwt.test.ts` covering:
   - Token decoding
   - Expiration checking
   - Invalid token handling
2. Test edge cases
3. Run tests

**Success criteria:** JWT utilities tested (skip if not critical yet)

**Note:** This step is optional and can be done later when JWT functionality is more mature.

**Commands:**
```bash
npm test src/utils/jwt.test.ts
```

---

## **STEP 9: MSW Handlers Expansion** (~30-45 min session)
**Goal:** Add MSW handlers for integration tests

**Tasks:**
1. Review existing handlers in `src/mocks/handlers.ts`
2. Add handlers for:
   - POST `/api/v1/transactions` (create)
   - PUT `/api/v1/transactions/:id` (update)
   - Error scenarios (400, 422, 500 responses)
3. Test handlers work with existing tests

**Success criteria:** MSW handlers ready for integration tests

**Commands:**
```bash
npm test
```

---

## **STEP 10: Integration Test - TransactionTable (Part 1)** (~90-120 min session)
**Goal:** Test basic TransactionTable rendering and data loading

**Tasks:**
1. Create `src/features/transactions/components/TransactionTable.test.tsx`
2. Write tests for:
   - Renders with providers
   - Displays loading state
   - Displays transactions after loading (via MSW)
   - Displays empty state when no transactions
3. Run tests

**Success criteria:** Basic rendering and loading tested

**Commands:**
```bash
npm test src/features/transactions/components/TransactionTable.test.tsx
```

---

## **STEP 11: Integration Test - TransactionTable (Part 2)** (~90-120 min session)
**Goal:** Test filtering and search functionality

**Tasks:**
1. Continue `TransactionTable.test.tsx` with tests for:
   - Filters transactions by search query (using user-event)
   - Clears search filter
   - Search updates Redux state
2. Add MSW handlers for filtered results if needed
3. Run tests

**Success criteria:** Search and filtering fully tested

**Commands:**
```bash
npm test src/features/transactions/components/TransactionTable.test.tsx
```

---

## **STEP 12: Integration Test - TransactionTable (Part 3)** (~90-120 min session)
**Goal:** Test selection and deletion

**Tasks:**
1. Continue `TransactionTable.test.tsx` with tests for:
   - Selects single transaction row
   - Selects multiple transactions
   - Deletes selected transaction(s)
   - Shows confirmation dialog
   - Displays success message after deletion
   - Updates list after deletion
2. Run tests

**Success criteria:** Full CRUD workflow tested

**Commands:**
```bash
npm test src/features/transactions/components/TransactionTable.test.tsx
```

---

## **STEP 13: Integration Test - TransactionTable (Part 4)** (~60-90 min session)
**Goal:** Test error states and edge cases

**Tasks:**
1. Continue `TransactionTable.test.tsx` with tests for:
   - Displays error when API returns 500
   - Displays error when API returns 422
   - Retry mechanism works
   - Network timeout handling
2. Use MSW to override handlers per test
3. Run full test suite

**Success criteria:** Error handling fully tested

**Commands:**
```bash
npm test src/features/transactions/components/TransactionTable.test.tsx
npm test
```

---

## **STEP 14: Integration Test - Error Handling** (~60-90 min session)
**Goal:** Test global error handling components

**Tasks:**
1. Create error handling integration tests:
   - `src/components/ErrorBoundary.test.tsx` - Catches React crashes
   - `src/components/ErrorBanner.test.tsx` - Displays API errors
2. Test error recovery mechanisms
3. Run tests

**Success criteria:** Error UI components tested

**Commands:**
```bash
npm test src/components/ErrorBoundary.test.tsx
npm test src/components/ErrorBanner.test.tsx
```

---

## **STEP 15: Integration Test - TransactionImport (Future)** (~90-120 min session)
**Goal:** Test file upload workflow (when feature is implemented)

**Tasks:**
1. Create `src/features/transactions/components/TransactionImport.test.tsx`
2. Test file upload, CSV parsing, validation
3. Test success/error states
4. Run tests

**Success criteria:** Import workflow tested (skip if not implemented yet)

**Note:** This step is for future implementation when TransactionImport component exists.

**Commands:**
```bash
npm test src/features/transactions/components/TransactionImport.test.tsx
```

---

## **STEP 16: Test Review and Coverage** (~30-60 min session)
**Goal:** Review overall test coverage and identify gaps

**Tasks:**
1. Run test suite with coverage: `npm test -- --coverage`
2. Review coverage report
3. Identify any critical gaps
4. Add tests for missed edge cases
5. Document test coverage in testing plan

**Success criteria:** ~70% coverage on critical paths

**Commands:**
```bash
npm test -- --coverage
```

---

## **STEP 17: Cleanup and Documentation** (~30 min session)
**Goal:** Final polish and documentation

**Tasks:**
1. Remove any unused test utilities
2. Update comments in test files
3. Update testing plan with actual implementation notes
4. Create testing section in README if needed
5. Final test run

**Success criteria:** Clean, documented test suite

**Commands:**
```bash
npm test
npm run lint:fix
```

---

## Implementation Summary

### Phases Overview

| Phase | Steps | Estimated Time | Priority |
|-------|-------|----------------|----------|
| **Phase 1: Foundation** | 1-2 | ~1 hour | **CRITICAL** |
| **Phase 2: Unit Tests** | 3-8 | ~7-10 hours | **HIGH** |
| **Phase 3: MSW Setup** | 9 | ~0.5 hours | **HIGH** |
| **Phase 4: Integration Tests** | 10-15 | ~7-10 hours | **HIGHEST** |
| **Phase 5: Review** | 16-17 | ~1-1.5 hours | **MEDIUM** |

**Total Estimated Time:** 15-22 hours

### Priority Recommendations

**Must Complete (Core Testing):**
- Steps 1-2: Foundation (enables all other tests)
- Steps 3-7: Unit tests for critical utilities (dates, currency, errors)
- Step 9: MSW handlers (enables integration tests)
- Steps 10-14: Integration tests (highest ROI)
- Step 16: Coverage review

**Optional (Nice to Have):**
- Step 8: JWT tests (defer if auth not critical yet)
- Step 15: TransactionImport tests (defer if feature doesn't exist)
- Step 17: Documentation cleanup (can do anytime)

### Dependencies Between Steps

```
Step 1 (Foundation)
  ├─> Step 2 (Update existing test)
  ├─> Steps 3-8 (Unit tests - can run in parallel)
  ├─> Step 9 (MSW handlers)
  │    └─> Steps 10-15 (Integration tests - sequential recommended)
  └─> Step 16 (Coverage review)
       └─> Step 17 (Cleanup)
```

### Testing Strategy Alignment

This roadmap follows the **Testing Trophy** model:

- **Static Analysis (Foundation):** TypeScript + ESLint (already in place)
- **Unit Tests (20%):** Steps 3-8 - Pure utilities
- **Integration Tests (70%):** Steps 10-15 - Feature workflows ⭐
- **E2E Tests (10%):** Not included (future consideration)

---

## Progress Tracking

Use this checklist to track your progress:

- [ ] Step 1: Foundation Setup
- [ ] Step 2: Update Existing Hook Test
- [ ] Step 3: Utility Tests - Simple Functions
- [ ] Step 4: Utility Tests - Error Messages
- [ ] Step 5: Utility Tests - Date Functions (Part 1)
- [ ] Step 6: Utility Tests - Date Functions (Part 2)
- [ ] Step 7: Utility Tests - Currency Conversion
- [ ] Step 8: Utility Tests - JWT (Optional)
- [ ] Step 9: MSW Handlers Expansion
- [ ] Step 10: Integration Test - TransactionTable (Part 1)
- [ ] Step 11: Integration Test - TransactionTable (Part 2)
- [ ] Step 12: Integration Test - TransactionTable (Part 3)
- [ ] Step 13: Integration Test - TransactionTable (Part 4)
- [ ] Step 14: Integration Test - Error Handling
- [ ] Step 15: Integration Test - TransactionImport (Future)
- [ ] Step 16: Test Review and Coverage
- [ ] Step 17: Cleanup and Documentation

---

## Notes for Implementation

### General Principles

1. **One step per session:** Each step is designed to be completed in a single focused work session
2. **Test after each step:** Always run tests after completing each step to verify nothing broke
3. **Commit frequently:** Consider committing after each completed step
4. **Follow the Testing Trophy:** Prioritize integration tests over unit tests

### Testing Best Practices to Follow

- Use `user-event` instead of `fireEvent` for user interactions
- Use semantic queries (`getByRole`, `getByLabelText`) over test IDs
- Test behavior, not implementation details
- Mock network with MSW, not React Query or components
- Use `renderWithProviders` for all integration tests
- Wait for async operations with `waitFor`

### Common Pitfalls to Avoid

- Don't test third-party libraries (React Query, TanStack Table, etc.)
- Don't test implementation details (internal state, effect calls)
- Don't over-mock (only mock network via MSW)
- Don't ignore async operations (always await user interactions)
- Don't obsess over 100% coverage (~70% is the sweet spot)

---

*Document created: 2025-11-16*
*Based on: testing-plan.md*
