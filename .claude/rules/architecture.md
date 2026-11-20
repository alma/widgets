---
paths:
  - "src/**"
---

# Architecture of `src/`

The code in `src/` sits in five layers. Each rule gives its reason and its check: lint, a test or review. A lint violation fails `npm run lint` and the pre-commit hook.

## Rule files

Claude Code loads a rule file only after Claude reads, edits or writes a file under its paths, and for a new file only after the first Write. Read the matching files before you create a file.

| Folder | Rule files, on top of this one |
| --- | --- |
| `src/domain/`, `src/lib/http.ts` | `domain.md` |
| `src/widgets/`, `src/shared/` | `widgets.md`, `lit-styling.md`, `lit-accessibility.md` |
| `src/public-api/`, `src/index.ts` | `public-api.md` |
| `src/main.css` | `lit-styling.md` |
| `src/modal.browser.test.ts` | `lit-accessibility.md` |

## Source layout

```text
src/
  index.ts                     Vite library entry, builds window.Alma
  main.css                     the first rules of widgets.css
  env.d.ts                     Vite client types and the CSS module declaration
  css-limits.test.ts           caps !important at the four of STYLE-08
  modal.browser.test.ts        the only browser test file
  public-api/                  merchant contract: initialize(), add(), modal handle, Alma.Utils, public types
  widgets/
    payment-plans/             <alma-payment-plans>, with templates/, controllers/ and utils/
    eligibility-modal/         <alma-eligibility-modal>, with templates/, controllers/ and utils/
  shared/                      Lit code that both widgets use
    i18n/                      createIntl, message definitions, rich text, Locale
    controllers/               eligibility and media query controllers
    custom-elements/           LightDomElement and safeCustomElement
    utils/                     Lit helpers: class names, SVG IDs
    templates/                 Alma logo, card logos, icons
  domain/                      plans: the model, the eligibility request, the plan rules
    plans.types.ts             the plan model
    api/                       eligibility request and one-hour cache
    utils/                     plan kinds, regulatory figures, filter and sort
  lib/                         warning, price, date, hash, HTTP, event and matchMedia helpers
  config/                      values the build injects
  intl/                        Crowdin catalogues
  test/                        setup files, fixtures/, msw/, storybook/ and utils/
```

Git keeps no empty folder, so a folder appears with its first file.

"api" has two meanings. `public-api/` is the JavaScript API that merchants call. `domain/api/` is the client for Alma's HTTP API.

## Layers and imports

| Layer | Folder | Holds | May import |
| --- | --- | --- | --- |
| 5 | `public-api/` | the merchant contract | every layer below |
| 4 | `widgets/` | the two elements | `shared/`, `domain/`, `lib/`, `config/` |
| 3 | `shared/` | Lit code that both widgets use | `domain/`, `lib/`, `config/`, the catalogues in `intl/` |
| 2 | `domain/` | the plans: model, eligibility request and cache, plan rules | `lib/`, `config/` |
| 1 | `lib/` | generic helpers with no business meaning | nothing else in `src/` |
| 1 | `config/` | values the build injects | nothing else in `src/` |

`LAYERS` in `.eslintrc.cjs` lists the layers in this order, and the lint config generates its zones from that list.

- **LAYER-01** Imports go downward only: a file imports from its own folder and from the layers below it. The folders of one layer don't import each other, so `lib/` and `config/` stay apart, and so do the two widgets apart from LAYER-02. Why: a layer changes without touching the layers below it. Check: lint.
- **LAYER-02** The only import from one widget folder to another is `widgets/payment-plans/` importing `widgets/eligibility-modal/controllers/plans-modal.controller.ts`, to open the modal. Why: the rest of the modal stays private to its folder. Check: lint.
- **LAYER-03** Only `src/index.ts` imports `public-api/`, and `src/index.ts` imports only `main.css` and `public-api/`. Each widget declares the types of its own element properties. Why: the merchant contract sits on top, and nothing below it depends on it. Check: lint.
- **LAYER-04** A file that one widget uses goes in that widget's folder. A file that knows what a plan is, or talks to Alma's API, goes in `domain/`: the API client in `domain/api/`, the plan rules in `domain/utils/`. Lit code that both widgets use goes in `shared/`. Generic code with no Lit goes in `lib/`. Generic helpers that work with Lit go in `shared/utils/`, such as `class-name.ts`, which returns a `ClassInfo`. `config/` holds the values the build injects (`import.meta.env`), each read once with its fallback. Business constants, option defaults and Alma's URLs stay with their code. A constant goes as low as its lowest user. Why: a file's folder says what it is and who uses it. Check: review.

Tests, stories and `src/test/` (`*.test.ts`, `*.stories.ts`) put the layers together, so they may import any layer, `@/index` and `public-api/` included. The import rule skips them. Tests in `lib/`, `config/` and `domain/` still cannot import Lit.

## Inside a folder

- **LAYER-14** The root of a widget holds its element and the element's own files: constants, types, messages, tests and stories. `templates/`, `controllers/` and `utils/` hold the rest, and each appears only when it has content. `utils/` always holds the support code of its parent folder. No `index.ts` barrel: each import names the file it needs, and `src/index.ts` is the only `index.ts`. Why: a path says what a file is, and a barrel would hide which files a widget depends on. Check: review.
- **LAYER-15** Each template gets its own folder, with its `.module.css`, its `.messages.ts`, its tests and its story. A template that one parent uses goes in a subfolder of the parent's folder, and a template that several siblings use goes in their closest common parent, so the folder tree follows the render tree. The root template of a widget, such as `plans-content` or `modal-content`, sits at the root of the widget's `templates/`. A CSS module that several templates use goes in their closest common parent, as `payment-plans.module.css` does. Files keep their full names inside their folder, such as `title/title.template.ts`. The four card logos are the one exception and share `shared/templates/card-logos/`. Why: a template's files sit together, and its path shows where it renders. Check: review.

## Bans

- **LAYER-05** `lib/`, `config/` and `domain/` are plain TypeScript. They import no `lit`, `lit-html`, `lit-element`, `@lit/*` or `@lit-labs/*` package, and `domain/` also uses none of the globals `window`, `document`, `customElements`, `HTMLElement`, `Element`, `Node` and `ShadowRoot`. The tests of `domain/` may use the DOM globals, because they run in jsdom, but not Lit. Why: the 5.0 UI rewrite leaves these layers unchanged. Check: lint for the Lit imports, review for the globals.
- **LAYER-06** Lit code lives only in `widgets/` and `shared/`. Why: the other layers stay plain TypeScript, which the 5.0 UI rewrite keeps. Check: lint in `lib/`, `config/` and `domain/`, review in `public-api/`.
- **LAYER-07** `fetch` and `sessionStorage` appear only in `domain/api/` and `lib/http.ts`, `window.fetch`, `globalThis.sessionStorage` and `self.fetch` included. Why: the widget sends one request and caches it in one place. Check: review.
- **LAYER-08** Node globals (`Buffer`, `require`, `__dirname`, `__filename`, `global`, `process`) appear only in tests and `src/test/`. Read build-time values from `import.meta.env`. Why: the widget runs in a browser, where they throw. `tsconfig.app.json` checks the production code without Node types. `tsconfig.test.json` checks the tests, stories and tooling with them, because Storybook's types load them anyway. Check: typecheck.
- **LAYER-13** A timer id has the type `ReturnType<typeof setTimeout>`, or comes from `window.setTimeout`. Why: `tsconfig.test.json` also checks the production files that tests import, and with `@types/node` loaded, a bare `setTimeout` returns `NodeJS.Timeout`. Check: typecheck.
- **LAYER-09** No relative imports. Write `@/domain/utils/plan-kind`, never `./plan-kind` or `../utils/plan-kind`. `@/` is the only alias and it maps to `src/`. Why: an import reads the same in every file. Check: lint.
- **ARCH-03** No import of `react` or `react-dom`. Why: Storybook installs them, so the import resolves and the build would bundle React into the widget. Check: review.
- **ARCH-05** Dates go through `lib/date.ts`, which works in local time. Never pass a `timeZone` option to `Intl`. Why: a `timeZone` would change the due dates that shoppers see. Check: lint.
- **ARCH-15** No dynamic `import()`. Everything ships in the one bundle. Why: merchants load the five published files by name, and the UMD file is one classic script. Check: lint.

## File suffixes

- **LAYER-11** A file's suffix says what it holds, as the table below says. Tests and stories sit next to the file they cover. A test that covers one feature of a whole widget sits next to its element as `<widget>.<feature>.test.ts`, such as `payment-plans.accessibility.test.ts`. Why: the name of a file tells what it holds and where its tests are. Check: review.

| Suffix | Holds |
| --- | --- |
| `.element.ts` | a custom element |
| `.template.ts` | a template function |
| `.controller.ts` | a reactive controller |
| `.types.ts` | types only |
| `.const.ts` | runtime constants |
| `.messages.ts` | message descriptors, next to the code that formats them |

## Tests

- **A11Y-07** Only `src/modal.browser.test.ts` runs in Chromium. Every other test runs in jsdom. Why: jsdom has no layout and no real Tab navigation, which only the modal's focus handling needs. Check: review.

## Constraints from outside `src/`

- **ARCH-22** `src/intl/` and `crowdin.yml` stay where they are. Crowdin reads `src/intl/messages.json` and writes the catalogues in `src/intl/messages/`, so never edit those catalogues by hand. Why: the next Crowdin download overwrites them. Check: review.
- **STYLE-03** `src/main.css` stays the first CSS import of `src/index.ts`, so its rules open `widgets.css`. The CSS modules may follow in any order, because no element gets rules from two modules. Why: merchant overrides rely on the rules of `main.css`, and a module order that decided a tie would change what the page shows. Check: contract tests, `css-output` and `cascade-ties`.
- **ARCH-23** `src/index.ts` and `src/modal.browser.test.ts` keep their paths. Why: the build uses `src/index.ts` as its entry, and A11Y-07 and `CLAUDE.md` name `src/modal.browser.test.ts` as the only browser test file. Check: review.
