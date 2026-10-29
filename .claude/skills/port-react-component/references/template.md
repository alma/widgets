# Template

A React component becomes a template function in a `.template.ts` file, with its `.stories.ts`
file next to it (ARCH-11). A template is a pure function of its arguments: it reads no global
state, starts no timer and adds no listener outside of `@event` bindings. The element or a
controller owns that state and passes the values in.

## Shape

- Name the function after the component, in camel case, with `Template` at the end:
  `Loader` becomes `loaderTemplate`.
- It takes one props object, typed and exported as `<Name>Props`, with master's prop names. A
  template that formats text also takes the `IntlShape` as its second argument.
- It returns a `TemplateResult` from `html`. For an SVG asset, the `<svg>` element itself goes in
  an `html` template, because an `<svg>` element written in an `svg` template doesn't render
  correctly. Lit's `svg` tag is only for fragments inside an existing `<svg>` element.

## Same DOM as master

The DOM is part of the merchant contract (ARCH-08), so the template renders master's elements,
nesting, classes, IDs, `data-testid` values, roles and ARIA attributes, no more and no less.

- Classes: import master's CSS module, already on the branch, and bind its classes with `classMap`
  (STYLE-04). In unit tests `styles.planButton` equals `'planButton'`, as on master.
- An optional class or attribute that master leaves out when it's `undefined`: spread the class
  into `classMap` only when it's given, and bind an attribute with `ifDefined`. No attribute may
  hold the text `undefined`, and no `class` may be empty.
- An optional child: `${condition ? html`...` : nothing}`. Use `nothing`, not `''` or `null`, so
  nothing renders.
- Whitespace: JSX drops the whitespace between tags, and Lit keeps it. Prettier, which lint and
  the pre-commit hook run, formats `html` templates: when a tag doesn't fit in 100 characters, it
  puts the tag's children on their own lines. The contract tests ignore that whitespace, but it shows
  in `textContent`, and between inline elements it shows as a gap. Keep each tag that holds text
  on one line, such as `<p class=${infoClasses}>${info}</p>`: compute long attribute values in
  constants before the `html` call, as the skeleton does.
- Messages: format the descriptors of the `*.messages.ts` file with `intl.formatMessage()`. Rich
  text goes through `formatRichText` from `src/shared/ui/rich-text.ts`. Never `unsafeHTML`
  (ARCH-14), and never a new message (ARCH-04).
- Events: `@click=${handler}`, with the handler from the props. A template never creates a
  `CustomEvent` (ARCH-09).
- A business rule, such as which plans show or how a plan is named, comes from `src/domain/`
  through the props. It isn't computed in the template (LAYER-04).

## Skeleton

```ts
// path: src/widgets/payment-plans/templates/skeleton-example.template.ts
import { html, nothing, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { IntlShape } from '@/shared/i18n/i18n.types'
import { paymentPlansMessages } from '@/widgets/payment-plans/payment-plans.messages'
import styles from '@/widgets/payment-plans/templates/payment-plans.module.css'

export type SkeletonExampleProps = {
  // Master's optional extra class and test ID.
  className?: string
  testId?: string
  label: string
  info?: string
  onOpen: (event: MouseEvent) => void
}

export const skeletonExampleTemplate = (
  { className, testId, label, info, onOpen }: SkeletonExampleProps,
  intl: IntlShape,
): TemplateResult => {
  const rootClasses = classMap({
    [styles.infoContainer]: true,
    ...(className ? { [className]: true } : {}),
  })
  const knowMore = classMap({ [styles.knowMore]: true })
  const name = intl.formatMessage(paymentPlansMessages.openButtonAriaLabel)
  const infoClasses = classMap({ [styles.info]: true })
  return html`<div class=${rootClasses} data-testid=${ifDefined(testId)}>
    <button type="button" class=${knowMore} aria-label=${name} @click=${onOpen}>${label}</button>
    ${info ? html`<p class=${infoClasses}>${info}</p>` : nothing}
  </div>`
}
```
