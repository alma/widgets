# Controller

A React hook becomes a reactive controller in a `.controller.ts` file (ARCH-11). The element that
uses it creates it in a field, and the controller hooks into the element's lifecycle with
`host.addController(this)`.

## Where it goes

- Used by one widget: `src/widgets/<widget>/controllers/`.
- Used by both widgets, with no business rule: `src/widgets/common/`.
- No business meaning at all, such as a media query: `src/shared/ui/`.

A business rule never goes in a controller. It goes in `src/domain/`, and the controller calls it
(LAYER-04).

## From hook to controller

| React | Lit |
| --- | --- |
| `useState` | a private field, then `this.host.requestUpdate()` when it changes |
| `useRef` | a private field, with no update |
| `useEffect` and its cleanup | `hostConnected()` and `hostDisconnected()` |
| `useMemo` | a getter, or a computation in `render()` |
| `useCallback` | an arrow function in a `readonly` field, so add and remove get the same function |
| `useMediaQuery` (`react-responsive`) | `MediaQueryController` from `src/shared/ui/media-query.controller.ts` |
| `useIntl()` | the `IntlShape` that the element gets from `createIntl(locale)` |

Master's effects often run on mount only. A controller starts again on each reconnect, because the
merchant can move the widget in the page.

## Rules that reviews check

- **ARCH-12** Each timer, listener, `matchMedia` query and animation frame starts in
  `hostConnected()` and stops in `hostDisconnected()`. A second connect starts it again, from the
  values of that moment.
- **LAYER-13** A timer id has the type `ReturnType<typeof setTimeout>`, or comes from
  `window.setTimeout`.
- Call `this.host.requestUpdate()` only when a value that `render()` reads changes.

## Skeleton

```ts
// path: src/widgets/payment-plans/controllers/skeleton-example.controller.ts
import type { ReactiveController, ReactiveControllerHost } from 'lit'

// Counts the ticks of a timer while the host is in the page.
export class SkeletonExampleController implements ReactiveController {
  private readonly host: ReactiveControllerHost

  private readonly delay: number

  private timer: ReturnType<typeof setTimeout> | undefined

  private ticks = 0

  constructor(host: ReactiveControllerHost, delay: number) {
    this.host = host
    this.delay = delay
    host.addController(this)
  }

  get value(): number {
    return this.ticks
  }

  hostConnected(): void {
    this.schedule()
  }

  hostDisconnected(): void {
    clearTimeout(this.timer)
    this.timer = undefined
  }

  private schedule(): void {
    this.timer = setTimeout(this.tick, this.delay)
  }

  private readonly tick = (): void => {
    this.ticks += 1
    this.host.requestUpdate()
    this.schedule()
  }
}
```

Its test defines a host element in the test file: see the controller section of
[test.md](test.md).
