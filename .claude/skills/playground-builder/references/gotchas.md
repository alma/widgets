# Gotchas discovered while building this playground

These are non-obvious pitfalls hit while building and rewriting the DCC2 QA playground. The
playground itself is never committed (see SKILL.md), and only `playground/main.ts`,
`playground/mockFetch.ts`, `playground/dom.ts`, and `playground/tsconfig.json` are bundled as real
assets (`assets/playground/`) rather than rewritten each time, because their content never depends
on the feature under test. Everything else — including the control panel — is written fresh per
feature using plain DOM APIs (no framework, no JSX), so these write-ups include the actual minimal
code for each fix so they're usable on their own without a working copy to lean on.

Why no framework: the widget under test is aliased to Preact today, but that's an implementation
detail of `@alma/widgets` the playground doesn't need to share — its only real coupling is the
public `Widgets.initialize(...).add(...)` call (gotcha 4), already framework-agnostic.
`@alma/widgets` has a real, planned migration to native Web Components; a vanilla-DOM panel never
needs a rewrite when that lands.

1. Install the mock before anything else runs
2. `sessionStorage` caches eligibility responses for an hour
3. `playground/index.html` cannot link anything outside the `playground/` directory
4. Mount through `Widgets.initialize(...).add(...)`, not the component directly
5. Native drag-and-drop's automatic ghost image can render far more than the dragged element
6. Gate a draggable wrapper's drag-start to a specific handle
7. Resolve "which item is this" from a stable id, never a captured list index
8. Build a node's listeners exactly once; updates may only mutate values
9. Don't sync `state → input.value` from that input's own handler
10. A `<details>` element's open/closed state just works — no special handling needed
11. `npx tsc --noEmit` alone does NOT typecheck `playground/` — it silently skips it
12. Never delete a `syncList`-managed handle from outside `syncList` itself
13. `ineligiblePlanBuilder().withConstraints(...)` takes a nested shape
14. `element.hidden` can be silently overridden by the element's own CSS
15. `syncList` must skip re-appending a node that's already in the right place

## 1. Install the mock before anything else runs

`installMockFetch()` (in `playground/mockFetch.ts`, patches `window.fetch` once, globally) must
run before `mountApp()` — see `assets/playground/main.ts` for the exact, tiny file. There's no
effect-ordering hazard to reason about here: in vanilla DOM nothing runs "automatically" on
mount the way a React effect does, so the rule is just plain top-to-bottom order — install the
mock, then mount, in that sequence, in `main.ts`. The one way to still get this wrong is
installing it lazily from inside a click handler or some other callback that only runs *after*
the widget's first fetch already happened — always call it unconditionally at module load.

## 2. `sessionStorage` caches eligibility responses for an hour

`useFetchEligibility` caches responses in `sessionStorage`, keyed by purchase amount, plans,
billing/shipping country, `merchantCoversAllFees`, domain, and merchant ID, for up to an hour. If
a real API response (or a stale mocked one) ever got cached under a key that still matches, the
widget will serve it from cache and skip fetching entirely — so editing a mocked plan in the
panel can appear to do nothing.

Fix: clear it synchronously right before every call that updates the mock response state:
```ts
function refreshWidgetPreview(): void {
  sessionStorage.clear()
  setMockResponseState({ plans: /* ... */, simulateError: state.simulateError, errorMessage: 'Simulated QA error', delayMs: state.delayMs })
  widgets.add(Widgets.PaymentPlans, { /* ... */ })
}
```
so every edit is guaranteed to produce a fresh fetch instead of possibly serving a cached
response from before the edit.

## 3. `playground/index.html` cannot link anything outside the `playground/` directory

`vite.playground.config.ts` sets `root: resolve(__dirname, 'playground')`. Any asset path in
`playground/index.html` that escapes that root with `../` (e.g. `../examples/style.css`,
`../src/assets/alma.svg`) resolves to a site-root URL that doesn't exist under Vite's dev-server
root, and silently falls back to serving `index.html` itself (Vite's SPA fallback) — the browser
accepts it as if it were the real asset, so there's no 404 in the console. If a linked asset from
`playground/index.html` looks broken, check its `content-type` via the network tab (or
`fetch(url).then(r => r.headers.get('content-type'))`) — if it comes back `text/html` instead of
what you expected, this is why.

The fix: don't link cross-root static assets at all. For something like a logo, inline the SVG
markup as a string constant and set it via `.innerHTML` on a wrapper element (or import it
through Vite's `?raw` module suffix, still resolved through the JS module graph independent of
dev-server root) — never a raw `<img src="../...">`.

## 4. Mount through `Widgets.initialize(...).add(...)`, not the component directly

Use the same public entry point a real merchant's script does:

```ts
const widgets = Widgets.initialize(merchantId, apiMode) // once, up front — neither arg changes at runtime; apiMode is Widgets.initialize's second (`mode: ApiMode`) parameter, named `domain` only inside ApiData
widgets.add(Widgets.PaymentPlans, { container: '#qa-widget-container', purchaseAmount, locale })
```

This exercises `widgets_controller.tsx` too (which wraps the widget in its own `<IntlProvider>`,
among other things), so the playground stays representative of what merchants actually run — and,
since it's a plain function call on a DOM container, it's already independent of whatever
framework the widgets themselves are built in.

Calling `.add()` again on the same container forces a full unmount/remount, which is also the
easiest way to force a fresh eligibility fetch after changing config — call it again from
`refreshWidgetPreview()` (gotcha 2) every time something response- or config-relevant changes.

## 5. Native drag-and-drop's automatic ghost image can render far more than the dragged element

If you make a flex list item `draggable` and let the browser generate its own drag image,
browsers can sometimes rasterize a much bigger chunk of the surrounding stacking context than
just that one element — dragging one plan card can produce a ghost image containing several
sibling cards and whatever's below it. This seems tied to the dragged node not establishing its
own stacking/paint context.

The reliable fix: on `dragstart`, clone the node you actually want to show, give the clone
explicit pixel dimensions, position it off-screen, and hand *that* to `setDragImage`. Remove the
clone on `dragend`, not via `requestAnimationFrame` (Chrome throttles rAF to near-never on a
backgrounded tab, which can leave the clone stuck in the DOM):

```ts
let dragState: { index: number | null; allowed: boolean; dragImage: HTMLElement | null } =
  { index: null, allowed: false, dragImage: null }

wrapper.addEventListener('dragstart', (event) => {
  if (!dragState.allowed) { event.preventDefault(); return }
  const card = wrapper.querySelector('.qa-plan-card')
  if (card instanceof HTMLElement) {
    const { width, height } = card.getBoundingClientRect()
    const clone = card.cloneNode(true) as HTMLElement
    Object.assign(clone.style, { position: 'fixed', top: '-9999px', left: '-9999px', width: `${width}px`, height: `${height}px`, margin: '0' })
    document.body.append(clone)
    event.dataTransfer!.setDragImage(clone, 16, 16)
    dragState.dragImage = clone
  }
})
wrapper.addEventListener('dragend', () => {
  dragState.dragImage?.remove()
  dragState = { index: null, allowed: false, dragImage: null }
})
```

## 6. Gate a draggable wrapper's drag-start to a specific handle

Setting `draggable` on a card wrapper means *any* mousedown-and-move inside it — including on a
text input — can try to start a native drag instead of, say, selecting text. Add a small grip
handle element; its `mousedown` listener flips a flag; the wrapper's `dragstart` listener checks
that flag and calls `event.preventDefault()` if it isn't set:

```ts
const handle = el('span', { className: 'qa-plan-drag-handle', 'aria-label': 'Drag to reorder' }, ['⠿'])
handle.addEventListener('mousedown', () => { dragState.allowed = true })
```

A plain object in closure scope (not React state) is fine here since nothing needs to trigger a
re-render — see gotcha 7 for why capturing more than a boolean flag from a closure gets risky
once nodes persist across reorders.

## 7. Resolve "which item is this" from a stable id, never a captured list index

If a card's DOM node persists across reorders (it should — see `syncList` in `dom.ts`), any
listener that captured its position as a plain `index` variable at creation time goes stale
the moment the list reorders. Always resolve "which item is this" from the item's own stable
`id` at the moment the event actually fires:

```ts
wrapper.addEventListener('drop', (event) => {
  event.preventDefault()
  const dropIndex = state.drafts.findIndex((d) => d.id === draft.id) // live lookup, not a captured index
  if (dragState.index !== null) reorderDrafts(dragState.index, dropIndex)
})
```

## 8. Build a node's listeners exactly once; updates may only mutate values

If an `update()` function ever calls `addEventListener` again on a node it already built earlier
— instead of building it once in `create()` and only mutating text/classes/values afterward —
listeners stack. Every subsequent update makes the handler fire one more time than before, so a
single keystroke can end up running the same logic N times. The rule: `create()` attaches
listeners exactly once per node; `update()` never calls `addEventListener` on an existing node,
only reads/writes its properties.

## 9. Don't sync `state → input.value` from that input's own handler

It's tempting (especially coming from a React background) to always write the current state back
into every input on every update, the way a controlled component would. Don't do this for an
input's *own* value from inside *its own* `input`/`change` handler — it resets the cursor
position and can undo characters the user is still typing. Only push `state → input.value` when
the change came from somewhere else entirely (a preset button, an eligible/ineligible toggle
swapping which fields are visible for a card).

## 10. A `<details>` element's open/closed state just works — no special handling needed

This used to be its own gotcha in the React version: React re-applies a computed `open` prop on
every render, so any manual open/close the user did could get silently overwritten the moment
unrelated data changed elsewhere on the page. **That problem doesn't exist here.** There's no
re-render step in this design that reassigns an attribute nothing told it to touch — set `.open`
once, at creation, from whatever the initial condition should be (e.g. a freshly-added,
not-yet-filled-in draft starts open), and native `<summary>` click-toggling and `syncList`'s
node-reuse (`dom.ts`) do the rest for free:

```ts
const details = el('details', { className: 'qa-plan-card-details', open: draft.installmentsCount === 0 })
```

## 11. `npx tsc --noEmit` alone does NOT typecheck `playground/` — it silently skips it

The repo's `tsconfig.json` has `"include": ["src", "setupTests.ts", "vite.config.ts", "scripts"]`
— `playground/` isn't in it. A plain `npx tsc --noEmit` exits 0 even with an obvious type error
sitting in a `playground/*.ts` file; this was confirmed by deliberately introducing one and
watching it pass silently. Use the bundled `assets/playground/tsconfig.json` instead (copied into
`playground/tsconfig.json` — see SKILL.md Step 2), and run
`npx tsc --noEmit -p playground/tsconfig.json` for Step 4's verification. That config's `include`
is `[".", "../src/**/*.d.ts"]` — the second entry matters: without it, `src/`'s ambient
`*.module.css` declarations (`src/declarations.d.ts`) aren't part of the compilation, and every
file that imports a CSS module produces a spurious "cannot find module" error, since ambient
declaration files aren't pulled in through imports the way regular modules are.

## 12. Never delete a `syncList`-managed handle from outside `syncList` itself

`syncList` (in `dom.ts`) decides whether to create, update, or remove a node by comparing the new
item list against its own `handles` map — removal specifically depends on finding a key that's
*still in the map* but *no longer in the items list*. If calling code deletes an entry from that
map itself before calling `syncList` again (e.g. "clean up after removing an item"), the node
becomes permanently orphaned: still attached to the DOM, listeners still live, but with no
bookkeeping left anywhere that would ever tell `syncList` to remove it. Let `syncList` own that
map exclusively — the only correct way to remove a rendered item is to drop it from the *items*
array and call `syncList` again; never call `handles.delete(...)` yourself.

## 13. `ineligiblePlanBuilder().withConstraints(...)` takes a nested shape

`IneligiblePlan['constraints']` is `{ purchase_amount?: { minimum: number; maximum: number } }` —
nested under a `purchase_amount` key, not a flat `{ minimum, maximum }` object. Passing the flat
shape compiles under `tsc --noEmit` run the normal (broken) way — see gotcha 11 — silently
produces the wrong runtime shape, and was sitting undetected in this exact playground until the
scoped tsconfig from gotcha 11 caught it. Always write:
```ts
.withConstraints({ purchase_amount: { minimum: draft.minAmount, maximum: draft.maxAmount } })
```

## 14. `element.hidden` can be silently overridden by the element's own CSS

The `hidden` DOM property works by setting the `hidden` attribute, which the browser's
user-agent stylesheet matches with `[hidden] { display: none }`. That rule loses to an author
rule that also sets `display` on the same element — not because of a specificity tie broken by
source order, but because CSS resolves **origin before specificity**: at normal priority, an
author-origin declaration always beats a user-agent-origin declaration, regardless of which
selector is more specific or which rule is written later. So if the element's own class also sets
`display` (e.g. `.qa-pill { display: inline-flex }`), that rule wins outright — `.qa-pill` would
still win even if its selector had *lower* specificity than `[hidden]`. This produced a real bug
here: an error pill's `.hidden` toggle compiled fine, looked correct in the code, and simply
never hid anything, because `.qa-pill` already set `display: inline-flex`.

Before reaching for `element.hidden`, check whether the element's own class sets `display` at
all. If it does, toggle `style.display` directly instead:
```ts
// Not `.hidden` — `.qa-pill` sets its own `display`, and an author-origin rule always beats the
// `[hidden]` user-agent rule regardless of specificity, so `.hidden` can't override it here.
errorPill.style.display = shouldShow ? '' : 'none'
```
Elements whose class never sets `display` (e.g. a plain `<p>` or `<table>` with no `display`
rule of its own) are unaffected — `.hidden` works correctly for those, since there's no
author-origin `display` declaration for `[hidden]` to lose to.

## 15. `syncList` must skip re-appending a node that's already in the right place

The original version of `syncList` called `container.append(node)` unconditionally for every
item on every call, on the theory that "sequential append == final DOM order matches items
order." That's true for the resulting order, but `appendChild`/`append`/`insertBefore` on a node
that **already has a parent** perform a remove-then-insert under the hood — even when the node
ends up in the exact same position. Removing a node from the document always blurs the currently
focused element if it's that node or a descendant of it (e.g. a text input mid-edit inside a
card). The practical symptom: typing into any field inside a `syncList`-rendered list item lost
focus after every single keystroke, because the edit's own state update triggered a re-render
that re-appended every item in the list, including the one the user was still typing into.

The fix is to only move a node when it isn't already sitting where it should be:
```ts
let previousNode: El | null = null
for (const item of items) {
  // ...create-or-update node as before...
  const isAlreadyInPlace = node.parentElement === container && node.previousElementSibling === previousNode
  if (!isAlreadyInPlace) {
    container.insertBefore(node, previousNode ? previousNode.nextElementSibling : container.firstChild)
  }
  previousNode = node
}
```
When only content changed (the common case for a keystroke), no node's position moved, so this
loop never calls `insertBefore` at all — the DOM is touched exclusively through `update()`, and
focus survives. The bundled `dom.ts` already has this fix; if `syncList` is ever hand-rolled
instead of copied from `assets/playground/`, this is the detail that's easy to miss because the
naive version *looks* correct and only breaks on the specific case of "re-render while a
descendant has focus."
