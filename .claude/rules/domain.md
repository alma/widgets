---
paths:
  - "src/domain/**"
---

# `src/domain/`

These rules cover 4.x only and override generic Lit advice. `domain/` holds the business rules: plan kinds, regulatory figures, filter and sort, and the eligibility request and its cache in `api/`. It is plain TypeScript, with no DOM and no Lit.

Generic advice that doesn't apply here: wrapping the request in a Lit `Task` or a reactive controller. The request and the cache stay plain functions, and the controller that calls them lives in `widgets/common/`.

## Rules

- **LAYER-04** A business rule goes in `domain/`. A file that one widget uses goes in that widget's folder. Code that both widgets use and that isn't a business rule goes in `widgets/common/`, and nothing else goes there. Code with no business meaning goes in `shared/`. Why: a file's folder says what it is and who uses it. Check: review.
- **LAYER-05** `domain/` is plain TypeScript. It imports no `lit`, `lit-html`, `lit-element`, `@lit/*` or `@lit-labs/*` package, and it uses none of the globals `window`, `document`, `customElements`, `HTMLElement`, `Element`, `Node` and `ShadowRoot`. Its tests may use the DOM globals, because they run in jsdom, but not Lit. Why: the 5.0 UI rewrite leaves `domain/` unchanged. Check: lint.
- **LAYER-07** `fetch` and `sessionStorage` appear only in `domain/plans/api/` and `shared/lib/http.ts`, `window.fetch`, `globalThis.sessionStorage` and `self.fetch` included. Why: the widget sends one request and caches it in one place. Check: lint.
- **LAYER-10** A `.types.ts` file holds types only, imported with `import type`. Enums and other runtime values go in a `.const.ts` file. Why: a types file adds no code to the bundle. Check: lint.

`domain/` imports only `shared/lib/` and `shared/config/`, as the layer table of `architecture.md` says.
