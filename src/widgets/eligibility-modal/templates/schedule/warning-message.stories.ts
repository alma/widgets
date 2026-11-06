import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

import { createIntl } from '@/shared/i18n/create-intl'
import {
  mockDeferredMultiInstallmentPlanWithFees,
  mockDeferredMultiInstallmentPlanWithoutFees,
} from '@/test/fixtures'
import { warningMessageTemplate } from '@/widgets/eligibility-modal/templates/schedule/warning-message.template'

interface WarningMessageArgs {
  country: string
  withFees: boolean
}

const meta: Meta<WarningMessageArgs> = {
  render: ({ country, withFees }, { globals }) => {
    const plan = withFees
      ? mockDeferredMultiInstallmentPlanWithFees
      : mockDeferredMultiInstallmentPlanWithoutFees
    const intl = createIntl(globals.locale)
    // Storybook can't render `nothing` on its own.
    return html`${warningMessageTemplate({ currentPlan: plan.withCountry(country), intl })}`
  },
  args: { withFees: true },
  parameters: { modalContainer: true },
}

export default meta

type Story = StoryObj<WarningMessageArgs>

export const France: Story = { args: { country: 'FR' } }

export const FranceWithoutFees: Story = { args: { country: 'FR', withFees: false } }

export const Luxembourg: Story = { args: { country: 'LU' } }

export const Belgium: Story = { args: { country: 'BE' } }

export const Netherlands: Story = { args: { country: 'NL' } }

export const Italy: Story = { args: { country: 'IT' } }

export const ItalyLowercase: Story = { args: { country: 'it' } }

export const Germany: Story = { args: { country: 'DE' } }

export const Portugal: Story = { args: { country: 'PT' } }

export const Spain: Story = { args: { country: 'ES' } }

export const UnitedKingdomGb: Story = { args: { country: 'GB' } }

// Not an ISO code, but master accepts it.
export const UnitedKingdomUk: Story = { args: { country: 'UK' } }

// Master renders nothing for a country without an approved sentence.
export const UnmappedCountry: Story = { args: { country: 'ZZ' } }
