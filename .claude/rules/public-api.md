---
paths:
  - "src/public-api/**"
  - "src/index.ts"
---

# The merchant contract in `src/public-api/` and `src/index.ts`

These rules cover 4.x only and override generic Lit advice. Merchants and Alma's e-commerce plugins load the widget from jsDelivr or npm and call `Alma.Widgets.initialize(merchantId, mode).add(...)`. Their integrations must keep working without any change, and that goal overrides every other one.

Generic advice that doesn't apply here: public custom element tags, attributes and events as the API, an `exports` field in `package.json`, and a custom elements manifest. All of them wait for 5.0.

## API

- **ARCH-16** The public API stays the same: `Alma.Widgets` with `initialize`, `PaymentPlans` and `Modal`, `Alma.Utils` with `priceToCents`, `priceFromCents` and `formatCents`, and `Alma.ApiMode`. Why: merchant pages and plugins call them. Check: contract tests.
- **ARCH-17** `add(PaymentPlans)` returns `undefined`. `add(Modal)` returns `{ open, close }`, even when the container doesn't exist. A second `add()` on the same container replaces the widget. Why: integrations rely on these return values and on a second `add()` to refresh a widget. Check: contract tests.
- **ARCH-18** Every option keeps its default: `monochrome` is `true`, `locale` is `'en'`, `hideBorder` is `false`, and `transitionDelay` is 5500 ms, turns the animation off when negative, and becomes 1000 ms from 0 to 999 ms. Why: a merchant who sets no option must see today's widget. Check: contract tests.
- **ARCH-19** `onClose` and `onModalClose` receive DOM events with the four members that preact/compat adds: `persist()`, `isPropagationStopped()`, `isDefaultPrevented()` and `nativeEvent`. Why: merchant callbacks may call them. Check: contract tests.
- **ARCH-13** No exception reaches the merchant's page. A misconfiguration logs one console warning prefixed `[Alma widgets]`. Why: an error in the widget must never break the merchant's checkout. Check: contract tests.
- **ARCH-08** The port adds no option, event, attribute or public tag, and the DOM inside the merchant's container matches master: same elements, nesting and ARIA attributes. Why: merchant CSS, plugin e2e suites and integrations select that DOM. Check: contract tests.

## Files

- **ARCH-20** The five published files keep their names: `widgets.js`, `widgets.umd.js`, `widgets-wc.umd.js`, `widgets.css` and `widgets.min.css`. The UMD file sets `window.Alma` as a classic script, keeps what `window.Alma` already holds, works under CommonJS and defines an AMD module. Why: merchants and plugins load these files by name, and Magento 2 loads the bundle through RequireJS. Check: contract tests.
