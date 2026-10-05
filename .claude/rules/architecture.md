---
paths:
  - "src/**"
---

# Architecture of `src/`

The code in `src/` sits in four layers. `.eslintrc.cjs` enforces the import rules, the bans on `fetch`/`sessionStorage`, Lit, the DOM and Node globals, and the `.types.ts` rule below, so a violation fails `npm run lint` and the pre-commit hook.

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

Imports go downward only, through the `@/` alias. A file imports from the folders in its row and from its own folder.

| Layer | Folder | May import |
| --- | --- | --- |
| 1 | `public-api/` | `widgets/`, `domain/`, `shared/` |
| 2 | `widgets/payment-plans/` | `widgets/common/`, `widgets/eligibility-modal/index.ts`, `domain/`, `shared/` |
| 2 | `widgets/eligibility-modal/` | `widgets/common/`, `domain/`, `shared/` |
| 2 | `widgets/common/` | `domain/`, `shared/` |
| 3 | `domain/` | `shared/lib/`, `shared/config/` |
| 4 | `shared/` | `shared/`, and the catalogues in `intl/` |

- Only `src/index.ts` imports `public-api/`. Nothing below it does. Each widget declares the types of its own element properties.
- `widgets/payment-plans/` imports `widgets/eligibility-modal/index.ts` because it opens the modal. That is the only import from one widget folder to another.
- Tests, stories and `src/test/` (`*.test.ts`, `*.stories.ts`, `__tests__/`) put the layers together, so they may import any layer, `@/index` and `public-api/` included. The import rule and the `fetch`/`sessionStorage` rule skip them. Tests in `domain/` still cannot import Lit.

## Where a file goes

1. A business rule goes in `domain/`.
2. A file that one widget uses goes in that widget's folder.
3. Code that both widgets use, and that isn't a business rule for `domain/`, goes in `widgets/common/`. Nothing else goes there.
4. Code with no business meaning goes in `shared/`.

## Bans

- `domain/` is plain TypeScript. It imports no `lit`, `lit-html`, `lit-element`, `@lit/*` or `@lit-labs/*` package, and it uses none of the globals `window`, `document`, `customElements`, `HTMLElement`, `Element`, `Node` and `ShadowRoot`, so the 5.0 UI rewrite leaves it unchanged. Lit code lives only in `widgets/` and `shared/ui/`. Tests in `domain/` may use the DOM globals, because they run in jsdom, but they still cannot import Lit.
- `fetch` and `sessionStorage` appear only in `domain/plans/api/` and `shared/lib/http.ts`. The ban covers `window.fetch`, `globalThis.sessionStorage` and `self.fetch` too.
- Node globals (`Buffer`, `require`, `__dirname`, `__filename`, `global`, `process`) are banned outside tests and `src/test/`. The widget runs in a browser, but `@types/node` loads next to the DOM types, so tsc accepts them. The one exception is `process.env.BUILD_VERSION`, which Vite replaces at build time. Only `src/shared/config/` reads it, because any other `process` use throws in the browser.
- Because `@types/node` loads, a bare `setTimeout` returns `NodeJS.Timeout`. Store a timer id as `ReturnType<typeof setTimeout>`, or call `window.setTimeout` to get a number.
- No relative imports. Write `@/domain/plans/plan-kind`, never `./plan-kind` or `../plans/plan-kind`. `@/` is the only alias and it maps to `src/`.

## File suffixes

| Suffix | Holds |
| --- | --- |
| `.element.ts` | a custom element |
| `.template.ts` | a template function, with its `.stories.ts` file next to it |
| `.controller.ts` | a reactive controller |
| `.types.ts` | types only, imported with `import type`. A runtime export fails lint |
| `.const.ts` | runtime constants and enums |
| `.messages.ts` | message descriptors, next to the code that formats them |

Tests and stories sit next to the file they cover. Tests of a whole widget sit in that widget's `__tests__/` folder.

## Constraints from outside `src/`

- `src/intl/` and `crowdin.yml` stay where they are. Crowdin reads `src/intl/messages.json` and writes the catalogues in `src/intl/messages/`.
- `src/styles/main.css` stays the first CSS import of `src/index.ts`, so `widgets.css` keeps the rule order of master.
- `src/index.ts` and `src/modal.browser.test.ts` keep their paths.
