// Two small helpers for building the panel with plain DOM APIs instead of a framework. Their
// content never depends on the feature under test, so this file is copied verbatim (like
// main.ts and mockFetch.ts) rather than rewritten each session.

// A boring DOM-builder: document.createElement plus attribute/event-listener wiring. Not a
// clever hyperscript library — the goal is something a model can reliably reproduce the *use*
// of correctly, not something impressive.
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, unknown> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value as EventListener)
    } else if (key === 'className') {
      node.className = value as string
    } else if (key === 'draggable') {
      // Unlike true boolean attributes (open, required, disabled, ...), `draggable` is an
      // enumerated attribute: the browser only reads the literal string "true"/"false", not mere
      // presence — so it needs an explicit value in both directions, not the presence-only branch
      // below (which would just omit the attribute for `false` and leave it non-draggable by
      // default, right by accident rather than by correctly writing `draggable="false"`).
      node.setAttribute('draggable', value ? 'true' : 'false')
    } else if (value !== undefined && value !== false && value !== null) {
      // Boolean attributes (open, required, disabled, ...) just need to be present; setAttribute
      // with a truthy string does that correctly for both boolean and string props.
      node.setAttribute(key, String(value))
    }
  }
  node.append(...children.map((child) => (child instanceof Node ? child : document.createTextNode(child))))
  return node
}

// Keyed reconciliation for a list of items (e.g. plan draft cards): create a node once per key,
// update it in place on every later call, and reorder by moving already-attached nodes rather
// than recreating them. Moving a node that's already positioned correctly is skipped entirely
// (see the loop below) — <details open> and scroll position survive a real move either way, but
// focus does not: appendChild/insertBefore on a node that already has a parent does a
// remove-then-insert even when its position doesn't change, and removing a node from the document
// always blurs the currently focused element if it's that node or a descendant of it (gotcha 15).
//
// `create` must attach its event listeners exactly once. `update` may only mutate existing
// values/classes/text on the node it's handed — never call addEventListener again there, or
// listeners stack and a handler fires once per update since it was created.
export function syncList<Item, El extends HTMLElement>(
  container: HTMLElement,
  items: Item[],
  getKey: (item: Item) => string,
  handles: Map<string, El>,
  create: (item: Item) => El,
  update: (node: El, item: Item) => void,
): void {
  const seenKeys = new Set<string>()
  let previousNode: El | null = null

  for (const item of items) {
    const key = getKey(item)
    seenKeys.add(key)

    let node = handles.get(key)
    if (!node) {
      node = create(item)
      handles.set(key, node)
    } else {
      update(node, item)
    }

    // Only move the node when it isn't already sitting right after `previousNode` — see the
    // gotcha 15 note above. This is what keeps typing in a list item from losing focus on every
    // keystroke: as long as the item's position hasn't changed, this loop touches the DOM only
    // through `update()`, never through insertBefore/append.
    const isAlreadyInPlace = node.parentElement === container && node.previousElementSibling === previousNode
    if (!isAlreadyInPlace) {
      container.insertBefore(node, previousNode ? previousNode.nextElementSibling : container.firstChild)
    }
    previousNode = node
  }

  for (const [key, node] of handles) {
    if (!seenKeys.has(key)) {
      node.remove()
      handles.delete(key)
    }
  }
}
