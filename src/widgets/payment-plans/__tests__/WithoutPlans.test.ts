import { screen } from '@testing-library/dom'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { type MountedWidget, mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

const animationDuration = 5600

describe('No plans provided', () => {
  let mounted: MountedWidget

  const setUp = async () => {
    mounted = await mountWidget('PaymentPlans', {
      purchaseAmount: mockButtonPlans[0].purchase_amount,
    })
    await screen.findByTestId('widget-container')
  }
  beforeEach(async () => {
    // shouldAdvanceTime lets findBy poll while the clock is fake.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2020-01-01').getTime())
    server.use(eligibilityPlans(mockButtonPlans))
    await setUp()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays all available payment plans', () => {
    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.queryByText('Payer maintenant')).not.toBeInTheDocument() // By default P1X is filtered
    expect(screen.getByText('2x')).toBeInTheDocument()
    expect(screen.getByText('3x')).toBeInTheDocument()
    expect(screen.getByText('4x')).toBeInTheDocument()
    expect(screen.getByText('10x')).toBeInTheDocument()
  })

  it(`goes on next plan after ${animationDuration}ms`, async () => {
    expect(screen.getByText(/450,00 € à payer le 1 janvier 2022/)).toBeInTheDocument()
    expect(screen.getByText(/\(sans frais\)/)).toBeInTheDocument()
    vi.advanceTimersByTime(animationDuration)
    await (mounted.host as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete
    expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/\(sans frais\)/)).toBeInTheDocument()
  })
})
