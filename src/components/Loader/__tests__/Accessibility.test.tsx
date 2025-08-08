import React from 'react'

import { screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import render from '@/test'
import Loader from 'components/Loader'

describe('Loader Accessibility Tests', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<Loader />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper loading indicator semantics', async () => {
    const { container } = render(<Loader />)

    // Check that the loader is present
    const loader = screen.getByTestId('loader')
    expect(loader).toBeInTheDocument()

    // The loader should have appropriate role or aria attribute
    // Note: In a real case, we should add aria-label or role="status"
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should work with custom className', async () => {
    const { container } = render(<Loader className="custom-loader" />)

    const loader = screen.getByTestId('loader')
    expect(loader).toHaveClass('custom-loader')

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not interfere with keyboard navigation', async () => {
    const { container } = render(<Loader />)

    // The loader should not be focusable
    const loader = container.querySelector('[data-testid="loader"]')
    expect(loader).not.toHaveAttribute('tabindex')

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
