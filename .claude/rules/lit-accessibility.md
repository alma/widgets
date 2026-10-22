---
paths:
  - "src/widgets/**"
  - "src/shared/ui/**"
  - "src/modal.browser.test.ts"
---

# Accessibility

These rules cover 4.x only and override generic Lit and accessibility advice. Accessibility must not regress, and the DOM is part of the merchant contract, so the port reproduces master's accessibility as it is. Fixes that change the DOM wait for 5.0.

Generic advice that doesn't apply here: `<dialog>` and `showModal()`, `inert`, `aria-hidden` on the page behind a modal, and `delegatesFocus`.

## Widgets

- **A11Y-01** Roles, accessible names, keyboard behaviour, live regions and focus handling match master. Why: shoppers who use a keyboard or a screen reader must keep the same widget. Check: contract tests and the ported tests.
- **A11Y-02** Never change the DOM to make axe pass. Why: the DOM is part of the merchant contract. Check: review.
- **A11Y-03** No accessibility change that alters the DOM or the API, such as a `lang` attribute, a status region present from the first render or a configurable heading level. Why: these change the merchant contract and wait for 5.0. Check: contract tests.
- **A11Y-08** Widget tests run axe through `vitest-axe`, and Stylelint's a11y rules stay on. Why: they catch regressions that the DOM outline doesn't show. Check: lint and tests.

## Modal

- **A11Y-04** The modal reproduces react-modal's markup: a `ReactModalPortal` div at the end of `<body>`, the overlay and content divs with their classes, two focus sentinels, the body class and the scroll lock. Why: merchant CSS and scripts target this markup. Check: contract tests.
- **A11Y-05** No `<dialog>`, no `inert` and no `aria-hidden` on the page behind the modal. Why: the page behind the modal stays as master leaves it, and `<dialog>` waits for 5.0. Check: review.
- **A11Y-06** Tab and Shift+Tab cycle through the elements that can take focus, and skip disabled, hidden and `tabindex="-1"` elements. Escape closes the modal. An overlay click closes it only when the press and the release are both on the overlay. On close, focus returns to the element that had it. Why: this is react-modal's behaviour. Check: review.
- **A11Y-07** Only `src/modal.browser.test.ts` runs in Chromium. Every other test runs in jsdom. Why: jsdom has no layout and no real Tab navigation, which only the modal's focus handling needs. Check: tests.
