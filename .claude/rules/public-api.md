---
paths:
  - "src/public-api/**"
  - "src/index.ts"
---

# The merchant contract in `src/public-api/` and `src/index.ts`

These rules override generic Lit advice. Merchants and Alma's e-commerce plugins load the widget from jsDelivr or npm and call `Alma.Widgets.initialize(merchantId, mode).add(...)`. That JavaScript API is the merchant contract: the functions, the options of `add()` and their defaults, the callbacks, the return values, the published files and the tag names. The DOM inside the tags, the classes, the IDs and the content of the CSS aren't part of it. An integration keeps working without any change across the releases of one major version, and that goal overrides every other one. Only a major release removes or changes a part of the contract. A minor release may add an optional one.

Generic advice that doesn't apply here: configuring an element through its HTML attributes, listening to its DOM events, and a custom elements manifest. The tag names are part of the contract, but merchants configure the elements only through `add()`.

## API

- **ARCH-16** The public API stays the same: `Alma.Widgets` with `initialize`, `PaymentPlans` and `Modal`, `Alma.Utils` with `priceToCents`, `priceFromCents` and `formatCents`, and `Alma.ApiMode`. Why: merchant pages and plugins call them. Check: unit tests and contract tests.
- **ARCH-17** `add(PaymentPlans)` returns `undefined`. `add(Modal)` returns `{ open, close }`, even when the container doesn't exist. A second `add()` on the same container replaces the widget. Why: integrations rely on these return values and on a second `add()` to refresh a widget. Check: unit tests.
- **ARCH-18** Every option keeps its default: `monochrome` is `true`, `locale` is `'en'`, `hideBorder` is `false`, and `transitionDelay` is 5500 ms, turns the animation off when negative, and becomes 1000 ms from 0 to 999 ms. Why: a merchant who sets no option keeps the behaviour they had. Check: unit tests.
- **ARCH-19** `onClose` and `onModalClose` receive DOM events with the four members that preact/compat adds: `persist()`, `isPropagationStopped()`, `isDefaultPrevented()` and `nativeEvent`. Why: merchant callbacks may call them. Check: unit tests.
- **ARCH-13** No exception reaches the merchant's page. A misconfiguration logs one console warning prefixed `[Alma widgets]`. Why: an error in the widget must never break the merchant's checkout. Check: unit tests and contract tests.
- **ARCH-25** Merchants change the widget only through the options of `add()`. The widget offers them no other hook: no `part` attribute, no slot, no custom property they can set, and no class or ID that the docs tell them to style. Why: the shadow root keeps merchant CSS out, so the widget's look stays ours to change in any release, and an option is a hook that every release keeps working. Check: review.
- **ARCH-08** An option, a callback, the event that a callback receives, or a tag may be added when it is optional and its default keeps the current behaviour. `documentation.md` describes it, and the release is a minor one. Removing or renaming one, or changing its type or default, needs a major release. Why: an integration keeps working across the releases of one major version. Check: review, and the unit tests of ARCH-16 to ARCH-18.

## Files

- **ARCH-20** The five published files keep their names: `widgets.js`, `widgets.umd.js`, `widgets-wc.umd.js`, `widgets.css` and `widgets.min.css`. The UMD file sets `window.Alma` as a classic script, keeps what `window.Alma` already holds, defines an AMD module, and fills `module.exports` when a loader runs it as a script. The package's `exports` map sets both UMD files to `null`, because Node and bundlers load a `.js` file of this package as an ES module, and the UMD file would then export nothing. Why: merchants and plugins load these files by name, and Magento 2 loads the bundle through RequireJS. Check: contract tests, and review for `package.json`.
