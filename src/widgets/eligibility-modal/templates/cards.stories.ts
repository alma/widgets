import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import type { Card } from '@/shared/ui/icons/cards/cards.types'
import { mockCards } from '@/test/fixtures'
import {
  type CardsParams,
  cardsTemplate,
} from '@/widgets/eligibility-modal/templates/cards.template'

type CardsArgs = Omit<CardsParams, 'intl'>

const meta: Meta<CardsArgs> = {
  render: (args, { globals }) => cardsTemplate({ ...args, intl: createIntl(globals.locale) }),
  args: { cards: mockCards },
  parameters: { modalContainer: true },
}

export default meta

type Story = StoryObj<CardsArgs>

export const AllCards: Story = {}

export const DuplicateCards: Story = { args: { cards: ['amex', 'cb', 'amex', 'cb'] } }

export const Empty: Story = { args: { cards: [] } }

// A merchant may pass any string. Master renders an empty div for it.
export const UnknownCard: Story = { args: { cards: ['visa', 'discover' as Card] } }
