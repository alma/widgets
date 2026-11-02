---
paths:
  - "src/widgets/**"
  - "src/shared/ui/**"
---

# Lit and light DOM in `src/widgets/` and `src/shared/ui/`

These rules cover 4.x only and override generic Lit advice, which assumes Shadow DOM. In 4.x the widget renders in light DOM, so merchant CSS keeps styling it, and the port changes nothing that merchants can see.

Generic advice that doesn't apply here: Shadow DOM and `attachShadow`, the `@customElement` decorator, `CustomEvent`s, reflected attributes, slots, lazy loading with `import()`, and `unsafeHTML` for rich text.

## Elements

- **ARCH-06** An element extends `LightDomElement` from `shared/ui/lit/`, never `LitElement`, and never calls `attachShadow`. Only the base class itself extends `LitElement`. Why: a shadow root would stop merchant CSS and `widgets.css` from styling the widget. Check: lint.
- **ARCH-07** A tag registers with the `safeCustomElement` decorator from `shared/ui/lit/`, never with `@customElement` or `customElements.define`. Why: when two bundles load on one page, the first definition wins and the second warns instead of throwing. Check: lint.
- **ARCH-10** Element properties are frozen for 4.x: none is added, removed or renamed, and none changes its type. A unit test per element pins the list. Why: a later 4.x bundle on the same page sets properties on the element class that an earlier bundle registered. Check: review.
- **ARCH-11** A React sub-component becomes a template function in a `.template.ts` file, with its `.stories.ts` file next to it. A React hook becomes a reactive controller in a `.controller.ts` file. Why: a template is a pure function that Storybook renders before any element uses it. Check: review.
- **ARCH-12** Each timer, listener added with `addEventListener` or `addListener`, observer, `matchMedia` query and animation frame stops when the host disconnects and starts again when it reconnects. Keep each timer and frame id, nested ones included, and cancel it on disconnect. Remove each listener with the same function reference, disconnect each observer, and set up queries and listeners in `connectedCallback` or `hostConnected`, not in the constructor. Why: master leaks them in an emptied container, and the port must not leak more. Check: contract tests and review.

## Merchant contract

- **ARCH-08** The port adds no option, event, attribute or public tag, and the DOM inside the merchant's container matches master: same elements, nesting and ARIA attributes. Why: merchant CSS, plugin e2e suites and integrations select that DOM. Check: contract tests.
- **ARCH-09** No `new CustomEvent` and no `reflect: true`. A widget reaches the page only through the callbacks of its options. Why: the port adds no event or attribute, and either one breaks the 4.x contract with merchants. Check: lint.
- **ARCH-13** No exception reaches the merchant's page. A misconfiguration logs one console warning prefixed `[Alma widgets]`. Why: an error in the widget must never break the merchant's checkout. Check: contract tests.
- **ARCH-19** `onClose` and `onModalClose` receive DOM events with the four members that preact/compat adds: `persist()`, `isPropagationStopped()`, `isDefaultPrevented()` and `nativeEvent`. Why: merchant callbacks may call them. Check: contract tests.

## Code

- **ARCH-04** A message is declared with an `id` and a `defaultMessage` in a `*.messages.ts` file next to the code that formats it. Tests and stories reuse the descriptors and never declare a message. Why: `npm run translations:extract` reads every file under `src/` and must give master's `messages.json`. Check: review.
- **ARCH-14** No `unsafeHTML`, `unsafeSVG` or other unsafe directive, no `static-html`, and no `innerHTML` assignment. Rich text becomes Lit templates. Why: they skip Lit's escaping of translated text and options. Check: lint.

## Names

Lit sets no naming rule for templates, so these follow lit.dev's examples and the code already in `src/`. No lint rule checks them.

- **NAME-01** An element class takes the PascalCase form of its full tag, so `alma-payment-plans` becomes `AlmaPaymentPlans`. Its file adds the tag to `HTMLElementTagNameMap`. Why: the class name matches the tag, and `document.createElement` and `querySelector` return the element's type. The map is types only, so it adds nothing to the bundle. Check: review.
- **NAME-02** The type of an element's properties is `interface <Element>Properties`, such as `AlmaPaymentPlansProperties`. Why: it is the frozen list of ARCH-10, and the name keeps it apart from template parameters. Check: review.
- **NAME-03** A template function has a camelCase name that ends in `Template`, such as `loaderTemplate` in `loader.template.ts`. Never PascalCase. Why: PascalCase marks a class or a React component, and a template is a function with no state or lifecycle. Check: review.
- **NAME-04** A template takes its parameters as one object, typed with an exported `interface <Name>Params` in the template file, such as `LoaderParams`. No `I` prefix and no `Template` in the name. Why: an object keeps optional values readable at the call site, and `Params` keeps template inputs apart from an element's reactive properties of NAME-02. Check: review.
- **NAME-05** A part of an element's template that stays inside the element is a `private render<Part>()` method, such as `renderPlans()`. A part that has its own stories is a template function instead (ARCH-11). Why: lit.dev uses this form, and the name tells it apart from the exported templates. Check: review.
- **NAME-06** A controller class is `<Name>Controller` in `<name>.controller.ts`, and the host type it needs is `<Name>Host`, such as `EligibilityController` and `EligibilityHost`. Why: Lit names controllers this way, and `src/` already does. Check: review.
- **NAME-07** Internal reactive state is a `@state() private` field without the underscore of lit.dev's examples, such as `@state() private activeIndex`. Why: the rest of `src/` writes private members as `private` or `private readonly`, with no underscore. Check: review.
- **NAME-08** A template imports its own CSS module as `styles`. A `.messages.ts` file exports `<part>Messages` objects built with `defineMessages`, such as `legalMentionsMessages`. Why: `src/` already uses these names. Check: review.
