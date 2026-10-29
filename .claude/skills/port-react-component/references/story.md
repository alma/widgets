# Stories

Each `.template.ts` file has a `.stories.ts` file next to it, with the same base name.
`src/stories-coverage.test.ts` fails without it. The stories come before any test, so the developer
can compare the port with master in Storybook first.

## What to write

- One story per variant that master renders: each state, each optional class or attribute, each
  branch of text. Name each story after the variant, such as `Default`, `WithExtraClass` or
  `PayLaterInDays`.
- Build the props from the fixtures and builders of `src/test/fixtures.ts` and
  `src/test/planBuilders.ts`, imported by their full path, as the unit tests do. Never declare a
  message or a plan by hand when a fixture has it.
- Format text with `createIntl(globals.locale)`, so the Locale toolbar changes the texts.
- Callbacks get `fn()` from `storybook/test`, which logs each call in the Actions panel.
- A template that shows dates counts from master's "today": add
  `beforeEach: () => stubDateNow()` from `src/test/story-stubs.ts`. Storybook calls the function it
  returns once the story ends.
- A modal template needs `parameters: { modalContainer: true }`, because `main.css` scopes some
  rules, `.sr-only` among them, to `#alma-widget-modal-main-container`.
- A template story renders the template directly. Only element stories mount a widget through
  `add()`, with `parameters.msw.handlers` for the request.

Storybook builds the title from the path: the `Default` story of
`src/widgets/payment-plans/templates/loader.stories.ts` has the ID
`widgets-payment-plans-templates-loader--default`.

## Skeleton

The first line names where `npm run test:harness` pastes it. Leave that line out of the port.

```ts
// path: src/widgets/payment-plans/templates/skeleton-example.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { fn } from 'storybook/test'

import { createIntl } from '@/shared/i18n/create-intl'
import {
  type SkeletonExampleProps,
  skeletonExampleTemplate,
} from '@/widgets/payment-plans/templates/skeleton-example.template'

const meta: Meta<SkeletonExampleProps> = {
  render: (args, { globals }) => skeletonExampleTemplate(args, createIntl(globals.locale)),
  args: { label: '?', onOpen: fn() },
}

export default meta

type Story = StoryObj<SkeletonExampleProps>

export const Default: Story = {}

export const WithInfo: Story = {
  args: { info: 'Payez en 3 fois' },
}

export const WithExtraClassAndTestId: Story = {
  args: { className: 'extra', testId: 'skeleton-example' },
}
```
