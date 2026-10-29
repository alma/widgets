# From jest to Vitest

Master's tests run on jest with `@testing-library/react`, jest-dom and `jest-axe`. The ported
tests run on Vitest in jsdom, with `@testing-library/dom`, jest-dom and `vitest-axe`. Keep
master's queries, selectors and expected values, even a selector that matches nothing: the port
reproduces master's tests, neither stronger nor weaker.

## What the setup already does

`src/test/setup.ts` and `src/test/setup-jsdom.ts` replace master's `src/setupTests.ts`. Drop from
the ported test what they already do:

- `Date.now()` returns master's "today", `1638350762000`, in every test.
- The jest-dom and `vitest-axe` matchers are on.
- `matchMedia` matches no query, and `no-scroll` and the canvas that axe needs are mocked.
- After each test, the spies are restored, the mock calls are cleared, and `<body>`,
  `sessionStorage` and the once-only warnings are emptied.
- Tests run in UTC. A test can set `process.env.TZ` for itself.
- A CSS module class equals its key, as with `identity-obj-proxy`: `styles.planButton` is
  `'planButton'`.

Vitest's globals are on: `describe`, `it`, `expect`, `vi`, `beforeEach` and the others need no
import. Types come from `vitest` with `import type`.

## Imports and rendering

| Master | Port |
| --- | --- |
| `render(<X />)` from `@/test` (French) | a template: `render(xTemplate(props, createIntl(Locale.fr)), container)` with `render` from `lit`. A widget: `await mountWidget('PaymentPlans', options)` from `@/test/mount-widget`, French by default |
| `rerender(<X />)` | render the template again into the same container. For an element, set the property, then `await host.updateComplete` |
| `screen`, `within`, `waitFor`, `fireEvent` from `@testing-library/react` | the same names from `@testing-library/dom` |
| `act(...)` | drop it. After a change, `await host.updateComplete`. To wait for a request, `await screen.findBy...` or `await vi.waitFor(...)` |
| `axe` and `toHaveNoViolations` from `jest-axe` | `axe` from `vitest-axe`. The matcher is already on |
| `userEvent` from `@testing-library/user-event` | unchanged. With fake timers, use `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` |
| an expected `<FormattedMessage>` or message ID | the formatted French string |

`classMap` writes the `class` attribute with spaces around the names. Check classes with
`toHaveClass('a b', { exact: true })`, never with `toHaveAttribute('class', ...)`.

## Mocks

| jest | Vitest |
| --- | --- |
| `jest.fn()` | `vi.fn()` |
| `jest.spyOn(object, 'method')` | `vi.spyOn(object, 'method')` |
| `jest.Mock`, `jest.MockedFunction<typeof f>` | `Mock`, `MockedFunction<typeof f>` from `vitest`, or `vi.mocked(f)` |
| `jest.mock('module', factory)` | `vi.mock('@/path', factory)`. Vitest hoists it above the imports, so the factory reaches outer variables only through `vi.hoisted()`, and a default export goes in `{ default: ... }` |
| `jest.requireActual('module')` | `await vi.importActual<typeof import('@/path')>('@/path')`, in an async factory |
| `jest.resetAllMocks()` | `vi.resetAllMocks()` |
| `jest.restoreAllMocks()`, `jest.clearAllMocks()`, `sessionStorage.clear()` in `afterEach` | drop them: the setup does it |

Master mocks `utils/fetch` and the hooks. The port mocks neither: it adds msw handlers, so the real
request, cache, filter and sort run. Call `server.use(eligibilityPlans(plans))` with `server` from
`@/test/msw-server` and the handlers of `@/test/eligibilityHandlers`. A request with no handler
fails the test. Because the plans now go through the filter and the sort, check the plans the test
expects again.

## Timers

| jest | Vitest |
| --- | --- |
| `jest.useFakeTimers()` | `vi.useFakeTimers()`. The fake clock starts at master's "today" |
| `jest.useRealTimers()` | `vi.useRealTimers()`. The setup doesn't reset the timers, so call it in `afterEach` |
| `jest.advanceTimersByTime(ms)` | `vi.advanceTimersByTime(ms)`, then `await host.updateComplete` before reading the DOM, because Lit renders in a microtask |
| `jest.runOnlyPendingTimers()` | `vi.runOnlyPendingTimers()` |
| `jest.clearAllTimers()` | `vi.clearAllTimers()` |

`vi.getTimerCount()` tells whether a removed host left a timer behind (ARCH-12).
