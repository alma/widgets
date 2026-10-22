---
paths:
  - "src/widgets/**"
  - "src/shared/ui/**"
  - "src/styles/**"
---

# Styling in light DOM

These rules cover 4.x only and override generic Lit advice, which assumes Shadow DOM. Merchants restyle the widget with their own CSS, so the rules stay in the linked `widgets.css`, as easy to override as master's.

Generic advice that doesn't apply here: `static styles` and the `css` tag, `adoptedStyleSheets`, `:host`, `::part` and `::slotted`.

## Where the CSS lives

- **STYLE-01** CSS stays in the linked stylesheet: no `static styles`, no `css` tag, no `adoptedStyleSheets` and no style rules in JavaScript. Why: merchant overrides must keep winning the cascade, and `widgets.css` must keep every rule. Check: lint and review.
- **STYLE-02** `src/styles/main.css` and every `*.module.css` file keep master's content. Why: merchants override these rules today. Check: contract tests.
- **STYLE-03** `src/styles/main.css` stays the first CSS import of `src/index.ts`. Why: `widgets.css` keeps master's rule order, which merchant overrides rely on. Check: contract tests.
- **STYLE-04** Templates import the CSS-module class maps and bind them with `classMap`. Why: `classMap` replaces `classnames`, which the bundle dropped. Check: review.
- **STYLE-05** The host gets `display: contents` through the CSSOM, never by writing the `style` attribute. `LightDomElement` already does it. Why: the host adds no box to the merchant's layout, and a strict `style-src` policy blocks the `style` attribute. Check: unit test.

## Selectors

- **STYLE-06** Selector specificity stays at most `0,3,0`, apart from master's `.sr-only` rules scoped by ID. Why: a merchant overrides a widget rule with a selector of the same weight. Check: lint.
- **STYLE-07** No bare type selector, `@layer`, `:where()`, `:host`, `:host-context`, `::part` or `::slotted`. Selectors such as `.info p`, `.buttons > button` and `h2.title` stay allowed. Why: the CSS stays as easy for merchants to override as today. Check: lint.
- **STYLE-08** No `!important` beyond the four that master's CSS already has. Why: a merchant can't override an `!important` rule. Check: tests.
- **STYLE-09** Contract names keep their names and their element types: the `alma-payment-plans-*` and `alma-eligibility-modal-*` classes, the IDs `alma-widget-payment-plans-main-container`, `alma-widget-modal-main-container`, `payment-plans-title` and `payment-info-text`, the `data-testid` values and the 27 custom properties of `widgets.css`. `tests/integration/contract/inventory.json` lists them. Why: merchant CSS and plugin e2e suites select them. Check: contract tests.
