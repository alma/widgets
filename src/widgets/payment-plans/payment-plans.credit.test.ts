import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

const animationDuration = 5600 // 5500 + Time for transition

describe('PaymentPlan has credit', () => {
  afterEach(() => {
    vi.useRealTimers()
  })
  const setUpTest = async () => {
    server.use(eligibilityPlans(mockButtonPlans))
    const { host } = await mountWidget('PaymentPlans', {
      purchaseAmount: 40000,
      plans: [
        {
          installmentsCount: 1,
          minAmount: 100,
          maxAmount: 100000,
        },
        {
          installmentsCount: 2,
          minAmount: 100,
          maxAmount: 100000,
        },
        {
          installmentsCount: 1,
          deferredDays: 30,
          minAmount: 100,
          maxAmount: 100000,
        },
        {
          installmentsCount: 3,
          minAmount: 100,
          maxAmount: 100000,
        },
        {
          installmentsCount: 10,
          minAmount: 100,
          maxAmount: 100000,
        },
      ],
    })
    await screen.findByTestId('widget-container')
    return host as HTMLElement & { updateComplete: Promise<boolean> }
  }

  it('displays the message corresponding to the payment plan hovered', async () => {
    await setUpTest()

    expect(screen.getByText(/Payer maintenant 450,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    await userEvent.hover(screen.getByText('3x'))
    expect(screen.getByText(/151,35 € puis 2 x 150,00 €/)).toBeInTheDocument()
    await userEvent.hover(screen.getByText('10x'))
    expect(screen.queryByText(/47,77 € puis 9 x 47,72 €/)).not.toBeInTheDocument()
    expect(screen.getByText(/Cliquez pour en savoir plus/)).toBeInTheDocument()
  })

  const infoLine = () => document.getElementById('payment-info-text') as HTMLElement

  it('shows only the know-more line, without the installment breakdown, for a credit plan', async () => {
    await setUpTest()

    await userEvent.hover(screen.getByText('10x'))

    expect(infoLine()).not.toHaveTextContent('47,77 € puis 9 x 47,72 €')
    expect(infoLine()).toHaveTextContent('Cliquez pour en savoir plus')
    expect(infoLine()).toHaveAttribute('role', 'button')
  })

  it('shows the know-more line for a P2X-P4X plan, which had none before', async () => {
    await setUpTest()

    await userEvent.hover(screen.getByText('3x'))

    expect(infoLine()).toHaveTextContent('151,35 € puis 2 x 150,00 €')
    expect(infoLine()).toHaveTextContent('Cliquez pour en savoir plus')
  })

  it('keeps the deferred wording and adds the know-more line for a deferred P1X plan', async () => {
    await setUpTest()

    await userEvent.hover(screen.getByText('M+1'))

    expect(infoLine()).toHaveTextContent('450,00 € à payer le 1 janvier 2022')
    expect(infoLine()).toHaveTextContent('Cliquez pour en savoir plus')
    expect(infoLine()).toHaveAttribute('role', 'button')
  })

  it('leaves a non-deferred P1X plan with a single, non-clickable line', async () => {
    await setUpTest()

    await userEvent.hover(screen.getByText('Payer maintenant'))

    expect(infoLine()).toHaveTextContent('Payer maintenant 450,00 €')
    expect(infoLine()).not.toHaveTextContent('Cliquez pour en savoir plus')
    expect(infoLine()).not.toHaveAttribute('role', 'button')
  })

  it('stops iterating when an element has been hovered', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    vi.useFakeTimers()
    const host = await setUpTest()

    await user.hover(screen.getByText('3x'))

    await screen.findByText('151,35 € puis 2 x 150,00 €')

    vi.advanceTimersByTime(animationDuration)
    await host.updateComplete

    await screen.findByText('151,35 € puis 2 x 150,00 €') // Does not change
  })
})
