import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import type { EligibilityPlan } from '@/domain/plans/api/eligibility.types'
import { eligibilityPlans } from '@/test/eligibilityHandlers'
import {
  configPlans,
  mockP1XEligiblePlan,
  mockPlansAllEligible,
  mockPlansWithoutDeferred,
} from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

// Master passes initialPlanIndex, which add(Modal) doesn't take: a click on that plan stands for it.
// The merchant plans keep pay-now.
const renderEligibilityModal = async (plans: EligibilityPlan[], initialPlanIndex = 0) => {
  server.use(eligibilityPlans(plans))
  const { handle } = await mountWidget('Modal', {
    clickableSelector: '',
    purchaseAmount: 45000,
    plans: configPlans,
  })
  handle?.open()
  await vi.waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  if (initialPlanIndex > 0) {
    const planButtons = document.querySelectorAll<HTMLElement>('#payment-plans button')
    await userEvent.click(planButtons[initialPlanIndex])
  }
}

describe('plans provided', () => {
  describe('default behaviour', () => {
    const setup = async () => {
      // 1st plan is P1X. P1X has a specific wording so let's check the default wording on the 2nd plan
      await renderEligibilityModal(mockPlansAllEligible, 1)
      await screen.findByTestId('modal-close-button')
    }
    beforeEach(async () => {
      await setup()
    })

    it('should display the payments plans provided in eligibility', () => {
      expect(screen.getByTestId('modal-title-element')).toHaveTextContent(
        'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.',
      )
      expect(screen.getByTestId('modal-info-element')).toHaveTextContent(
        'Choisissez Alma au moment du paiement.',
      )
      expect(screen.getByTestId('modal-info-element')).toHaveTextContent(
        'Laissez-vous guider et validez votre paiement en 2 minutes.',
      )
      expect(screen.getByTestId('modal-info-element')).toHaveTextContent(
        'Gardez le contrôle en avançant ou reculant vos échéances à votre rythme.',
      )
      expect(screen.getByText('Payer maintenant')).toBeInTheDocument()
      expect(screen.getByText('M+1')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
      expect(screen.getByText('3x')).toBeInTheDocument()
      expect(screen.getByText('4x')).toBeInTheDocument()
      expect(screen.getByText('10x')).toBeInTheDocument()
    })

    it('should display the first payment plans when initially opened', () => {
      const installmentElement = screen.getByTestId('modal-installments-element')
      expect(installmentElement).toHaveTextContent('450,00 €')
      expect(installmentElement).toHaveTextContent('0,00 €')
      // We set the initial index into the 2nd plan which is deferred_months: 1
      // So the installment will be paid in 1 month
      // Master's /1 janvier 2022/. The matcher types here take no RegExp, and a string also
      // matches a part of the text.
      expect(installmentElement).toHaveTextContent('1 janvier 2022')
      const totalElement = screen.getByTestId('modal-summary')
      expect(totalElement).toHaveTextContent('Total')
      expect(totalElement).toHaveTextContent('Dont coût du crédit (TTC)')
      expect(totalElement).toHaveTextContent('0,00 € (TAEG 0,00 %)')
    })
    it('should display the schedule for the selected payment plan', async () => {
      await userEvent.click(screen.getByText('4x'))
      const installmentElement = screen.getByTestId('modal-installments-element')

      expect(installmentElement).toHaveTextContent("Aujourd'hui")
      expect(installmentElement).toHaveTextContent('112,50 €')
      expect(installmentElement).toHaveTextContent('1 janvier 2022')
      expect(installmentElement).toHaveTextContent('112,50 €')
      expect(installmentElement).toHaveTextContent('1 février 2022')
      expect(installmentElement).toHaveTextContent('112,50 €')
      expect(installmentElement).toHaveTextContent('1 mars 2022')
      expect(installmentElement).toHaveTextContent('112,50 €')
      const totalElement = screen.getByTestId('modal-summary')
      expect(totalElement).toHaveTextContent('Total')
      expect(totalElement).toHaveTextContent('460,62 €')
    })
    it('should display legal disclosures when required', async () => {
      await userEvent.click(screen.getByText('10x'))
      const totalElement = screen.getByTestId('modal-summary')
      expect(totalElement).toHaveTextContent('Dont coût du crédit')
      expect(totalElement).toHaveTextContent('27,25 € (TAEG 17,20 %)')
      expect(
        screen.getByText("Attention ! Un crédit coûte de l'argent et doit être remboursé."),
      ).toBeInTheDocument()
      expect(screen.getByTestId('legal-mentions')).toBeInTheDocument()
    })
  })

  describe('P1X case', () => {
    const setup = async () => {
      // 1st plan is P1X
      await renderEligibilityModal([mockP1XEligiblePlan], 0)
      await screen.findByTestId('modal-close-button')
    }
    beforeEach(async () => {
      await setup()
    })

    it('should display the payments plans provided in eligibility', () => {
      expect(screen.getByTestId('modal-title-element')).toHaveTextContent(
        'Payez comptant par carte bancaire avec Alma.',
      )
      expect(screen.getByTestId('modal-info-element')).toHaveTextContent(
        'Choisissez Alma - Payer maintenant au moment du paiement.',
      )
      expect(screen.getByTestId('modal-info-element')).toHaveTextContent(
        'Renseignez les informations de votre carte bancaire.',
      )
      expect(screen.getByTestId('modal-info-element')).toHaveTextContent(
        'La validation de votre paiement est instantanée !',
      )
    })
    it('should display the first payment plans when initially opened', () => {
      const installmentElement = screen.getByTestId('modal-installments-element')
      expect(installmentElement).toHaveTextContent('450,00 €')
      expect(installmentElement).toHaveTextContent('0,00 €')
      expect(installmentElement).toHaveTextContent("Aujourd'hui")
      const totalElement = screen.getByTestId('modal-summary')
      expect(totalElement).toHaveTextContent('Total')
      expect(totalElement).toHaveTextContent('Dont frais (TTC)')
      expect(totalElement).toHaveTextContent('0,00 €')
    })
  })

  describe('No deferred plan provided', () => {
    it('should display a different title', async () => {
      await renderEligibilityModal(mockPlansWithoutDeferred)
      expect(screen.getByTestId('modal-title-element')).toHaveTextContent(
        'Payez en plusieurs fois par carte bancaire avec Alma.',
      )
    })
  })

  describe('plans and initial index provided', () => {
    it('should open with the correct plan selected', async () => {
      await renderEligibilityModal(mockPlansAllEligible, 3)
      const installmentElement = screen.getByTestId('modal-installments-element')
      expect(installmentElement).toHaveTextContent("Aujourd'hui")
      expect(installmentElement).toHaveTextContent('150,00 €')
      expect(installmentElement).toHaveTextContent('1 janvier 2022')
      expect(installmentElement).toHaveTextContent('150,00 €')
      expect(installmentElement).toHaveTextContent('1 février 2022')
      expect(installmentElement).toHaveTextContent('150,00 €')
      const totalElement = screen.getByTestId('modal-summary')
      expect(totalElement).toHaveTextContent('Total')
      expect(totalElement).toHaveTextContent('451,35 €')
      expect(totalElement).toHaveTextContent('Dont coût du crédit (TTC)')
      expect(totalElement).toHaveTextContent('1,35 € (TAEG 1,80 %)')
    })
  })
})
