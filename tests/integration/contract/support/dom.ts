// The Lit build wraps each widget in a host element. Master's markup has none.
const HOST_TAGS = ['alma-payment-plans', 'alma-eligibility-modal']

const isHost = (element: Element): boolean => HOST_TAGS.includes(element.localName)

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/**
 * The element children of a container, with each host replaced by its own element children.
 * On master's build it returns the same list as container.children.
 */
export const containerChildren = (container: Element): Element[] =>
  Array.from(container.children).flatMap((child) =>
    isHost(child) ? containerChildren(child) : [child],
  )

export type OutlineEntry = {
  tag: string
  depth: number
  // Sorted by name.
  attributes: Array<[name: string, value: string]>
}

// Vite names a CSS-module class `_<local name>_<5 character hash>_<line number>`.
const CSS_MODULE_CLASS = /^_(.+?)_[0-9a-z]{5,6}(?:_\d+)?$/

/** A CSS-module class loses its hash. Any other token stays, so a stray "undefined" shows. */
const reduceClass = (token: string): string => token.match(CSS_MODULE_CLASS)?.[1] ?? token

const attributesOf = (element: Element): OutlineEntry['attributes'] =>
  Array.from(element.attributes)
    .map(({ name, value }): [string, string] => [
      name,
      name === 'class'
        ? value.split(/\s+/).filter(Boolean).map(reduceClass).sort().join(' ')
        : value,
    ])
    .sort(([a], [b]) => (a < b ? -1 : Number(a > b)))

/**
 * Lists the elements under a root, root included, in document order. It looks through the host
 * elements and skips text, comments and the children of an <svg>.
 */
export const domOutline = (root: Element, depth = 0): OutlineEntry[] => {
  if (isHost(root)) return Array.from(root.children).flatMap((child) => domOutline(child, depth))
  const entry: OutlineEntry = { tag: root.localName, depth, attributes: attributesOf(root) }
  if (root.namespaceURI === SVG_NAMESPACE && root.localName === 'svg') return [entry]
  return [entry, ...Array.from(root.children).flatMap((child) => domOutline(child, depth + 1))]
}

/** The same outline as text, one line per element, for golden files. */
export const outlineToText = (outline: OutlineEntry[]): string =>
  outline
    .map(({ tag, depth, attributes }) => {
      const attrs = attributes.map(([name, value]) => ` ${name}="${value}"`).join('')
      return `${'  '.repeat(depth)}<${tag}${attrs}>`
    })
    .join('\n')

/** The outline of a container and of the modal portal, which react-modal appends to <body>. */
export const widgetOutline = (container: Element | null): OutlineEntry[] => {
  const portal = document.querySelector('.ReactModalPortal')
  return [...(container ? domOutline(container) : []), ...(portal ? domOutline(portal) : [])]
}
