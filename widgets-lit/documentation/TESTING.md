# Testing

## Overview

The Lit widget uses unit and component tests with Web Test Runner and Open WC utilities.

## Running Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Test Principles

- Tests are local and deterministic.
- `globalThis.fetch` is stubbed in tests.
- No test should hit the real Alma API.

If you ever see a real network call in test output, it is a regression and should be fixed by stubbing `fetch` earlier in the test lifecycle.

## Coverage Targets

- Statements: 70%
- Branches: 58%
- Functions: 70%
- Lines: 70%

Coverage report: `coverage/lcov-report/index.html`

## Troubleshooting

- **Timeouts:** increase the timeout in the test or in the runner config.
- **Decorator errors:** ensure `tsconfig.json` enables `experimentalDecorators`.

## Adding Tests

1. Create a test file next to the component.
2. Use `@open-wc/testing` helpers (`fixture`, `html`, `waitUntil`).
3. Stub `globalThis.fetch` in `beforeEach()`.

See existing files in `src/**/*.test.ts` for patterns.
