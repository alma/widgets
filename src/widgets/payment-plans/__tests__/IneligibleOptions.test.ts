import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockEligibilityPaymentPlanWithIneligiblePlan } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

const animationDuration = 5600

describe('PaymentPlan has ineligible options from configPlans', () => {
  let host: HTMLElement | null

  const setup = async () => {
    server.use(eligibilityPlans(mockEligibilityPaymentPlanWithIneligiblePlan))
    ;({ host } = await mountWidget('PaymentPlans', {
      purchaseAmount: 45000,
      plans: [
        {
          installmentsCount: 1,
          deferredDays: 30,
          minAmount: 5000,
          maxAmount: 70000,
        },
        {
          installmentsCount: 2,
          minAmount: 5000,
          maxAmount: 50000,
        },
        {
          installmentsCount: 4,
          minAmount: 5000,
          maxAmount: 15000,
        },
        {
          installmentsCount: 8,
          minAmount: 5000,
          maxAmount: 50000,
        },
      ],
    }))
    await screen.findByTestId('widget-container')
  }

  beforeEach(async () => {
    vi.useFakeTimers()
    await setup()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays only provided plans (except p1x)', () => {
    expect(screen.getByText('J+30')).toBeInTheDocument()
    expect(screen.getByText('4x')).toBeInTheDocument()
    expect(screen.queryByText('1x')).not.toBeInTheDocument()
  })

  it('does not display plan that are not part of eligibility', () => {
    expect(screen.queryByText('8x')).not.toBeInTheDocument()
  })

  it('only iterates over active plans', async () => {
    expect(
      screen.getByText('450,00 € à payer le 31 décembre 2021 (sans frais)'),
    ).toBeInTheDocument()
    vi.advanceTimersByTime(animationDuration)
    await (host as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete
    expect(screen.getByText('2 x 225,00 € (sans frais)')).toBeInTheDocument()
  })

  it('display conditions when inactive plans are hovered', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    await user.hover(screen.getByText('4x'))
    expect(screen.getByText("Jusqu'à 150,00 €")).toBeInTheDocument()
  })
})

describe('PaymentPlan has ineligible options from merchant config', () => {
  const setup = async () => {
    server.use(eligibilityPlans(mockEligibilityPaymentPlanWithIneligiblePlan))
    await mountWidget('PaymentPlans', {
      purchaseAmount: 45000,
      plans: [
        {
          installmentsCount: 4,
          minAmount: 30000,
          maxAmount: 400000,
        },
        {
          installmentsCount: 10,
          minAmount: 5000,
          maxAmount: 50000,
        },
      ],
    })
    await screen.findByTestId('widget-container')
  }
  beforeEach(async () => {
    await setup()
  })

  it('display conditions when non eligible plans are hovered', async () => {
    const user = userEvent.setup()

    await user.hover(screen.getByText('10x'))
    expect(screen.getByText('À partir de 900,00 €')).toBeInTheDocument()
    await user.hover(screen.getByText('4x'))
    expect(screen.getByText("Jusqu'à 200,00 €")).toBeInTheDocument()
  })
})
