import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

import { createIntl } from '@/shared/i18n/create-intl'
import { mockDeferredMultiInstallmentPlanWithFees } from '@/test/fixtures'
import { warningMessageTemplate } from '@/widgets/eligibility-modal/templates/schedule/warning-message.template'

interface WarningMessageArgs {
  country: string
}

const meta: Meta<WarningMessageArgs> = {
  render: ({ country }, { globals }) => {
    const plan = mockDeferredMultiInstallmentPlanWithFees
    const intl = createIntl(globals.locale)
    // Storybook can't render `nothing` on its own.
    return html`${warningMessageTemplate({ currentPlan: plan.withCountry(country), intl })}`
  },
  parameters: { modalContainer: true },
}

export default meta

type Story = StoryObj<WarningMessageArgs>

export const France: Story = { args: { country: 'FR' } }

export const Luxembourg: Story = { args: { country: 'LU' } }

export const Belgium: Story = { args: { country: 'BE' } }

export const Netherlands: Story = { args: { country: 'NL' } }

export const Italy: Story = { args: { country: 'IT' } }

export const Germany: Story = { args: { country: 'DE' } }

export const Portugal: Story = { args: { country: 'PT' } }

export const Spain: Story = { args: { country: 'ES' } }

export const UnitedKingdomGb: Story = { args: { country: 'GB' } }

// Master renders nothing for a country without an approved sentence.
export const UnmappedCountry: Story = { args: { country: 'ZZ' } }
