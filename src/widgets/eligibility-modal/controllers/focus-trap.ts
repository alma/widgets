// A port of react-modal 3.16.3's tabbable.js and scopeTab.js, quirks included.

const TABBABLE_NODE = /^(input|select|textarea|button|object|iframe)$/

// react-modal counts SVG elements with a tabindex too.
type Focusable = HTMLElement | SVGElement

const isNotOverflowing = (element: Element, style: CSSStyleDeclaration): boolean =>
  style.getPropertyValue('overflow') !== 'visible' ||
  (element.scrollWidth <= 0 && element.scrollHeight <= 0)

// What react-modal's `!element.innerHTML` tests, without serializing the subtree.
const hasNoMarkup = (element: Element): boolean =>
  [...element.childNodes].every((child) => child instanceof Text && child.data === '')

const hidesContents = (element: Element): boolean => {
  // An SVG element has no offsetWidth, so it never counts as zero size and its display decides.
  const { offsetWidth, offsetHeight } = element as HTMLElement
  const zeroSize = offsetWidth <= 0 && offsetHeight <= 0
  if (zeroSize && hasNoMarkup(element)) return true
  const style = window.getComputedStyle(element)
  const display = style.getPropertyValue('display')
  return zeroSize ? display !== 'contents' && isNotOverflowing(element, style) : display === 'none'
}

// Ancestors are shared by many candidates, and each check forces style and layout reads.
type HiddenCache = Map<Element, boolean>

const isHidden = (element: Element, cache: HiddenCache): boolean => {
  let hidden = cache.get(element)
  if (hidden === undefined) {
    hidden = hidesContents(element)
    cache.set(element, hidden)
  }
  return hidden
}

const isVisible = (element: Focusable, cache: HiddenCache): boolean => {
  const rootNode = element.getRootNode()
  let node: Node | null = element
  while (node) {
    if (node === document.body) break
    // Like react-modal, this skips the shadow host itself.
    if (node === rootNode && rootNode instanceof ShadowRoot) node = rootNode.host.parentNode
    if (node instanceof Element && isHidden(node, cache)) return false
    node = node?.parentNode ?? null
  }
  return true
}

const isFocusable = (element: Focusable, hasTabIndex: boolean, cache: HiddenCache): boolean => {
  const nodeName = element.nodeName.toLowerCase()
  // A disabled control with a tabindex counts, as in react-modal.
  const focusable =
    (TABBABLE_NODE.test(nodeName) && !(element as HTMLButtonElement).disabled) ||
    (nodeName === 'a' ? Boolean((element as HTMLAnchorElement).href) || hasTabIndex : hasTabIndex)
  return focusable && isVisible(element, cache)
}

const isTabbable = (element: Focusable, cache: HiddenCache): boolean => {
  const tabIndex = Number(element.getAttribute('tabindex') ?? undefined)
  const hasTabIndex = !Number.isNaN(tabIndex)
  return (!hasTabIndex || tabIndex >= 0) && isFocusable(element, hasTabIndex, cache)
}

const findTabbable = (root: Element | ShadowRoot, cache: HiddenCache = new Map()): Focusable[] =>
  [...root.querySelectorAll<Focusable>('*')]
    .flatMap((element) =>
      element.shadowRoot ? findTabbable(element.shadowRoot, cache) : [element],
    )
    .filter((element) => isTabbable(element, cache))

const getActiveElement = (root: Document | ShadowRoot = document): Element | null => {
  const active = root.activeElement
  return active?.shadowRoot ? getActiveElement(active.shadowRoot) : active
}

// react-modal's guess at desktop Safari, which doesn't move the focus to radio buttons. Chrome's
// user agent names Chrome before Safari.
const isDesktopSafari = (): boolean => {
  const browser = /(\bChrome\b|\bSafari\b)\//.exec(navigator.userAgent)
  return (
    browser !== null && browser[1] !== 'Chrome' && !/\biPod\b|\biPad\b/.test(navigator.userAgent)
  )
}

const moveFocus = (event: KeyboardEvent, target: Focusable): void => {
  event.preventDefault()
  target.focus()
}

export const scopeTab = (node: HTMLElement, event: KeyboardEvent): void => {
  const tabbable = findTabbable(node)
  if (tabbable.length === 0) {
    event.preventDefault()
    return
  }
  const { shiftKey } = event
  const head = tabbable[0]
  const tail = tabbable[tabbable.length - 1]
  const activeElement = getActiveElement()
  if (activeElement === node && !shiftKey) return
  if (activeElement === node || (activeElement === head && shiftKey)) {
    moveFocus(event, tail)
    return
  }
  if (activeElement === tail && !shiftKey) {
    moveFocus(event, head)
    return
  }
  // Elsewhere, the browser moves the focus, and the sentinels bring it back if it leaves.
  if (!isDesktopSafari()) return

  let index = tabbable.indexOf(activeElement as Focusable)
  if (index > -1) {
    index += shiftKey ? -1 : 1
  }
  moveFocus(event, tabbable[index] ?? (shiftKey ? tail : head))
}
