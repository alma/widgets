---
paths:
  - "src/widgets/**"
  - "src/shared/ui/**"
---

# Lit and light DOM in `src/widgets/` and `src/shared/ui/`

These rules cover 4.x only and override generic Lit advice, which assumes Shadow DOM. In 4.x the widget renders in light DOM, so merchant CSS keeps styling it, and the port changes nothing that merchants can see.

Generic advice that doesn't apply here: Shadow DOM and `attachShadow`, the `@customElement` decorator, `CustomEvent`s, reflected attributes, slots, lazy loading with `import()`, and `unsafeHTML` for rich text.

## Placement

- **LAYER-02** The only import from one widget folder to another is `widgets/payment-plans/` importing `widgets/eligibility-modal/index.ts`, to open the modal. Why: the rest of the modal stays private to its folder. Check: lint.
- **LAYER-04** A business rule goes in `domain/`. A file that one widget uses goes in that widget's folder. Code that both widgets use and that isn't a business rule goes in `widgets/common/`, and nothing else goes there. Code with no business meaning goes in `shared/`. Why: a file's folder says what it is and who uses it. Check: review.
- **LAYER-06** Lit code lives only in `widgets/` and `shared/ui/`. Why: the other layers stay plain TypeScript, which the 5.0 UI rewrite keeps. Check: lint in `domain/`, review elsewhere.

## Elements

- **ARCH-06** An element extends `LightDomElement` from `shared/ui/lit/`, never `LitElement`, and never calls `attachShadow`. Only the base class itself extends `LitElement`. Why: a shadow root would stop merchant CSS and `widgets.css` from styling the widget. Check: lint.
- **ARCH-07** A tag registers with the `safeCustomElement` decorator from `shared/ui/lit/`, never with `@customElement` or `customElements.define`. Why: when two bundles load on one page, the first definition wins and the second warns instead of throwing. Check: lint.
- **ARCH-10** Element properties are frozen for 4.x: none is added, removed or renamed, and none changes its type. A unit test per element pins the list. Why: a later 4.x bundle on the same page sets properties on the element class that an earlier bundle registered. Check: review.
- **ARCH-11** A React sub-component becomes a template function in a `.template.ts` file, with its `.stories.ts` file next to it. A React hook becomes a reactive controller in a `.controller.ts` file. Why: a template is a pure function that Storybook renders before any element uses it. Check: review.
- **ARCH-12** Each timer, listener, `matchMedia` query and animation frame stops when the host disconnects and starts again when it reconnects. Why: master leaks them in an emptied container, and the port must not leak more. Check: contract tests and review.

## Merchant contract

- **ARCH-08** The port adds no option, event, attribute or public tag, and the DOM inside the merchant's container matches master: same elements, nesting and ARIA attributes. Why: merchant CSS, plugin e2e suites and integrations select that DOM. Check: contract tests.
- **ARCH-09** No `new CustomEvent` and no `reflect: true`. A widget reaches the page only through the callbacks of its options. Why: the port adds no event or attribute, and either one breaks the 4.x contract with merchants. Check: lint.
- **ARCH-13** No exception reaches the merchant's page. A misconfiguration logs one console warning prefixed `[Alma widgets]`. Why: an error in the widget must never break the merchant's checkout. Check: contract tests.
- **ARCH-19** `onClose` and `onModalClose` receive DOM events with the four members that preact/compat adds: `persist()`, `isPropagationStopped()`, `isDefaultPrevented()` and `nativeEvent`. Why: merchant callbacks may call them. Check: contract tests.
- **STYLE-09** Contract names keep their names and their element types: the `alma-payment-plans-*` and `alma-eligibility-modal-*` classes, the IDs `alma-widget-payment-plans-main-container`, `alma-widget-modal-main-container`, `payment-plans-title` and `payment-info-text`, the `data-testid` values and the 27 custom properties of `widgets.css`. `tests/integration/contract/inventory.json` lists them. Why: merchant CSS and plugin e2e suites select them. Check: contract tests.

## Code

- **ARCH-03** No import of `react`, `react-dom`, `preact`, `react-intl`, `classnames`, `date-fns`, `react-modal`, `react-responsive`, `@testing-library/react` or `jest-axe`. Use `classMap`, `shared/lib/date.ts`, `shared/i18n/` and `vitest-axe` instead. Why: the bundle drops React and its libraries. Check: lint.
- **ARCH-04** A message is declared with an `id` and a `defaultMessage` in a `*.messages.ts` file next to the code that formats it. Tests and stories reuse the descriptors and never declare a message. Why: `npm run translations:extract` reads every file under `src/` and must give master's `messages.json`. Check: review.
- **ARCH-05** Dates go through `shared/lib/date.ts`, which works in local time like master. Never pass a `timeZone` option to `Intl`. Why: a `timeZone` would change the due dates that shoppers see. Check: lint.
- **ARCH-14** No `unsafeHTML`, `unsafeSVG` or other unsafe directive, no `static-html`, and no `innerHTML` assignment. Rich text becomes Lit templates. Why: they skip Lit's escaping of translated text and options. Check: lint.
- **ARCH-15** No dynamic `import()`. Everything ships in the one bundle. Why: merchants load the five published files by name, and the UMD file is one classic script. Check: lint.
