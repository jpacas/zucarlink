# Testing

## Philosophy

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

**Vitest v4** + **@testing-library/react** + **jsdom**

## How to Run

```bash
cd frontend
npm test          # Run all tests once
npm run test:watch  # Watch mode
```

## Test Layers

### Unit Tests
- **What:** Individual component rendering and behavior
- **Where:** `src/test/*.test.tsx`
- **When:** When adding new components or modifying existing ones

### Integration Tests
- Mock API calls with `vi.mock('../utils/axiosConfig')`
- Test component behavior after async data loads

## Conventions

- Test files: `src/test/<ComponentName>.test.tsx`
- Imports: `import { render, screen } from '@testing-library/react'`
- Assertions: `expect(element).toBeInTheDocument()`
- Mocking: Use `vi.mock()` for axiosConfig and AuthContext
- Always wrap with `<MemoryRouter>` for pages that use routing
- For pages that use Snackbar: wrap with `<SnackbarProvider>`

## Test Expectations

- When writing new components, write a corresponding test
- When fixing a bug, write a regression test
- When adding error handling, write a test that triggers the error
- When adding a conditional (if/else), write tests for BOTH paths
- Never commit code that makes existing tests fail
