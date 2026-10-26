import { injectStyle } from '@/test/inject-style'

// The tests of a describe block run in order, so the second test sees what the first one left.
describe('injectStyle', () => {
  let style: HTMLStyleElement

  it('should apply the CSS', () => {
    style = injectStyle('.injected { color: rgb(255, 0, 0); }')
    document.body.innerHTML = '<p class="injected">Pay in 3 installments</p>'

    expect(getComputedStyle(document.querySelector('p')!).color).toBe('rgb(255, 0, 0)')
  })

  it('should remove the <style> after the test', () => {
    expect(style.isConnected).toBe(false)
  })
})
