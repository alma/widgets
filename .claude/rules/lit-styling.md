---
paths:
  - "src/widgets/**"
  - "src/shared/**"
  - "src/main.css"
---

# Styling in Shadow DOM

Each element applies its CSS inside its own shadow root, so the page's CSS rules don't apply to the widget and the widget's rules don't apply to the page. Only inherited properties and custom properties cross the boundary, and STYLE-10 stops them. Merchants change the widget only through the options of `add()` (ARCH-25). These rules override generic Lit advice where it differs.

Generic advice that doesn't apply here: styling the host through `:host`, parts and `::part`, slots and `::slotted`, and custom properties offered as a theme.

Until an element moves into its shadow root, its CSS stays in its CSS modules and in `src/main.css`, which the build ships as `widgets.css` and which declares the custom properties on `:root`. STYLE-03 of `architecture.md`, STYLE-04 and STYLE-05 describe that CSS. A change to it leaves it there: moving it is a change of its own.

## Where the CSS lives

- **STYLE-01** An element's CSS applies inside its shadow root only. Nothing goes to the page: no `<style>` or `<link>` in the document, no `document.adoptedStyleSheets`, and no style on an element outside the shadow root, apart from the host's `display` of STYLE-05 and the scroll lock that the open modal sets on the page. Inside the shadow root, no inline style either: no `style` binding, `styleMap` or `element.style` write. Why: the shadow root keeps the page's CSS rules out and ours in, which is what stops merchant CSS from breaking the widget. A `style` binding writes the `style` attribute, which a strict `style-src` policy blocks, and the stylesheets stay the one place that holds the widget's look. Check: review.
- **STYLE-10** Each custom property that the CSS declares or reads with `var()` is named `--alma-*` and is declared inside the shadow root, on the first element in it. That element also resets the inherited properties, such as `font-family`, `font-size`, `line-height` and `color`, before the widget sets its own. No custom property is declared on `:root`, on the host or anywhere else on the page. Why: inherited properties and custom properties cross the shadow boundary, so a value that the page sets on an ancestor would reach the widget. A reset and a declaration inside the root win over it, and the prefix keeps our names apart from the page's. Check: review.
- **STYLE-04** Templates import the CSS-module class maps and bind them with `classMap`. Why: the build renames each CSS-module class, so a class written as a string matches no rule of `widgets.css`. Unit tests keep the class names as they are (`classNameStrategy: 'non-scoped'`), so only the build shows that mistake. Check: review.
- **STYLE-05** The host gets `display: contents` through the CSSOM, never by writing the `style` attribute. `LightDomElement` already does it. Why: the host adds no box to the merchant's layout, and a strict `style-src` policy blocks the `style` attribute. Check: unit test.

## Selectors

- **STYLE-06** Selector specificity stays at most `0,3,0`, apart from the `.sr-only` rules scoped by ID. Why: low, even weights let a state or a variant override a rule of ours without extra selectors or `!important`. Check: lint.
- **STYLE-07** No `:host`, `:host-context`, `::part` or `::slotted`, and no bare type selector, `@layer` or `:where()`. Selectors such as `.info p`, `.buttons > button` and `h2.title` stay allowed. Why: a page rule that targets the host element wins over `:host`, so the reset and the custom properties go on the first element inside the shadow root (STYLE-10). `::part` and `::slotted` serve parts and slots, which the widget doesn't offer (ARCH-25). Bare type selectors reach whatever a later template adds, and `@layer` and `:where()` change which of our rules wins. Check: lint.
- **STYLE-08** No `!important` beyond these four: `top` on `.overlay` in `modal-shell.module.css`, and in `payment-plans.module.css` `border-radius` and `outline` on `.knowMore:focus, .knowMore:focus-visible`, and `outline` on `.knowMore.monochrome:focus, .knowMore.monochrome:focus-visible`. Why: an `!important` rule wins over every later rule of ours, so no state or variant can change it. Check: tests.
