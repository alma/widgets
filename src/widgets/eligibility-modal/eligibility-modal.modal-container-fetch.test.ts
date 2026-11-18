import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import type { ModalOptions } from '@/public-api/public-api.types'
import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { useFakeMatchMedia } from '@/test/match-media'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'
import { desktopMediaQuery } from '@/widgets/eligibility-modal/eligibility-modal.const'

// Master renders ModalContainer with a mocked fetchFromApi. Here the modal opens through add(Modal),
// and the request, the cache, the filter and the sort run.
const renderModalContainer = async (options: Partial<ModalOptions> = {}) => {
  server.use(eligibilityPlans(mockButtonPlans))
  const { handle } = await mountWidget('Modal', {
    clickableSelector: '',
    purchaseAmount: 40000,
    onClose: () => {
      // eslint-disable-next-line no-console
      console.log('modal closed')
    },
    ...options,
  })
  handle?.open()
  // Master's mocked fetch resolved before the first query.
  await vi.waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
}

describe('ModalContainer', () => {
  describe('test responsiveness', () => {
    useFakeMatchMedia([desktopMediaQuery])

    const setup = async () => {
      await renderModalContainer()
      await screen.findByTestId('modal-close-button')
    }
    beforeEach(async () => {
      await setup()
    })

    it('should display the payments plans provided in eligibility', () => {
      expect(screen.getByText('M+1')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
    })
  })

  describe('No plans provided', () => {
    const setup = async () => {
      await renderModalContainer()
      await screen.findByTestId('modal-close-button')
    }
    beforeEach(async () => {
      await setup()
    })

    it('should display the payments plans provided in eligibility', () => {
      expect(screen.getByText('M+1')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
      expect(screen.getByText('3x')).toBeInTheDocument()
      expect(screen.getByText('4x')).toBeInTheDocument()
      expect(screen.getByText('10x')).toBeInTheDocument()
    })

    it('should display the first payment plans when initially opened', () => {
      const element = screen.getByTestId('modal-container')
      expect(element).toHaveTextContent(
        'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.',
      )
      expect(element).toHaveTextContent('Total450,00 €')
      expect(element).toHaveTextContent('Dont coût du crédit (TTC)0,00 €')
      expect(element).toHaveTextContent('1 janvier 2022')
    })

    it('should display the schedule for the selected payment plan', async () => {
      await userEvent.click(screen.getByText('4x'))

      const installmentElement = screen.getByTestId('modal-container')
      const totalElement = screen.getByTestId('modal-summary')
      const expectedInstallments = [
        "Aujourd'hui",
        '123,12 €',
        '1 janvier 2022',
        '112,50 €',
        '1 février 2022',
        '112,50 €',
        '1 mars 2022',
        '112,50 €',
      ]
      const expectedTotal = ['Total', '460,62 €', 'Dont coût du crédit (TTC)', '10,62 €']

      expect(installmentElement).toHaveTextContent(expectedInstallments.join(''))
      expect(totalElement).toHaveTextContent(expectedTotal.join(''))
    })
  })

  describe('No eligibility', () => {
    it('should display error message', async () => {
      await renderModalContainer({ plans: [] })
      await screen.findByTestId('modal-close-button')
      const element = screen.getByTestId('modal-container')
      expect(element).toHaveTextContent(
        "Oups, il semblerait que la simulation n'ait pas fonctionné.",
      )
    })
  })

  describe('Only one plan', () => {
    it('should display the schedule for the selected payment plan', async () => {
      await renderModalContainer({
        plans: [
          {
            installmentsCount: 3,
            minAmount: 5000,
            maxAmount: 200000,
          },
        ],
      })
      await screen.findByTestId('modal-close-button')
      const installmentElement = screen.getByTestId('modal-container')
      const totalElement = screen.getByTestId('modal-summary')
      const expectedInstallments = [
        "Aujourd'hui",
        '151,35 €',
        '1 janvier 2022',
        '150,00 €',
        '1 février 2022',
        '150,00 €',
      ]
      const expectedTotal = ['Total', '451,35 €', 'Dont coût du crédit (TTC)', '1,35 €']

      expect(installmentElement).toHaveTextContent(expectedInstallments.join(''))
      expect(totalElement).toHaveTextContent(expectedTotal.join(''))
    })
  })
})
