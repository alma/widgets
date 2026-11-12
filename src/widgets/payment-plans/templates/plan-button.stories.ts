import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { fn } from 'storybook/test'

import { createIntl } from '@/shared/i18n/create-intl'
import { mockDisplayPlansSingle, mockP10XBelowMinDisplayPlan } from '@/test/fixtures'
import { paymentPlansMessages } from '@/widgets/payment-plans/payment-plans.messages'
import {
  type PlanButtonParams,
  planButtonTemplate,
} from '@/widgets/payment-plans/templates/plan-button.template'

const [p3x] = mockDisplayPlansSingle

const meta: Meta<PlanButtonParams> = {
  // An option needs its listbox, as in the widget.
  render: (args, { globals }) => {
    const intl = createIntl(globals.locale)
    const label = intl.formatMessage(paymentPlansMessages.listboxAriaLabel)
    return html`<div role="listbox" aria-label=${label}>${planButtonTemplate(args, intl)}</div>`
  },
  args: {
    plan: p3x,
    isCurrent: false,
    monochrome: true,
    onHover: fn(),
    onLeave: fn(),
    onKeyDown: fn(),
    onClick: fn(),
  },
}

export default meta

type Story = StoryObj<PlanButtonParams>

export const Eligible: Story = {}

export const Current: Story = { args: { isCurrent: true } }

export const CurrentNotMonochrome: Story = { args: { isCurrent: true, monochrome: false } }

export const NotEligible: Story = { args: { plan: mockP10XBelowMinDisplayPlan } }

export const CurrentNotEligible: Story = {
  args: { plan: mockP10XBelowMinDisplayPlan, isCurrent: true },
}
