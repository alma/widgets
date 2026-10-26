import { ApiMode, Widgets } from '@/index'
import { Locale } from '@/shared/i18n/i18n.const'
import { mountWidget } from '@/test/mount-widget'

// add() is still a stub, so these tests replace it.
const stubAdd = (add: ReturnType<typeof Widgets.initialize>['add']) => {
  const addSpy = vi.fn(add)
  const initialize = vi.spyOn(Widgets, 'initialize').mockReturnValue({ add: addSpy })
  return { initialize, add: addSpy }
}

class StubHost extends HTMLElement {
  rendered = false

  updateComplete = new Promise<boolean>((resolve) => {
    setTimeout(() => {
      this.rendered = true
      resolve(true)
    })
  })
}
customElements.define('alma-stub-host', StubHost)

const renderStubHost = (_: unknown, options: { container: string }) => {
  document.querySelector(options.container)!.append(new StubHost())
  return undefined
}

describe('mountWidget', () => {
  it('should mount through the public API, in French, in the test container', async () => {
    const { initialize, add } = stubAdd(() => undefined)

    await mountWidget('PaymentPlans', { purchaseAmount: 45000 })

    expect(initialize).toHaveBeenCalledWith('11gKoO333vEXacMNMUMUSc4c4g68g2Les4', ApiMode.TEST)
    expect(add).toHaveBeenCalledWith('PaymentPlans', {
      purchaseAmount: 45000,
      locale: 'fr',
      container: '#alma-widget-test',
    })
    expect(document.querySelector('#alma-widget-test')).not.toBeNull()
  })

  it('should let an explicit locale and container win', async () => {
    const { add } = stubAdd(() => undefined)
    document.body.innerHTML = '<div id="merchant-container"></div>'

    await mountWidget('PaymentPlans', {
      purchaseAmount: 45000,
      locale: Locale.de,
      container: '#merchant-container',
    })

    expect(add).toHaveBeenCalledWith('PaymentPlans', {
      purchaseAmount: 45000,
      locale: 'de',
      container: '#merchant-container',
    })
    expect(document.querySelector('#alma-widget-test')).toBeNull()
  })

  it('should resolve once the host has rendered', async () => {
    stubAdd(renderStubHost)

    const { host } = await mountWidget('PaymentPlans', { purchaseAmount: 45000 })

    expect(host).toBeInstanceOf(StubHost)
    expect((host as StubHost).rendered).toBe(true)
  })

  it('should reuse the test container of an earlier mount', async () => {
    stubAdd(() => undefined)

    await mountWidget('PaymentPlans', { purchaseAmount: 45000 })
    await mountWidget('PaymentPlans', { purchaseAmount: 90000 })

    expect(document.querySelectorAll('#alma-widget-test')).toHaveLength(1)
  })

  it('should find the host after the content the container already holds', async () => {
    stubAdd(renderStubHost)
    document.body.innerHTML = '<div id="merchant-container"><p>Product page</p></div>'

    const { host } = await mountWidget('PaymentPlans', {
      purchaseAmount: 45000,
      container: '#merchant-container',
    })

    expect(host).toBeInstanceOf(StubHost)
    expect((host as StubHost).rendered).toBe(true)
  })

  it('should resolve with no host and the handle when add() mounts nothing', async () => {
    const handle = { open: vi.fn(), close: vi.fn() }
    stubAdd(() => handle)

    const mounted = await mountWidget('Modal', {
      purchaseAmount: 45000,
      clickableSelector: '#open-modal',
    })

    expect(mounted).toEqual({ host: null, handle })
  })
})
