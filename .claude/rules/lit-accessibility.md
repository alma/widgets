---
paths:
  - "src/widgets/**"
  - "src/shared/**"
  - "src/modal.browser.test.ts"
---

# Accessibility

These rules override generic Lit and accessibility advice. Accessibility must not regress. The DOM isn't part of the merchant contract, so a change may alter the markup as long as shoppers keep a widget that works as well for them.

## Widgets

- **A11Y-01** Roles, accessible names, keyboard behaviour, live regions and focus handling must not regress: what a keyboard or screen reader user gets stays at least as good as before the change. Why: shoppers who use a keyboard or a screen reader must keep a widget that works for them. Check: the widget tests and review.
- **A11Y-02** When axe reports a violation, fix the markup. Turn that axe rule off in a test only when the report is wrong for this markup, such as a check that jsdom can't compute, and say why in a comment. Why: the DOM is ours to change, so a real violation gets fixed instead of hidden. Check: review.
- **A11Y-08** Widget tests run axe through `vitest-axe`, and Stylelint's a11y rules stay on. Why: they catch regressions that the DOM outline doesn't show. Check: lint and tests.
- **A11Y-09** Accessibility cases go in `<name>.accessibility.test.ts`, next to the code they cover: axe runs, roles, accessible names and descriptions, `aria-*` states and the IDs they point to, keyboard handling and focus. Text, classes and the structure that CSS targets stay in `<name>.test.ts`. At a widget's root, `<widget>.accessibility.test.ts` runs axe on the composed widget, with one row per state. Browser tests and the public API wiring stay where they are. Why: the suffix marks the cases that guard accessibility, so a cleanup can't drop one without noticing, and one pattern selects them all. Check: lint for axe runs, review for the rest.

## Modal

- **A11Y-06** Tab and Shift+Tab cycle through the elements that can take focus, and skip disabled, hidden and `tabindex="-1"` elements. Escape closes the modal. An overlay click closes it only when the press and the release are both on the overlay. On close, focus returns to the element that had it. Why: shoppers rely on this behaviour. Check: review.
