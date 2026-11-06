import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'
import { AsyncDirective } from 'lit/async-directive.js'
import { directive } from 'lit/directive.js'
import { fn } from 'storybook/test'

import { statusResponse } from '@/domain/plans/api/eligibility.const'
import { createIntl } from '@/shared/i18n/create-intl'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { mockCards, mockDisplayPlansAllEligible, mockDisplayPlansSingle } from '@/test/fixtures'
import { stubDateNow } from '@/test/story-stubs'
import {
  type ModalContentParams,
  modalContentTemplate,
} from '@/widgets/eligibility-modal/templates/modal-content.template'

type ModalContentArgs = Omit<ModalContentParams, 'intl'>

// Keeps the selected plan and re-renders its own part synchronously, so the plan buttons move
// focus after the render. No wrapper element: the shell's height: 100% must reach the modal
// container, or the schedule can't scroll.
class InteractiveModalContent extends AsyncDirective {
  render(args: ModalContentArgs, intl: IntlShape) {
    return this.templateAt(args.currentPlanIndex, args, intl)
  }

  private templateAt(currentPlanIndex: number, args: ModalContentArgs, intl: IntlShape) {
    const setCurrentPlanIndex = (index: number) => {
      void args.setCurrentPlanIndex(index)
      this.setValue(this.templateAt(index, args, intl))
    }
    return modalContentTemplate({ ...args, currentPlanIndex, setCurrentPlanIndex, intl })
  }
}

const interactiveModalContent = directive(InteractiveModalContent)

const meta: Meta<ModalContentArgs> = {
  render: (args, { globals }) => html`${interactiveModalContent(args, createIntl(globals.locale))}`,
  beforeEach: () => stubDateNow(),
  parameters: { modalContainer: 'frame' },
  globals: { viewport: { value: 'desktop' } },
  args: {
    // Without pay-now, so the first plan is deferred.
    eligiblePlans: mockDisplayPlansAllEligible.slice(1),
    isSomePlanDeferred: true,
    status: statusResponse.SUCCESS,
    currentPlanIndex: 0,
    setCurrentPlanIndex: fn(),
    isBigScreen: true,
    cards: mockCards,
    onClose: fn(),
  },
}

export default meta

type Story = StoryObj<ModalContentArgs>

export const Pending: Story = {
  args: { eligiblePlans: [], isSomePlanDeferred: false, status: statusResponse.PENDING },
}

export const SeveralPlans: Story = {}

export const OnePlan: Story = {
  args: { eligiblePlans: mockDisplayPlansSingle, isSomePlanDeferred: false },
}

export const P1XSelected: Story = {
  args: { eligiblePlans: mockDisplayPlansAllEligible, currentPlanIndex: 0 },
}

export const CreditSelected: Story = {
  args: { eligiblePlans: mockDisplayPlansAllEligible, currentPlanIndex: 5 },
}

export const NoEligiblePlan: Story = {
  args: { eligiblePlans: [], isSomePlanDeferred: false },
}

export const Failed: Story = {
  args: { eligiblePlans: [], isSomePlanDeferred: false, status: statusResponse.FAILED },
}

export const SeveralPlansMobile: Story = {
  args: { isBigScreen: false },
  globals: { viewport: { value: 'mobile' } },
}
