import { userEvent } from 'vitest/browser'

import styles from '@/widgets/payment-plans/templates/payment-plans.module.css'

// A placeholder until the modal's focus tests arrive. It checks what jsdom can't do.
describe('the browser project', () => {
  it('should apply the real CSS of a CSS module', () => {
    const button = document.createElement('button')
    button.className = styles.planButton
    document.body.append(button)

    expect(styles.planButton).not.toBe('planButton')
    expect(window.getComputedStyle(button).cursor).toBe('pointer')
    expect(button.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it('should move the focus with the Tab key', async () => {
    document.body.innerHTML =
      '<button type="button">First</button><button type="button">Second</button>'
    const [first, second] = document.querySelectorAll('button')
    first.focus()

    await userEvent.tab()

    expect(document.activeElement).toBe(second)

    await userEvent.tab({ shift: true })

    expect(document.activeElement).toBe(first)
  })
})
