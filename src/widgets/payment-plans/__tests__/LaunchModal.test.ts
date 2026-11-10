import { screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

const KNOW_MORE_NAME = 'Ouvrir les options de paiement Alma pour en savoir plus'

const defaultRender = async (onModalClose?: () => void) => {
  await mountWidget('PaymentPlans', { purchaseAmount: 40000, onModalClose })
  await screen.findByTestId('widget-container')
}

const checkModalElements = (): void => {
  expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
  const modalContainer = screen.getByTestId('modal-container')
  expect(within(modalContainer).getByText('3x')).toBeInTheDocument()
  expect(within(modalContainer).getByText("Aujourd'hui")).toBeInTheDocument()
  expect(within(modalContainer).getByText('1 janvier 2022')).toBeInTheDocument()
  expect(within(modalContainer).getByText('1 février 2022')).toBeInTheDocument()
  expect(within(modalContainer).getAllByText('150,00 €')).toHaveLength(2)
}

describe('Modal initializes with the correct plan', () => {
  beforeEach(() => {
    server.use(eligibilityPlans(mockButtonPlans))
  })

  it('after hovering a plan', async () => {
    await defaultRender()

    await userEvent.hover(screen.getByText('3x'))

    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: KNOW_MORE_NAME }))

    checkModalElements()
  })

  it('after clicking a plan (fallback for mobile)', async () => {
    await defaultRender()

    await userEvent.hover(screen.getByText('3x'))

    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()

    await userEvent.click(screen.getByText('3x'))

    checkModalElements()
  })

  it('after a simple click on the badge, with no hover or click on a specific plan', async () => {
    await defaultRender()

    await userEvent.click(screen.getByRole('button', { name: KNOW_MORE_NAME }))

    expect(screen.getByText(/450,00 € à payer le 1 janvier 2022/)).toBeInTheDocument()
    expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    const modalContainer = screen.getByTestId('modal-container')
    expect(within(modalContainer).getByText('1 janvier 2022')).toBeInTheDocument()
    expect(within(modalContainer).getAllByText('450,00 €')).toHaveLength(2)
  })

  it('should call onModalClose on close', async () => {
    const onModalClose = vi.fn()
    await defaultRender(onModalClose)

    await userEvent.click(screen.getByRole('button', { name: KNOW_MORE_NAME }))

    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('modal-close-button'))

    expect(onModalClose).toHaveBeenCalledTimes(1)
  })
})
