import { screen } from '@testing-library/dom'

import type { ConfigPlan } from '@/domain/plans'
import type { PaymentPlanWidgetOptions } from '@/public-api/public-api.types'
import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { configPlans, mockButtonPlans } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

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
  describe('as a number', () => {
    const renderPlans = (suggestedPlan: number, plans?: ConfigPlan[]) =>
      renderWidget({ purchaseAmount: 40000, suggestedPaymentPlan: suggestedPlan, plans })

    it('displays the message corresponding to the payment plan hovered', async () => {
      await renderPlans(2)
      expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
      expect(screen.getByText('2x').className).toContain('active')
    })
    it('should target the P1X and not a PayLater plan when suggested plan is 1', async () => {
      // specify all plans explicitly to display P1X. P1X is only displayed if provided in configPlans.
      await renderPlans(1, configPlans)
      expect(screen.getByText(/Payer maintenant 450,00 €/)).toBeInTheDocument()
      expect(screen.getByText('Payer maintenant').className).toContain('active')
    })
  })

  describe('as an array', () => {
    it('displays the third item as selected', async () => {
      await renderWidget({ purchaseAmount: 40000, suggestedPaymentPlan: [3, 2] })

      expect(screen.getByText(/151,35 € puis 2 x 150,00 €/)).toBeInTheDocument()
      expect(screen.getByText('3x').className).toContain('active')
    })

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

  describe('as an array with first item being illegible', () => {
    it('displays the 3x as active (2 is illegible)', async () => {
      await renderWidget({
        purchaseAmount: 40000,
        plans: [
          {
            installmentsCount: 1,
            minAmount: 5000,
            maxAmount: 20000,
          },
          {
            installmentsCount: 2,
            minAmount: 0,
            maxAmount: 0,
          },
          {
            installmentsCount: 1,
            deferredDays: 30,
            minAmount: 50000,
            maxAmount: 70000,
          },
          {
            installmentsCount: 3,
            minAmount: 5000,
            maxAmount: 50000,
          },
          {
            installmentsCount: 8,
            minAmount: 5000,
            maxAmount: 50000,
          },
        ],
        suggestedPaymentPlan: [2, 3],
      })

      expect(screen.getByText(/151,35 € puis 2 x 150,00 €/)).toBeInTheDocument()
      expect(screen.getByText('3x').className).toContain('active')
    })
  })

  describe('with a wrong value', () => {
    it('should select the first installment', async () => {
      await renderWidget({ purchaseAmount: 40000, suggestedPaymentPlan: [20] })

      expect(screen.getByText(/450,00 € à payer le 1 janvier 2022/)).toBeInTheDocument()
      expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
      expect(screen.getByText('M+1').className).toContain('active')
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
