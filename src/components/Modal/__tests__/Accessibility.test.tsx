import React from 'react'

import { axe } from 'jest-axe'
import { screen } from '@testing-library/react'

import render from '@/test'
import Modal from 'components/Modal'

describe('Modal Accessibility Tests', () => {
  it('should not have any accessibility violations when closed', async () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal content</div>
      </Modal>,
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have any accessibility violations when open', async () => {
    const { container } = render(
      <Modal isOpen onClose={() => {}}>
        <div>Modal content</div>
      </Modal>,
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper aria attributes when open', async () => {
    const { container } = render(
      <Modal isOpen onClose={() => {}}>
        <div>
          <h2>Modal Title</h2>
          <p>Some modal content</p>
          <button type="button">Close</button>
        </div>
      </Modal>,
    )

    // Check that the modal has proper aria attributes
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument()

    // Check that no accessibility violations are detected
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
