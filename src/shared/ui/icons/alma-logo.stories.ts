import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { almaLogoTemplate, type AlmaLogoParams } from '@/shared/ui/icons/alma-logo.template'

const meta: Meta<AlmaLogoParams> = {
  render: (args) => almaLogoTemplate(args),
}

export default meta

type Story = StoryObj<AlmaLogoParams>

export const Colored: Story = {}

export const Monochrome: Story = {
  args: { color: 'var(--off-black)' },
}
