// Each widget renders inside a host element, which the container holds.
const HOST_TAGS = ['alma-payment-plans', 'alma-eligibility-modal']

const isHost = (element: Element): boolean => HOST_TAGS.includes(element.localName)

/**
 * The element children of a container, with each host replaced by what it renders, in its shadow
 * root or, for an element still in light DOM, in its own children.
 */
export const containerChildren = (container: ParentNode): Element[] =>
  Array.from(container.children).flatMap((child) =>
    isHost(child) ? containerChildren(child.shadowRoot ?? child) : [child],
  )

/** Every element under root that matches the selector, inside the open shadow roots too. */
export const deepQueryAll = <T extends Element = Element>(
  root: ParentNode,
  selector: string,
): T[] => [
  ...Array.from(root.querySelectorAll<T>(selector)),
  ...Array.from(root.querySelectorAll('*')).flatMap((element) =>
    element.shadowRoot ? deepQueryAll<T>(element.shadowRoot, selector) : [],
  ),
]
