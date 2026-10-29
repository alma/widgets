import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { createIntl } from '@/shared/i18n/create-intl'
import { cbTemplate } from '@/shared/ui/icons/cards/cb.template'

const meta: Meta = {
  render: (_args, { globals }) => cbTemplate(createIntl(globals.locale)),
}

export default meta

export const Cb: StoryObj = {}
