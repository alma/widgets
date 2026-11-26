---
paths:
  - "src/widgets/**"
  - "src/shared/**"
  - "src/main.css"
---

# Styling in Shadow DOM

Each element applies its CSS inside its own shadow root, so the page's CSS rules don't apply to the widget and the widget's rules don't apply to the page. Only inherited properties, custom properties and the root font size cross the boundary, and STYLE-10 and STYLE-11 stop them. Merchants change the widget only through the options of `add()` (ARCH-25). These rules override generic Lit advice where it differs.

Generic advice that doesn't apply here: styling the host through `:host`, parts and `::part`, slots and `::slotted`, and custom properties offered as a theme.

## Where the CSS lives

- **STYLE-01** An element's CSS applies inside its shadow root only. Nothing goes to the page apart from the font declarations, which only work at document level: no other `<style>` or `<link>` in the document, no `document.adoptedStyleSheets`, and no style on an element outside the shadow root, apart from the host's `display` of STYLE-05 and the scroll lock that the open modal sets on the page. Inside the shadow root, no inline style either: no `style` binding, `styleMap` or `element.style` write. Why: the shadow root keeps the page's CSS rules out and ours in, which is what stops merchant CSS from breaking the widget. Chromium ignores a font declared inside a shadow root, so fonts are the one exception. A `style` binding writes the `style` attribute, which a strict `style-src` policy blocks, and the stylesheets stay the one place that holds the widget's look. Check: review.
- **STYLE-10** Each custom property that the CSS declares or reads with `var()` is named `--alma-*` and is declared inside the shadow root, on the first element in it. That element also resets every inherited property with `all: initial`, then sets again the ones the widget needs, `display` included. `all` leaves custom properties alone, so the declarations on that element still apply. No custom property is declared on `:root`, on the host or anywhere else on the page. Why: inherited properties and custom properties cross the shadow boundary, so a value that the page sets on an ancestor would reach the widget. A reset and a declaration inside the root win over it, and the prefix keeps our names apart from the page's. Check: review.
- **STYLE-11** Sizes use `em`, `%` or `px`, never `rem`. Why: `rem` reads the font size of the page's `<html>` element through the shadow boundary, so a merchant's `html { font-size: 62.5% }` would shrink the widget. Check: review.
- **STYLE-05** The host gets `display: contents` through the CSSOM, never by writing the `style` attribute. The base classes of `shared/custom-elements/` do it. Why: the host adds no box to the merchant's layout, and a strict `style-src` policy blocks the `style` attribute. Check: unit test.

## Selectors

- **STYLE-06** Selector specificity stays at most `0,3,0`, apart from the `.sr-only` rules scoped by ID. Why: low, even weights let a state or a variant override a rule of ours without extra selectors or `!important`. Check: lint.
- **STYLE-07** No `:host`, `:host-context`, `::part` or `::slotted`, and no bare type selector, `@layer` or `:where()`. Selectors such as `.info p`, `.buttons > button` and `h2.title` stay allowed. Why: a page rule that targets the host element wins over `:host`, so the reset and the custom properties go on the first element inside the shadow root (STYLE-10). `::part` and `::slotted` serve parts and slots, which the widget doesn't offer (ARCH-25). Bare type selectors reach whatever a later template adds, and `@layer` and `:where()` change which of our rules wins. Check: lint.
- **STYLE-08** No `!important`. Why: inside the shadow root, no page rule competes with ours, and an `!important` rule wins over every later rule of ours, so no state or variant can change it. Check: review.

## Elements still in light DOM

This section goes when the last element moves into its shadow root.

An element that extends `LightDomElement` renders in light DOM, and so does the CSS of the templates it renders. That CSS stays in its CSS modules and in `src/main.css`, which the build ships as `widgets.css` and which declares the custom properties on `:root`. STYLE-03 of `architecture.md` and the rules below describe it, and STYLE-01, STYLE-08, STYLE-10 and STYLE-11 don't apply to it yet. A change to it leaves it there: moving it is a change of its own.

- **STYLE-04** Templates import the CSS-module class maps and bind them with `classMap`. Why: the build renames each CSS-module class, so a class written as a string matches no rule of `widgets.css`. Unit tests keep the class names as they are (`classNameStrategy: 'non-scoped'`), so only the build shows that mistake. Check: review.

The CSS in light DOM keeps its current `!important` uses, which `src/css-limits.test.ts` caps, and adds none. Three keep merchant CSS from removing the focus outline of the logo button that opens the modal, and one works around Chrome before 69.
