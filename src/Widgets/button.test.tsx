import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import { mockButtonPlans } from 'test/fixtures'
import render from '../test'
import PaymentPlanWidget from './PaymentPlan'

jest.mock('utils/fetch', () => {
  return {
    fetchFromApi: async () => mockButtonPlans,
  }
})

const animationDuration = 5500
jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime())
describe('Button', () => {
  describe('Basics', () => {
    beforeEach(async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })
    it('displays the button', () => {
      expect(screen.getByTestId('widget-button')).toBeInTheDocument()
    })
    it('Opens the modal on click', async () => {
      act(() => {
        fireEvent.click(screen.getByTestId('widget-button'))
      })
      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    })
  })

  describe('No plans provided', () => {
    beforeEach(async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })
    it('displays all available payment plans', () => {
      expect(screen.getByText('3x')).toBeInTheDocument()
      expect(screen.getByText('4x')).toBeInTheDocument()
    })
    it(`display iterates on each message every ${animationDuration} ms then returns to the beginning`, () => {
      expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
      expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
      expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText('124,52 € puis 3 x 112,50 €')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText(/47,73 € puis 9 x 47,66 €/)).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
      expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    })
  })
  describe('paymentPlan includes credit', () => {
    beforeEach(async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          configPlans={[
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
          ]}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })
    it('displays the message corresponding to the payment plan hovered', () => {
      expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
      expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
      act(() => {
        fireEvent.mouseEnter(screen.getByText('3x'))
      })
      expect(screen.getByText(/151,35 € puis 2 x 150,00 €/)).toBeInTheDocument()
      act(() => {
        fireEvent.mouseEnter(screen.getByText('10x'))
      })
      expect(screen.getByText(/47,73 € puis 9 x 47,66 €/)).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
    })
    it('Stops iterating when a element has been hovered', () => {
      act(() => {
        fireEvent.mouseEnter(screen.getByText('3x'))
      })
      expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
    })
  })
  describe('paymentPlan includes contains ineligible options', () => {
    beforeEach(async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          configPlans={[
            {
              installmentsCount: 1,
              minAmount: 5000,
              maxAmount: 20000,
            },
            {
              installmentsCount: 2,
              minAmount: 5000,
              maxAmount: 20000,
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
          ]}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })
    it('Displays only provided plans (except p1x)', () => {
      expect(screen.getByText('J+30')).toBeInTheDocument()
      expect(screen.getByText('3x')).toBeInTheDocument()
      expect(screen.queryByText('1x')).not.toBeInTheDocument()
    })
    it('does not display plan that are not part of eligibility', () => {
      expect(screen.queryByText('8x')).not.toBeInTheDocument()
    })
    it('Only iterates over active plans', () => {
      expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(animationDuration)
      })
      expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
    })
    it('display conditions when inactive plans are hovered', () => {
      act(() => {
        fireEvent.mouseEnter(screen.getByText('J+30'))
      })
      expect(screen.getByText('À partir de 500,00 €')).toBeInTheDocument()
      act(() => {
        fireEvent.mouseEnter(screen.getByText('2x'))
      })
      expect(screen.getByText("Jusqu'à 200,00 €")).toBeInTheDocument()
    })
  })
  describe('custom transition delay', () => {
    beforeEach(async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          transitionDelay={500}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    })
    it(`display iterates on each message every 500 ms then returns to the beginning`, () => {
      expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
      expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
      expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(screen.getByText('124,52 € puis 3 x 112,50 €')).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(screen.getByText(/47,73 € puis 9 x 47,66 €/)).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
      expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
    })
  })
  describe('hide if not applicable', () => {
    it('hides if hideIfNotEligible is true', async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          hideIfNotEligible={true}
          configPlans={[
            {
              installmentsCount: 1,
              minAmount: 100,
              maxAmount: 100000,
            },
          ]}
        />,
      )
      await waitFor(() => expect(screen.queryByTestId('widget-button')).not.toBeInTheDocument())
    })
    it('hides if hideIfNotEligible is not specified', async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          configPlans={[
            {
              installmentsCount: 1,
              minAmount: 100,
              maxAmount: 100000,
            },
          ]}
        />,
      )
      await waitFor(() => expect(screen.queryByTestId('widget-button')).not.toBeInTheDocument())
    })
    it('hides if there is no plan', async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          configPlans={[]}
        />,
      )
      await waitFor(() => expect(screen.queryByTestId('widget-button')).not.toBeInTheDocument())
    })
  })
  describe('the modal initializes with the correct plan', () => {
    it('initializes correctly after hovering a plan', async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
      act(() => {
        fireEvent.mouseEnter(screen.getByText('3x'))
      })
      expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
      act(() => {
        fireEvent.click(screen.getByTestId('widget-button'))
      })
      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
      const modalContainer = screen.getByTestId('modal-container')
      expect(within(modalContainer).getByText('3x')).toBeInTheDocument()
      expect(within(modalContainer).getByText('21 octobre 2021')).toBeInTheDocument()
      expect(within(modalContainer).getByText('151,35 €')).toBeInTheDocument()
      expect(within(modalContainer).getByText('21 novembre 2021')).toBeInTheDocument()
      expect(within(modalContainer).getByText('21 décembre 2021')).toBeInTheDocument()
      expect(within(modalContainer).getAllByText('150,00 €')).toHaveLength(2)
    })
    it('initializes correctly after clicking a plan (fallback for mobile)', async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
      act(() => {
        fireEvent.click(screen.getByText('3x'))
      })
      expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
      const modalContainer = screen.getByTestId('modal-container')
      expect(within(modalContainer).getByText('21 octobre 2021')).toBeInTheDocument()
      expect(within(modalContainer).getByText('151,35 €')).toBeInTheDocument()
      expect(within(modalContainer).getByText('21 novembre 2021')).toBeInTheDocument()
      expect(within(modalContainer).getByText('21 décembre 2021')).toBeInTheDocument()
      expect(within(modalContainer).getAllByText('150,00 €')).toHaveLength(2)
    })
    it('initializes correctly after a simple click on the badge, with no hover or click on a specific plan', async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
      act(() => {
        fireEvent.click(screen.getByTestId('widget-button'))
      })
      expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
      expect(screen.getByText(/(sans frais)/)).toBeInTheDocument()
      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
      const modalContainer = screen.getByTestId('modal-container')
      expect(within(modalContainer).getByText('21 novembre 2021')).toBeInTheDocument()
      expect(within(modalContainer).getAllByText('450,00 €')).toHaveLength(2)
    })
  })
})
