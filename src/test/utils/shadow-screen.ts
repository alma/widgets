import { within } from '@testing-library/dom'

// A host element, or a selector for the first one.
type Host = Element | string

// querySelectorAll stops at shadow roots, so a host inside another widget's root would be missed.
const queryAllDeep = (selector: string, root: Document | ShadowRoot = document): Element[] => {
  const nestedRoots = Array.from(
    root.querySelectorAll('*'),
    (element) => element.shadowRoot,
  ).filter((shadowRoot): shadowRoot is ShadowRoot => !!shadowRoot)
  return [
    ...root.querySelectorAll(selector),
    ...nestedRoots.flatMap((shadowRoot) => queryAllDeep(selector, shadowRoot)),
  ]
}

const findHost = (host: Host): Element => {
  if (typeof host !== 'string') return host
  const [found] = queryAllDeep(host)
  if (!found) throw new Error(`No element matches ${host}`)
  return found
}

export const shadowRootOf = (host: Host): ShadowRoot => {
  const element = findHost(host)
  if (!element.shadowRoot) throw new Error(`<${element.localName}> has no open shadow root`)
  return element.shadowRoot
}

// Testing Library's screen stops at shadow roots.
export const shadowScreen = (host: Host) => within(shadowRootOf(host) as unknown as HTMLElement)

export const allShadowScreens = (selector: string) =>
  queryAllDeep(selector).map((host) => shadowScreen(host))

// Lit adds <style> elements to the root where adoptedStyleSheets is missing, as in jsdom.
export const renderedChildren = (host: Host): Element[] =>
  Array.from(shadowRootOf(host).children).filter((child) => child.localName !== 'style')

// document.activeElement is the outermost shadow host that holds the focus.
export const deepActiveElement = (): Element | null => {
  let active = document.activeElement
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
  return active
}
