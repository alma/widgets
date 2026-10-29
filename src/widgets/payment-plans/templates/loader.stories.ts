import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { loaderTemplate } from '@/widgets/payment-plans/templates/loader.template'

type Args = NonNullable<Parameters<typeof loaderTemplate>[0]>

const meta: Meta<Args> = {
  render: (args) => loaderTemplate(args),
}

export default meta

export const Default: StoryObj<Args> = {}
