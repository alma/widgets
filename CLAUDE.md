# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`@alma/widgets` is an npm package (also served via jsDelivr) of embeddable payment-plan widgets for
merchants using Alma's BNPL API. Components are written against the React API but aliased to
**Preact** (`preact/compat`) at build and test time — see `resolve.alias` in `vite.config.ts` and
`moduleDirectories` in `jest.config.js`.

## Commands

```bash
npm run start              # tsc + vite build in watch mode (for local dev against examples/)
npm run build              # tsc + vite build (umd/es) + WooCommerce UMD variant
npm run test:no-coverage   # jest run without coverage (faster than `npm test`)
npm run test:no-coverage -- src/path/to/File.test.tsx   # run a single test file
npm run test:no-coverage -- -t "test name"              # run tests matching a name
npm run lint:fix            # eslint --fix + stylelint --fix
npx tsc --noEmit            # typecheck only
```

`npm test` enforces jest coverage thresholds (branches 88%, functions/lines/statements 95%,
`jest.config.js`) — it can fail on coverage alone even when every test passes.

Husky `pre-commit` already runs typecheck + `jest --only-changed` + lint-staged; `pre-push` runs
the full test suite + lint. No need to run those manually before committing.

## Architecture

- Entry point `src/index.ts` exposes `Widgets.initialize(merchantId, mode)` →
  `WidgetsController` (`widgets_controller.tsx`), which mounts either `Widgets/PaymentPlans`
  (inline selector) or `Widgets/EligibilityModal` into the merchant's container div.
- Both widgets fetch through `hooks/useFetchEligibility`, which hits the Alma eligibility API,
  caches the response in `sessionStorage` for 1h, then filters it through
  `utils/filterEligibility.ts` against the merchant's configured plan constraints. Changes to
  eligibility display logic usually touch this hook + `filterEligibility.ts` together, not just one.
- i18n strings live inline as `react-intl` `defaultMessage`s; `npm run translations:extract` pulls
  them into `src/intl/messages.json` for Crowdin sync — don't hand-edit `src/intl/messages/*.json`.

## Gotchas

- No relative imports: ESLint's `no-restricted-imports` bans `./`/`../`. Use the path aliases
  (`@/*`, `assets/`, `components/`, `hooks/`, `utils/`, `Widgets/`, `intl/`) instead.
- `npm run build` runs `scripts/umd-for-woocommerce.js` after the vite build, which string-replaces
  `innerHTML` with `innerText` in the emitted UMD bundle to dodge a WordPress security scanner. It
  patches the build output, not source — don't try to "fix" this by changing source code.
