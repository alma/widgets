import type { Meta, StoryObj } from '@storybook/web-components-vite'

import { crossTemplate, type CrossParams } from '@/shared/ui/icons/cross.template'

const meta: Meta<CrossParams> = {
  render: (args) => crossTemplate(args),
}

export default meta

type Story = StoryObj<CrossParams>

export const Dark: Story = {
  parameters: {
    backgrounds: { options: { dark: { name: 'Dark', value: '#1a1a1a' } } },
  },
  globals: { backgrounds: { value: 'dark' } },
}

export const Light: Story = {
  args: { color: 'var(--off-black)' },
}
