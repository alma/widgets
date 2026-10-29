# Tests

Sections: Where tests go · What every port checks · Template · Controller · Element

Port master's tests of the original into the files that the file map gives, with
[jest-to-vitest.md](jest-to-vitest.md). Every test runs in jsdom, apart from the modal's focus
tests in `src/modal.browser.test.ts` (A11Y-07).

## Where tests go

| Covers | File |
| --- | --- |
| a template | the file that the file map gives: `<name>.template.test.ts` next to it, or `<name>.accessibility.test.ts` where the map names one |
| a controller | `<name>.controller.test.ts` next to it |
| an element | `<name>.element.test.ts` next to it, with the frozen property list |
| a whole widget, as master's `__tests__/` files | `src/widgets/<widget>/__tests__/<master's name>.test.ts`, mounted with `mountWidget()` |

## What every port checks

- Each case of master passes, under master's name. Drop only a case that tests a React detail,
  such as a function reference or a `formatMessage` error, and list it under
  `## Dropped test cases` in the PR description draft.
- A case that needs a part that isn't ported yet stays as `it.todo('<master's name>')`.
- axe runs through `vitest-axe` on each state that master's tests render. When a rule fails on
  master's DOM, disable that rule in that test, with a comment that says what master renders there.
  Never change the DOM to make axe pass (A11Y-02).
- A template with no test on master gets a structure test and an axe test. When master tests it,
  port its cases and add none.
- Text is compared in French, as master's tests render it: the formatted string, not the message
  ID.
- No file of the port stays out of coverage: when `vitest.config.ts` leaves one out, remove it
  from that list.

## Template

The first line of each skeleton names where `npm run test:harness` pastes it. Leave that line out
of the port.

```ts
// path: src/widgets/payment-plans/templates/skeleton-example.template.test.ts
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { render } from 'lit'
import { axe } from 'vitest-axe'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import {
  type SkeletonExampleProps,
  skeletonExampleTemplate,
} from '@/widgets/payment-plans/templates/skeleton-example.template'

// Master's tests render in French.
const intl = createIntl(Locale.fr)

const renderTemplate = (props: Partial<SkeletonExampleProps> = {}): HTMLElement => {
  const container = document.createElement('div')
  document.body.append(container)
  render(skeletonExampleTemplate({ label: '?', onOpen: vi.fn(), ...props }, intl), container)
  return container
}

describe('skeletonExampleTemplate', () => {
  it('should not have any accessibility violations', async () => {
    const container = renderTemplate({ info: 'Payez en 3 fois' })

    expect(await axe(container)).toHaveNoViolations()
  })

  it('should name the button with its French label', () => {
    renderTemplate()

    expect(screen.getByRole('button', { name: /Ouvrir les options de paiement/ })).toBeVisible()
  })

  it('should add no class and no test ID that it is not given', () => {
    const container = renderTemplate()

    expect(container.firstElementChild).toHaveClass('infoContainer', { exact: true })
    expect(container.firstElementChild).not.toHaveAttribute('data-testid')
  })

  it('should add the extra class and the test ID that it is given', () => {
    renderTemplate({ className: 'extra', testId: 'skeleton-example' })

    expect(screen.getByTestId('skeleton-example')).toHaveClass('infoContainer extra', {
      exact: true,
    })
  })

  it('should call onOpen on a click', async () => {
    const onOpen = vi.fn()
    renderTemplate({ onOpen })

    await userEvent.click(screen.getByRole('button'))

    expect(onOpen).toHaveBeenCalledOnce()
  })
})
```

## Controller

The test defines a host element. A tag stays defined until the test file ends, so give it a name
that starts with `test-`.

```ts
// path: src/widgets/payment-plans/controllers/skeleton-example.controller.test.ts
import { html } from 'lit'

import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { SkeletonExampleController } from '@/widgets/payment-plans/controllers/skeleton-example.controller'

class SkeletonExampleHost extends LightDomElement {
  readonly ticks = new SkeletonExampleController(this, 1000)

  protected override render() {
    return html`${this.ticks.value}`
  }
}
customElements.define('test-skeleton-example-host', SkeletonExampleHost)

const appendHost = (): SkeletonExampleHost => {
  const host = document.createElement('test-skeleton-example-host') as SkeletonExampleHost
  document.body.append(host)
  return host
}

describe('SkeletonExampleController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should update the host on each tick', async () => {
    const host = appendHost()

    vi.advanceTimersByTime(2000)
    await host.updateComplete

    expect(host).toHaveTextContent('2')
  })

  it('should leave no timer once the host is removed', () => {
    const host = appendHost()

    host.remove()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('should start again when the host comes back', async () => {
    const host = appendHost()
    host.remove()
    vi.advanceTimersByTime(5000)

    document.body.append(host)
    vi.advanceTimersByTime(1000)
    await host.updateComplete

    expect(host.ticks.value).toBe(1)
  })
})
```

## Element

The property list is frozen for 4.x (ARCH-10), so its test pins master's props.

```ts
// path: src/widgets/payment-plans/skeleton-example.element.test.ts
import { SkeletonExampleElement } from '@/widgets/payment-plans/skeleton-example.element'

describe('SkeletonExampleElement', () => {
  it("should keep master's properties", () => {
    expect([...SkeletonExampleElement.elementProperties.keys()].sort()).toEqual([
      'info',
      'locale',
      'onModalClose',
    ])
  })
})
```
