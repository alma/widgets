---
paths:
  - "src/widgets/**"
  - "src/shared/**"
  - "src/modal.browser.test.ts"
---

# Accessibility

These rules hold while the widget renders in light DOM, where merchants style it through its classes, IDs and custom properties. They override generic Lit and accessibility advice. Accessibility must not regress, and the DOM is part of the merchant contract, so the widget keeps its accessibility as it is. Fixes that change the DOM wait for a major release that is allowed to break the merchant contract.

Generic advice that doesn't apply here: `<dialog>` and `showModal()`, `inert`, `aria-hidden` on the page behind a modal, and `delegatesFocus`.

## Widgets

- **A11Y-01** Roles, accessible names, keyboard behaviour, live regions and focus handling must not regress. Why: shoppers who use a keyboard or a screen reader must keep the same widget. Check: contract tests and the widget tests.
- **A11Y-02** Never change the DOM to make axe pass. Keep the DOM, disable that axe rule in that test, and say in a comment why the DOM stays. Why: the DOM is part of the merchant contract. Check: review.
- **A11Y-03** No accessibility change that alters the DOM or the API, such as a `lang` attribute, a status region present from the first render or a configurable heading level. Why: these change the merchant contract, so they wait for a major release that is allowed to break it. Check: contract tests.
- **A11Y-08** Widget tests run axe through `vitest-axe`, and Stylelint's a11y rules stay on. Why: they catch regressions that the DOM outline doesn't show. Check: lint and tests.
- **A11Y-09** Accessibility cases go in `<name>.accessibility.test.ts`, next to the code they cover: axe runs, roles, accessible names and descriptions, `aria-*` states and the IDs they point to, keyboard handling and focus. Text, classes and the structure that CSS targets stay in `<name>.test.ts`. At a widget's root, `<widget>.accessibility.test.ts` runs axe on the composed widget, with one row per state. Browser tests and the public API wiring stay where they are. Why: the suffix marks the cases that guard accessibility, so a cleanup can't drop one without noticing, and one pattern selects them all. Check: lint for axe runs, review for the rest.

## Modal

- **A11Y-04** The modal reproduces react-modal's markup: a `ReactModalPortal` div at the end of `<body>`, the overlay and content divs with their classes, two focus sentinels, the body class and the scroll lock. Why: merchant CSS and scripts target this markup. Check: contract tests.
- **A11Y-05** No `<dialog>`, no `inert` and no `aria-hidden` on the page behind the modal. Why: the page behind the modal stays untouched, and `<dialog>` waits for a major release that is allowed to break the merchant contract. Check: review.
- **A11Y-06** Tab and Shift+Tab cycle through the elements that can take focus, and skip disabled, hidden and `tabindex="-1"` elements. Escape closes the modal. An overlay click closes it only when the press and the release are both on the overlay. On close, focus returns to the element that had it. Why: this is react-modal's behaviour. Check: review.
