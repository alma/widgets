---
paths:
  - "src/**"
---

# Architecture of `src/`

These rules cover 4.x only. The code in `src/` sits in four layers. Each rule gives its reason and its check: lint, a test or review. A lint violation fails `npm run lint` and the pre-commit hook.

## Rule files

Claude Code loads a rule file only after Claude reads, edits or writes a file under its paths, and for a new file only after the first Write. Read the matching files before you create a file.

| Folder | Rule files, on top of this one |
| --- | --- |
| `src/domain/` | `domain.md` |
| `src/widgets/`, `src/shared/ui/` | `widgets.md`, `lit-styling.md`, `lit-accessibility.md` |
| `src/public-api/`, `src/index.ts` | `public-api.md` |
| `src/styles/` | `lit-styling.md` |
| `src/modal.browser.test.ts` | `lit-accessibility.md` |

## Source layout

```text
src/
  index.ts                     Vite library entry, builds window.Alma
  env.d.ts                     Vite client types and the CSS module declaration
  modal.browser.test.ts        the only browser test file
  public-api/                  merchant contract: initialize(), add(), modal handle, Alma.Utils, public types
  widgets/
    common/                    code that both widgets use and that isn't a business rule
    payment-plans/             <alma-payment-plans>, with templates/, controllers/ and __tests__/
    eligibility-modal/         <alma-eligibility-modal>, with templates/, controllers/ and __tests__/
      index.ts                 the only file that another widget may import
  domain/plans/                plan kinds, regulatory figures, filter and sort
    api/                       eligibility request and one-hour cache
  shared/                      code with no business meaning
    config/                    build version and API URLs
    lib/                       warning, price, date, hash, HTTP and event helpers
    i18n/                      createIntl, message definitions, Locale
    ui/                        Lit base classes, media query controller, rich text, icons
  intl/                        Crowdin catalogues
  styles/main.css
  test/                        test helpers and shared test data
```

Git keeps no empty folder, so a folder appears with its first file.

## Layers and imports

| Layer | Folder | May import |
| --- | --- | --- |
| 1 | `public-api/` | `widgets/`, `domain/`, `shared/` |
| 2 | `widgets/payment-plans/` | `widgets/common/`, `widgets/eligibility-modal/index.ts`, `domain/`, `shared/` |
| 2 | `widgets/eligibility-modal/` | `widgets/common/`, `domain/`, `shared/` |
| 2 | `widgets/common/` | `domain/`, `shared/` |
| 3 | `domain/` | `shared/lib/`, `shared/config/` |
| 4 | `shared/` | `shared/`, and the catalogues in `intl/` |

- **LAYER-01** Imports go downward only: a file imports from the folders in its row of the table above and from its own folder. Why: a layer changes without touching the layers below it. Check: lint.
- **LAYER-02** The only import from one widget folder to another is `widgets/payment-plans/` importing `widgets/eligibility-modal/index.ts`, to open the modal. Why: the rest of the modal stays private to its folder. Check: lint.
- **LAYER-03** Only `src/index.ts` imports `public-api/`. Each widget declares the types of its own element properties. Why: the merchant contract sits on top, and nothing below it depends on it. Check: lint.
- **LAYER-04** A business rule goes in `domain/`. A file that one widget uses goes in that widget's folder. Code that both widgets use and that isn't a business rule goes in `widgets/common/`, and nothing else goes there. Code with no business meaning goes in `shared/`. Why: a file's folder says what it is and who uses it. Check: review.

Tests, stories and `src/test/` (`*.test.ts`, `*.stories.ts`, `__tests__/`) put the layers together, so they may import any layer, `@/index` and `public-api/` included. The import rule and the `fetch`/`sessionStorage` rule skip them. Tests in `domain/` still cannot import Lit.

## Bans

- **LAYER-05** `domain/` is plain TypeScript. It imports no `lit`, `lit-html`, `lit-element`, `@lit/*` or `@lit-labs/*` package, and it uses none of the globals `window`, `document`, `customElements`, `HTMLElement`, `Element`, `Node` and `ShadowRoot`. Its tests may use the DOM globals, because they run in jsdom, but not Lit. Why: the 5.0 UI rewrite leaves `domain/` unchanged. Check: lint.
- **LAYER-06** Lit code lives only in `widgets/` and `shared/ui/`. Why: the other layers stay plain TypeScript, which the 5.0 UI rewrite keeps. Check: lint in `domain/`, review elsewhere.
- **LAYER-07** `fetch` and `sessionStorage` appear only in `domain/plans/api/` and `shared/lib/http.ts`, `window.fetch`, `globalThis.sessionStorage` and `self.fetch` included. Why: the widget sends one request and caches it in one place. Check: lint.
- **LAYER-08** Node globals (`Buffer`, `require`, `__dirname`, `__filename`, `global`, `process`) appear only in tests and `src/test/`. Only `src/shared/config/` reads `process.env.BUILD_VERSION`, which Vite replaces at build time. A bare `setTimeout` returns `NodeJS.Timeout`, so store a timer id as `ReturnType<typeof setTimeout>`. Why: the widget runs in a browser, where they throw, but tsc accepts them because `@types/node` loads next to the DOM types. Check: lint.
- **LAYER-09** No relative imports. Write `@/domain/plans/plan-kind`, never `./plan-kind` or `../plans/plan-kind`. `@/` is the only alias and it maps to `src/`. Why: an import reads the same in every file. Check: lint.

## File suffixes

- **LAYER-10** A `.types.ts` file holds types only, imported with `import type`. Enums and other runtime values go in a `.const.ts` file. Why: a types file adds no code to the bundle. Check: lint.
- **LAYER-11** A file's suffix says what it holds, as the table below says. Tests and stories sit next to the file they cover, and the tests of a whole widget sit in its `__tests__/` folder. Why: the name of a file tells what it holds and where its tests are. Check: review.

| Suffix | Holds |
| --- | --- |
| `.element.ts` | a custom element |
| `.template.ts` | a template function, with its `.stories.ts` file next to it |
| `.controller.ts` | a reactive controller |
| `.types.ts` | types only |
| `.const.ts` | runtime constants and enums |
| `.messages.ts` | message descriptors, next to the code that formats them |

## The React original and the contract tests

- **ARCH-01** The port reproduces master's behaviour at the reference commit, quirks included. Why: the contract tests compare the Lit build with master's build. Check: contract tests.
- **ARCH-02** A feature PR never edits `tests/integration/contract/`. It only removes its own entries from `expected-failures.json`, once those tests pass. Why: the contract tests pin what merchants rely on, so editing one hides a break. Only a contract-test PR or a master sync changes them. Check: review.
- **A11Y-07** Only `src/modal.browser.test.ts` runs in Chromium. Every other test runs in jsdom. Why: jsdom has no layout and no real Tab navigation, which only the modal's focus handling needs. Check: tests.

The React code is deleted on this branch. Read it at the reference commit in `scripts/ref-sha.txt`, which `npm run build:ref` builds into `dist-ref/`: `git ls-tree -r --name-only "$(cat scripts/ref-sha.txt)" -- src/components/Loader` lists a folder, and `git show "$(cat scripts/ref-sha.txt)":src/components/Loader/index.tsx` prints a file.

## Constraints from outside `src/`

- **ARCH-22** `src/intl/` and `crowdin.yml` stay where they are. Crowdin reads `src/intl/messages.json` and writes the catalogues in `src/intl/messages/`, so never edit those catalogues by hand. Why: the next Crowdin download overwrites them. Check: review.
- **STYLE-03** `src/styles/main.css` stays the first CSS import of `src/index.ts`. Why: `widgets.css` keeps master's rule order, which merchant overrides rely on. Check: contract tests.
- **ARCH-23** `src/index.ts` and `src/modal.browser.test.ts` keep their paths. Why: the build uses `src/index.ts` as its entry, and A11Y-07 and `CLAUDE.md` name `src/modal.browser.test.ts` as the only browser test file. Check: review.
