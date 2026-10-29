import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { loadingIndicatorTemplate } from '@/widgets/eligibility-modal/templates/loading-indicator.template'

type Args = NonNullable<Parameters<typeof loadingIndicatorTemplate>[0]>

const meta: Meta<Args> = {
  render: (args) => loadingIndicatorTemplate(args),
  parameters: { modalContainer: true },
}

export default meta

export const Default: StoryObj<Args> = {}
