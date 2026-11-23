import { screen } from '@testing-library/dom'

import type { PaymentPlanWidgetOptions } from '@/public-api/public-api.types'
import { mockButtonPlans } from '@/test/fixtures/plans'
import { eligibilityPlans } from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { mountWidget } from '@/test/utils/mount-widget'

const animationDuration = 5600

let host: HTMLElement & { updateComplete?: Promise<boolean> }

const renderWidget = async (options: Omit<PaymentPlanWidgetOptions, 'container'>) => {
  const mounted = await mountWidget('PaymentPlans', options)
  host = mounted.host!
  await vi.waitFor(() => screen.getByTestId('widget-container'))
}

const advance = async (ms: number) => {
  vi.advanceTimersByTime(ms)
  await host.updateComplete
}

beforeEach(() => {
  server.use(eligibilityPlans(mockButtonPlans))
  // msw answers through promises, so only the timers are fake.
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PaymentPlan has suggestedPaymentPlan', () => {
  describe('as an array', () => {
    it('should not rotate the active installment', async () => {
      await renderWidget({ purchaseAmount: 40000, suggestedPaymentPlan: [3, 2] })

      expect(screen.getByText('3x').className).toContain('active')

      await advance(animationDuration)

      const activeElements = screen
        .getAllByRole('option')
        .filter((el) => el.className.includes('active'))
      expect(activeElements).toHaveLength(1)
    })
  })

  describe('with a different transitionDelay', () => {
    it('displays the message corresponding to the payment plan hovered', async () => {
      await renderWidget({
        purchaseAmount: 40000,
        transitionDelay: 1000,
        suggestedPaymentPlan: [2],
      })

      expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
      expect(screen.getByText('2x').className).toContain('active')
      await advance(1000)
      expect(screen.getByText('3x').className).toContain('active')
    })
  })
})
