import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import { visaTemplate } from '@/shared/ui/icons/cards/visa.template'

const meta: Meta = {
  render: (_args, { globals }) => visaTemplate({ intl: createIntl(globals.locale) }),
}

export default meta

export const Visa: StoryObj = {}
