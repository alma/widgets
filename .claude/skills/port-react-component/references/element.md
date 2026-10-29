# Element

Each widget has one custom element: `<alma-payment-plans>` and `<alma-eligibility-modal>`. Write
one only when the file map gives a `.element.ts` file for the original. The facade in
`src/public-api/widgets.ts` creates the element, sets its properties with `Object.assign()` before
it appends it to the merchant's container, and sets them again on a second `add()`.

## Rules

- **ARCH-06** It extends `LightDomElement` from `src/shared/ui/lit/light-dom-element.ts`, which
  renders in light DOM, sets `display: contents`, renders before `add()` returns, and turns a
  render error into a warning.
- **ARCH-07** It registers with `@safeCustomElement('<tag>')`, never `@customElement` or
  `customElements.define`.
- **ARCH-10** Its properties are master's props, with the same names, types and defaults. Each is
  a `@property({ attribute: false })`: the facade sets properties, never attributes. The list is
  frozen for 4.x, and the element's test pins it.
- **ARCH-09** No `reflect: true` and no `CustomEvent`. The element reaches the page only through
  the callbacks of the options.
- **ARCH-12** The element's timers, listeners and media queries live in controllers, which stop
  them on disconnect and start them again on reconnect.
- **ARCH-13** No exception reaches the merchant's page. A misconfiguration logs one console
  warning prefixed `[Alma widgets]`. Here: where master throws, call `warnOnce` from
  `src/shared/lib/errors.ts` and render what master shows, or nothing.

The element owns the state: it creates its controllers in fields, computes what the templates need
from `src/domain/`, and passes values and handlers to the templates. `render()` calls templates
and holds no markup of its own beyond what master's component renders around them.

## Skeleton

The first line names where `npm run test:harness` pastes it. Leave that line out of the port.

```ts
// path: src/widgets/payment-plans/skeleton-example.element.ts
import { property } from 'lit/decorators.js'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { safeCustomElement } from '@/shared/ui/lit/safe-custom-element'
import { SkeletonExampleController } from '@/widgets/payment-plans/controllers/skeleton-example.controller'
import { skeletonExampleTemplate } from '@/widgets/payment-plans/templates/skeleton-example.template'

@safeCustomElement('alma-skeleton-example')
export class SkeletonExampleElement extends LightDomElement {
  // Master's props and defaults, frozen for 4.x.
  @property({ attribute: false }) locale: string = Locale.en

  @property({ attribute: false }) info?: string

  @property({ attribute: false }) onModalClose?: (event: MouseEvent | KeyboardEvent) => void

  private readonly ticks = new SkeletonExampleController(this, 1000)

  protected override render() {
    return skeletonExampleTemplate(
      { label: String(this.ticks.value), info: this.info, onOpen: this.onOpen },
      createIntl(this.locale),
    )
  }

  private readonly onOpen = (event: MouseEvent): void => {
    this.onModalClose?.(event)
  }
}
```
