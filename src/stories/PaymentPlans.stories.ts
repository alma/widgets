import type { Meta, StoryContext, StoryObj } from '@storybook/web-components-vite'
import { waitFor } from 'storybook/test'

import { ApiMode, Widgets } from '@/index'
import { eligibilityPending, eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockPlansAllEligible } from '@/test/fixtures'
import { Locale, PaymentPlanWidgetOptions } from '@/types'

/**
 * These stories mount the widget through the public API, as a merchant page does. They import
 * nothing from the widget internals, so they keep working when the implementation changes, and
 * Chromatic compares the new rendering with the snapshots accepted before.
 */

type Options = Omit<PaymentPlanWidgetOptions, 'container'>

const CONTAINER_ID = 'alma-widget'

/** Waits until the eligibility request has settled and the widget shows its final state. */
const waitForEligibility = ({ canvasElement }: StoryContext) =>
  waitFor(() => {
    if (canvasElement.querySelector('[data-testid="loader"]')) throw new Error('Still loading')
  })

const meta = {
  title: 'Widgets/PaymentPlans',
  args: {
    purchaseAmount: 45000,
    locale: Locale.fr,
    // A widget that cycles through its plans never looks the same twice
    transitionDelay: -1,
  },
  render: (args) => {
    const container = document.createElement('div')
    container.id = CONTAINER_ID
    // add() looks the container up in the page, and Storybook inserts the container right after
    // render returns
    queueMicrotask(() =>
      Widgets.initialize('merchant_storybook', ApiMode.TEST).add(Widgets.PaymentPlans, {
        ...args,
        container: `#${CONTAINER_ID}`,
      }),
    )
    return container
  },
} satisfies Meta<Options>

export default meta

type Story = StoryObj<Options>

export const Loading: Story = {
  parameters: { msw: { handlers: [eligibilityPending()] } },
}

export const AllPlansEligible: Story = {
  parameters: { msw: { handlers: [eligibilityPlans(mockPlansAllEligible)] } },
  play: waitForEligibility,
}
