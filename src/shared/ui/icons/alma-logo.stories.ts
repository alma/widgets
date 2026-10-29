import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { almaLogoTemplate, type AlmaLogoOptions } from '@/shared/ui/icons/alma-logo.template'

const meta: Meta<AlmaLogoOptions> = {
  render: (args) => almaLogoTemplate(args),
}

export default meta

type Story = StoryObj<AlmaLogoOptions>

export const Colored: Story = {}

export const Monochrome: Story = {
  args: { color: 'var(--off-black)' },
}
