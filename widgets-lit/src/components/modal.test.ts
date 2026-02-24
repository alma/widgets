import { html, fixture, expect, waitUntil } from '@open-wc/testing'
import '../components/modal'
import type { AlmaModal } from '../components/modal'
import { stubEligibilityFetch } from '../test/mocks/fetch'

/**
 * Unit tests for AlmaModal Web Component.
 *
 * Notes:
 * - We stub `fetch()` to avoid real network calls.
 * - We keep assertions focused on component behavior, not CSS.
 */
describe('AlmaModal', () => {
  let fetchStub: ReturnType<typeof stubEligibilityFetch>

  beforeEach(() => {
    ;(window as any).__ALMA_WIDGET_CONFIG__ = {
      apiMode: 'https://api.sandbox.getalma.eu',
      merchantId: 'merchant_test',
    }

    sessionStorage.clear()
    fetchStub = stubEligibilityFetch()
  })

  afterEach(() => {
    delete (window as any).__ALMA_WIDGET_CONFIG__
    fetchStub.restore()
  })

  it('should render and be hidden by default', async () => {
    const el = await fixture<AlmaModal>(html`<alma-modal purchase-amount="45000"></alma-modal>`)
    const overlay = el.shadowRoot!.querySelector('.modal-overlay')
    expect(overlay?.classList.contains('open')).to.be.false
  })

  it('should open and close', async () => {
    const el = await fixture<AlmaModal>(html`<alma-modal purchase-amount="45000"></alma-modal>`)

    el.open()
    await el.updateComplete

    const overlay = el.shadowRoot!.querySelector('.modal-overlay')
    expect(overlay?.classList.contains('open')).to.be.true

    el.close()
    await el.updateComplete

    expect(overlay?.classList.contains('open')).to.be.false
  })

  it('should fetch eligibility once on initial attach when purchaseAmount > 0', async () => {
    await fixture<AlmaModal>(html`<alma-modal purchase-amount="45000"></alma-modal>`)

    await waitUntil(() => fetchStub.called, 'fetch should have been called')
    expect(fetchStub.callCount).to.equal(1)
  })

  it('should not refetch when opened', async () => {
    const el = await fixture<AlmaModal>(html`<alma-modal purchase-amount="45000"></alma-modal>`)

    await waitUntil(() => fetchStub.called, 'fetch should have been called')
    expect(fetchStub.callCount).to.equal(1)

    el.open()
    await el.updateComplete

    expect(fetchStub.callCount).to.equal(1)
  })

  it('should move focus inside on open and restore focus on close', async () => {
    const outsideBtn = document.createElement('button')
    outsideBtn.textContent = 'outside'
    document.body.appendChild(outsideBtn)

    const el = await fixture<AlmaModal>(html`<alma-modal purchase-amount="45000"></alma-modal>`)
    await waitUntil(() => fetchStub.called, 'fetch should have been called')

    outsideBtn.focus()

    el.open()
    await el.updateComplete

    const dialog = el.shadowRoot?.querySelector('.modal') as HTMLElement | null
    expect(dialog).to.exist

    await waitUntil(
      () => (el.shadowRoot?.activeElement || document.activeElement) === dialog,
      'focus should be moved to the dialog container',
      { timeout: 3000 },
    )

    el.close()
    await el.updateComplete

    await waitUntil(() => document.activeElement === outsideBtn, 'focus should be restored', {
      timeout: 3000,
    })

    document.body.removeChild(outsideBtn)
  })

  it('should close on Escape', async () => {
    const el = await fixture<AlmaModal>(html`<alma-modal purchase-amount="45000"></alma-modal>`)
    await waitUntil(() => fetchStub.called, 'fetch should have been called')

    el.open()
    await el.updateComplete

    const overlay = el.shadowRoot!.querySelector('.modal-overlay') as HTMLElement
    overlay.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await el.updateComplete

    expect(overlay.classList.contains('open')).to.be.false
  })

  it('keeps skip links disabled by default when opening programmatically', async () => {
    const el = await fixture<AlmaModal>(html`
      <alma-modal purchase-amount="45000" locale="fr"></alma-modal>
    `)

    // Prevent any real network calls.
    ;(el as any).loadEligibility = async () => {
      ;(el as any).loading = false
      ;(el as any).eligibilityPlans = []
    }

    el.open()
    await el.updateComplete

    const nav = el.shadowRoot?.querySelector('.skip-links')
    expect(nav?.classList.contains('skip-links--enabled')).to.equal(false)

    el.close()
  })

  it('enables skip links when opened after a keyboard interaction', async () => {
    const el = await fixture<AlmaModal>(html`
      <alma-modal purchase-amount="45000" locale="fr"></alma-modal>
    `)

    // Simulate keyboard navigation occurring before opening.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))

    el.open()
    await el.updateComplete

    const nav = el.shadowRoot?.querySelector('.skip-links')
    expect(nav?.classList.contains('skip-links--enabled')).to.equal(true)

    el.close()
  })

  it('keeps skip links disabled when opened after a pointer interaction', async () => {
    const el = await fixture<AlmaModal>(html`
      <alma-modal purchase-amount="45000" locale="fr"></alma-modal>
    `)

    // Simulate pointer interaction occurring before opening.
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))

    el.open()
    await el.updateComplete

    const nav = el.shadowRoot?.querySelector('.skip-links')
    expect(nav?.classList.contains('skip-links--enabled')).to.equal(false)

    el.close()
  })
})
