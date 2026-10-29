import type { Meta, StoryObj } from '@storybook/web-components-vite'

import {
  loadingIndicatorTemplate,
  type LoadingIndicatorParams,
} from '@/widgets/eligibility-modal/templates/loading-indicator.template'

const meta: Meta<LoadingIndicatorParams> = {
  render: (args) => loadingIndicatorTemplate(args),
  parameters: { modalContainer: true },
}

export default meta

export const Default: StoryObj<LoadingIndicatorParams> = {}
