---
paths:
  - "src/public-api/**"
  - "src/index.ts"
---

# The merchant contract in `src/public-api/` and `src/index.ts`

These rules override generic Lit advice. Merchants and Alma's e-commerce plugins load the widget from jsDelivr or npm and call `Alma.Widgets.initialize(merchantId, mode).add(...)`. That JavaScript API is the merchant contract: the functions, the options of `add()` and their defaults, the callbacks, the return values, the published files and the tag names. The DOM inside the tags, the classes, the IDs and the content of the CSS aren't part of it. An integration keeps working without any change across the releases of one major version, and that goal overrides every other one. Only a major release changes the contract.

Generic advice that doesn't apply here: public custom element tags, attributes and events as the API, an `exports` field in `package.json`, and a custom elements manifest. The contract stays the JavaScript API.

## API

- **ARCH-16** The public API stays the same: `Alma.Widgets` with `initialize`, `PaymentPlans` and `Modal`, `Alma.Utils` with `priceToCents`, `priceFromCents` and `formatCents`, and `Alma.ApiMode`. Why: merchant pages and plugins call them. Check: unit tests and contract tests.
- **ARCH-17** `add(PaymentPlans)` returns `undefined`. `add(Modal)` returns `{ open, close }`, even when the container doesn't exist. A second `add()` on the same container replaces the widget. Why: integrations rely on these return values and on a second `add()` to refresh a widget. Check: unit tests.
- **ARCH-18** Every option keeps its default: `monochrome` is `true`, `locale` is `'en'`, `hideBorder` is `false`, and `transitionDelay` is 5500 ms, turns the animation off when negative, and becomes 1000 ms from 0 to 999 ms. Why: a merchant who sets no option keeps the behaviour they had. Check: unit tests.
- **ARCH-19** `onClose` and `onModalClose` receive DOM events with the four members that preact/compat adds: `persist()`, `isPropagationStopped()`, `isDefaultPrevented()` and `nativeEvent`. Why: merchant callbacks may call them. Check: unit tests.
- **ARCH-13** No exception reaches the merchant's page. A misconfiguration logs one console warning prefixed `[Alma widgets]`. Why: an error in the widget must never break the merchant's checkout. Check: unit tests and contract tests.
- **ARCH-25** Merchants change the widget only through the options of `add()`. The widget offers them no other hook: no `part` attribute, no slot, no custom property they can set, and no class or ID that the docs tell them to style. Why: the shadow root keeps merchant CSS out, so the widget's look stays ours to change in any release, and an option is a hook that every release keeps working. Check: review.
- **ARCH-08** No option, event, attribute or public tag is added. Why: anything added becomes part of the merchant contract that every later release has to keep. Check: review, and the unit test of ARCH-10 that pins each element's properties.

## Files

- **ARCH-20** The five published files keep their names: `widgets.js`, `widgets.umd.js`, `widgets-wc.umd.js`, `widgets.css` and `widgets.min.css`. The UMD file sets `window.Alma` as a classic script, keeps what `window.Alma` already holds, works under CommonJS and defines an AMD module. Why: merchants and plugins load these files by name, and Magento 2 loads the bundle through RequireJS. Check: contract tests.
