import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

import { createIntl } from '@/shared/i18n/create-intl'
import type { IntlShape, MessageDescriptor } from '@/shared/i18n/i18n.types'
import { eligibilityModalMessages } from '@/widgets/eligibility-modal/eligibility-modal.messages'
import {
  type SkipLink,
  type SkipLinksParams,
  skipLinksTemplate,
} from '@/widgets/eligibility-modal/templates/skip-links.template'

type SkipLinksArgs = Omit<SkipLinksParams, 'intl' | 'skipLinks'> & { skipLinks?: SkipLink[] }

// The modal's three links, built as master's EligibilityModal builds them.
const modalSkipLinks = (intl: IntlShape): SkipLink[] => {
  const link = (href: string, message: MessageDescriptor) => ({
    href,
    labelId: message.id,
    defaultMessage: intl.formatMessage(message),
  })
  return [
    link('#payment-plans', eligibilityModalMessages.skipToPaymentPlans),
    link('#payment-info', eligibilityModalMessages.skipToPaymentInfo),
    link('#payment-schedule', eligibilityModalMessages.skipToPaymentSchedule),
  ]
}

const meta: Meta<SkipLinksArgs> = {
  render: ({ skipLinks, ...args }, { globals }) => {
    const intl = createIntl(globals.locale)
    const links = skipLinksTemplate({ ...args, skipLinks: skipLinks ?? modalSkipLinks(intl), intl })
    // Master's CSS keeps each link off-screen until it takes focus.
    const hint = html`<p>Click in this canvas, then press Tab to show each skip link.</p>`
    return html`${hint}${links}`
  },
  parameters: { modalContainer: true },
}

export default meta

type Story = StoryObj<SkipLinksArgs>

export const ModalLinks: Story = {}

export const Empty: Story = { args: { skipLinks: [] } }
