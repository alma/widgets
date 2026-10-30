import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import { mastercardTemplate } from '@/shared/ui/icons/cards/mastercard.template'

const meta: Meta = {
  render: (_args, { globals }) => mastercardTemplate({ intl: createIntl(globals.locale) }),
}

export default meta

export const Mastercard: StoryObj = {}
