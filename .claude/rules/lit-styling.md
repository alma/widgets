---
paths:
  - "src/widgets/**"
  - "src/shared/**"
  - "src/main.css"
---

# Styling in light DOM

These rules cover 4.x only and override generic Lit advice, which assumes Shadow DOM. Merchants restyle the widget with their own CSS, so the rules stay in the linked `widgets.css`, where merchant CSS overrides them.

Generic advice that doesn't apply here: `static styles` and the `css` tag, `adoptedStyleSheets`, `:host`, `::part` and `::slotted`.

## Where the CSS lives

- **STYLE-01** CSS stays in the linked stylesheet: no `static styles`, no `css` tag, no `adoptedStyleSheets` and no style rules in JavaScript, apart from the host's `display: contents` of STYLE-05. Why: merchant overrides must keep winning the cascade, and `widgets.css` must keep every rule. Check: lint and review.
- **STYLE-02** `src/main.css` and every `*.module.css` file that the merge base has keep their rules, selectors, values and order. A module that the change adds is not covered. Why: merchants override these rules today. Check: contract tests.
- **STYLE-04** Templates import the CSS-module class maps and bind them with `classMap`. Why: the build renames each CSS-module class, so a class written as a string matches no rule of `widgets.css`. Unit tests keep the class names as they are (`classNameStrategy: 'non-scoped'`), so only the build shows that mistake. Check: review.
- **STYLE-05** The host gets `display: contents` through the CSSOM, never by writing the `style` attribute. `LightDomElement` already does it. Why: the host adds no box to the merchant's layout, and a strict `style-src` policy blocks the `style` attribute. Check: unit test.

## Selectors

- **STYLE-06** Selector specificity stays at most `0,3,0`, apart from the `.sr-only` rules scoped by ID. Why: a merchant overrides a widget rule with a selector of the same weight. Check: lint.
- **STYLE-07** No bare type selector, `@layer`, `:where()`, `:host`, `:host-context`, `::part` or `::slotted`. Selectors such as `.info p`, `.buttons > button` and `h2.title` stay allowed. Why: the CSS stays as easy for merchants to override as today. Check: lint.
- **STYLE-08** No `!important` beyond these four: `top` on `.overlay` in `modal-shell.module.css`, and in `payment-plans.module.css` `border-radius` and `outline` on `.knowMore:focus, .knowMore:focus-visible`, and `outline` on `.knowMore.monochrome:focus, .knowMore.monochrome:focus-visible`. Why: a merchant can't override an `!important` rule. Check: tests.
- **STYLE-09** Contract names keep their names and their element types: the `alma-payment-plans-*` and `alma-eligibility-modal-*` classes, the IDs `alma-widget-payment-plans-main-container`, `alma-widget-modal-main-container`, `payment-plans-title` and `payment-info-text`, the `data-testid` values and the 27 custom properties of `widgets.css`. `tests/integration/contract/inventory.json` lists them. Why: merchant CSS and plugin e2e suites select them. Check: contract tests.
