---
paths:
  - "src/widgets/**"
  - "src/shared/**"
---

# Lit and Shadow DOM in `src/widgets/` and `src/shared/`

Each element renders in an open shadow root, so the page's CSS rules don't apply to it, and merchants change the widget only through the options of `add()` (ARCH-25). These rules override generic Lit advice where it differs.

Generic advice that doesn't apply here: the `@customElement` decorator, `CustomEvent`s, reflected attributes, slots, lazy loading with `import()`, and `unsafeHTML` for rich text.

## Elements

- **ARCH-06** An element renders in an open shadow root, through a base class of `shared/custom-elements/`. Only those base classes extend `LitElement`. Why: the page's CSS rules stop at the shadow root, so with the reset of STYLE-10 a merchant stylesheet can't change or break the widget, and an open root still lets tests reach it through `shadowRoot`. Check: lint for `extends LitElement`, and a unit test per element that checks `shadowRoot?.mode === 'open'`.
- **ARCH-07** A tag registers with the `safeCustomElement` decorator from `shared/custom-elements/`, never with `@customElement` or `customElements.define`. Why: when two bundles load on one page, the first definition wins and the second warns instead of throwing. The tags stay `alma-payment-plans` and `alma-eligibility-modal` in every major version, so a page that loads a 4.x bundle and then a 5.x bundle renders both widgets with the 4.x code. Check: lint.
- **ARCH-10** An element property is never removed, renamed or retyped. A new property has a default, so the element still works when a bundle that doesn't know it sets the others. A unit test per element pins the list. Why: when two bundles load on one page, the first bundle's class stays registered (ARCH-07), and the second bundle sets its properties on that class. Check: review.
- **ARCH-11** A part of a widget's markup that another file or a test renders is a template function in a `.template.ts` file. A part that stays inside one element is a `private render<Part>()` method (NAME-05). Logic with state or a lifecycle is a reactive controller in a `.controller.ts` file. Why: a template is a pure function that a test renders before any element uses it. Check: review.
- **ARCH-24** A variant is an output that the component's own branches or parameters decide. An input that only changes what a lower template renders is a variant of that lower template, and two inputs with the same output are one variant. An element or a template gets a `.stories.ts` file only when it has two or more variants, with one story per variant, and a story never repeats a variant that the story of a lower template already shows. Why: the unit tests already check each template's output and run axe, so a story is worth keeping only when it shows a difference that someone needs to see. Check: review.
- **ARCH-12** Each timer, listener added with `addEventListener` or `addListener`, observer, `matchMedia` query and animation frame stops when the host disconnects and starts again when it reconnects. Keep each timer and frame id, nested ones included, and cancel it on disconnect. Remove each listener with the same function reference, disconnect each observer, and set up queries and listeners in `connectedCallback` or `hostConnected`, not in the constructor. Why: a widget whose container the merchant empties must stop running. Check: unit tests and review.

## Merchant contract

- **ARCH-25** Merchants change the widget only through the options of `add()`. The widget offers them no other hook: no `part` attribute, no slot, no custom property they can set, and no class or ID that the docs tell them to style. Why: the shadow root keeps merchant CSS out, so the widget's look stays ours to change in any release, and an option is a hook that every release keeps working. Check: review.
- **ARCH-08** An option, a callback, the event that a callback receives, or a tag may be added when it is optional and its default keeps the current behaviour. `documentation.md` describes it, and the release is a minor one. Removing or renaming one, or changing its type or default, needs a major release. Why: an integration keeps working across the releases of one major version. Check: review, and the unit tests of ARCH-16 to ARCH-18.
- **ARCH-09** No `new CustomEvent` and no `reflect: true`. A widget reaches the page only through the callbacks of its options. Why: an event or a reflected attribute adds to the contract with merchants. Check: review.
- **ARCH-13** No exception reaches the merchant's page. A misconfiguration logs one console warning prefixed `[Alma widgets]`. Why: an error in the widget must never break the merchant's checkout. Check: unit tests and contract tests.
- **ARCH-19** `onClose` and `onModalClose` receive DOM events with the four members that preact/compat adds: `persist()`, `isPropagationStopped()`, `isDefaultPrevented()` and `nativeEvent`. Why: merchant callbacks may call them. Check: unit tests.

## Code

- **ARCH-04** A message is declared with an `id` and a `defaultMessage` in a `*.messages.ts` file next to the code that formats it. When several files format the same message, each file declares its own copy, with the same `id` and `defaultMessage`. Tests and stories reuse the descriptors and never declare a message. Why: `npm run translations:extract` reads every file under `src/` to write `messages.json`, which Crowdin translates. It fails when two copies of an id differ. Check: `define-messages.test.ts` and review.
- **ARCH-14** No `unsafeHTML`, `unsafeSVG` or other unsafe directive, no `static-html`, and no `innerHTML` assignment. Rich text becomes Lit templates. Why: they skip Lit's escaping of translated text and options. Check: lint.

## Names

Lit sets no naming rule for templates, so these follow lit.dev's examples and the code already in `src/`. No lint rule checks them.

- **NAME-01** An element class takes the PascalCase form of its full tag, so `alma-payment-plans` becomes `AlmaPaymentPlans`. Its file adds the tag to `HTMLElementTagNameMap`. Why: the class name matches the tag, and `document.createElement` and `querySelector` return the element's type. The map is types only, so it adds nothing to the bundle. Check: review.
- **NAME-02** The type of an element's properties is `interface <Element>Properties`, such as `AlmaPaymentPlansProperties`. Why: it is the list that ARCH-10 pins, and the name keeps it apart from template parameters. Check: review.
- **NAME-03** A template function has a camelCase name that ends in `Template`, such as `loaderTemplate` in `loader.template.ts`. Never PascalCase. Why: PascalCase marks a class, and a template is a function with no state or lifecycle. Check: review.
- **NAME-04** A template takes its parameters as one object, typed with an exported `interface <Name>Params` in the template file, such as `LoaderParams`. No `I` prefix and no `Template` in the name. Why: an object keeps optional values readable at the call site, and `Params` keeps template inputs apart from an element's reactive properties of NAME-02. Check: review.
- **NAME-05** A part of an element's template that stays inside the element is a `private render<Part>()` method, such as `renderPlans()`. A part in its own `.template.ts` file is a template function instead (ARCH-11). Why: lit.dev uses this form, and the name tells it apart from the exported templates. Check: review.
- **NAME-06** A controller class is `<Name>Controller` in `<name>.controller.ts`, and the host type it needs is `<Name>Host`, such as `EligibilityController` and `EligibilityHost`. Why: Lit names controllers this way, and `src/` already does. Check: review.
- **NAME-07** Internal reactive state is a `@state() private` field without the underscore of lit.dev's examples, such as `@state() private activeIndex`. Why: the rest of `src/` writes private members as `private` or `private readonly`, with no underscore. Check: review.
- **NAME-08** A template imports its own CSS module as `styles`. A `.messages.ts` file exports `<part>Messages` objects built with `defineMessages`, such as `legalMentionsMessages`. Why: `src/` already uses these names. Check: review.

## Elements still in light DOM

This section goes when the last element moves into its shadow root.

An element that extends `LightDomElement` renders in light DOM, and lint still bans `attachShadow`, `static styles` and `adoptedStyleSheets`. A change to such an element leaves it in light DOM: moving it is a change of its own, and that change adds the unit test of ARCH-06. Until the last one moves, `documentation.md` still tells merchants that they can style the `alma-` classes.
