import { screen } from '@testing-library/dom'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { configPlans, mockButtonPlans } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

// The minimum transition delay in useButtonAnimation is 1000ms
const animationDuration = 1200

describe('Custom transition delay', () => {
  let host: HTMLElement & { updateComplete?: Promise<boolean> }

  const advance = async (ms: number) => {
    vi.advanceTimersByTime(ms)
    await host.updateComplete
  }

  const setup = async () => {
    server.use(eligibilityPlans(mockButtonPlans))
    // msw answers through promises, so only the timers are fake.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const mounted = await mountWidget('PaymentPlans', {
      purchaseAmount: 40000,
      transitionDelay: animationDuration,
      // specify all plans explicitly to display P1X. P1X is only displayed if provided in configPlans.
      plans: configPlans,
    })
    host = mounted.host!
    await vi.waitFor(() => screen.getByTestId('widget-container'))
  }
  beforeEach(async () => {
    await setup()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it(`iterates on each plan every ${animationDuration}ms then returns to the beginning`, async () => {
    expect(screen.getByText(/Payer maintenant 450,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    await advance(animationDuration)
    expect(screen.getByText(/450,00 € à payer le 1 janvier 2022/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    await advance(animationDuration)
    expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    await advance(animationDuration)
    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
    await advance(animationDuration)
    expect(screen.getByText('123,12 € puis 3 x 112,50 €')).toBeInTheDocument()
    await advance(animationDuration)
    expect(screen.getByText(/Cliquez pour en savoir plus/)).toBeInTheDocument()
    await advance(animationDuration)
    expect(screen.getByText(/Payer maintenant 450,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
  })
})
