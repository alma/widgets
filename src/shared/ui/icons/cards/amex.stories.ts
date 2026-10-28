import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import { amexCardTemplate } from '@/shared/ui/icons/cards/amex.template'

const meta: Meta = {
  render: (_args, { globals }) => amexCardTemplate(createIntl(globals.locale)),
}

export default meta

export const Amex: StoryObj = {}
