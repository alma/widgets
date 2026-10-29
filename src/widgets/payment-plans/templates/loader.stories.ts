import type { Meta, StoryObj } from '@storybook/web-components-vite'

import {
  loaderTemplate,
  type LoaderParams,
} from '@/widgets/payment-plans/templates/loader.template'

const meta: Meta<LoaderParams> = {
  render: (args) => loaderTemplate(args),
}

export default meta

export const Default: StoryObj<LoaderParams> = {}
