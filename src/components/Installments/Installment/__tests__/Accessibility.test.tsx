import React from 'react'

import { axe } from 'jest-axe'

import render from '@/test'
import Installment from 'components/Installments/Installment'

describe('Installment Accessibility Tests', () => {
  const mockInstallment = {
    due_date: 1640995200, // 01/01/2022
    customer_fee: 0,
    customer_interest: 0,
    purchase_amount: 5000,
    total_amount: 5000,
  }

  it('should not have any accessibility violations', async () => {
    const { container } = render(<Installment installment={mockInstallment} index={0} />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper semantic structure', async () => {
    const { container } = render(<Installment installment={mockInstallment} index={0} />)

    // Vérifier la structure sémantique
    const installmentElement = container.firstChild
    expect(installmentElement).toBeInTheDocument()

    // Vérifier que le contenu est lisible (format français)
    expect(container).toHaveTextContent('50,00')
    expect(container).toHaveTextContent('1 janvier 2022')

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should handle installment with fees', async () => {
    const installmentWithFee = {
      due_date: 1640995200,
      customer_fee: 100,
      customer_interest: 0,
      purchase_amount: 5000,
      total_amount: 5100,
    }

    const { container } = render(<Installment installment={installmentWithFee} index={1} />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should be accessible for screen readers', async () => {
    const { container } = render(<Installment installment={mockInstallment} index={0} />)

    // Vérifier qu'il n'y a pas de problèmes de couleur/contraste
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })
})
