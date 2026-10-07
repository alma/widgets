# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`@alma/widgets` is an npm package (also served via jsDelivr) of embeddable payment-plan widgets for
merchants using Alma's BNPL API. The widgets are being migrated from React to Lit. The React code is
deleted and stays readable on master. The Lit code arrives in steps, so `src/index.ts` and the
build don't exist yet.

## Commands

```bash
npm test                                              # unit tests with coverage
npm run test:no-coverage                              # unit tests without coverage
npm run test:no-coverage -- src/path/to/file.test.ts  # one test file
npm run test:no-coverage -- -t "test name"            # tests matching a name
npm run typecheck                                     # tsc --noEmit
npm run lint                                          # eslint on src/*.ts + stylelint
npm run lint:fix                                      # eslint --fix + stylelint --fix
```

Husky `pre-commit` already runs the typecheck, the unit tests of the changed files and lint-staged.
`pre-push` runs `npm test` and `npm run lint`. No need to run those manually before committing.

## Architecture

- The code in `src/` sits in four layers: `public-api/`, `widgets/`, `domain/` and `shared/`.
  `.claude/rules/architecture.md` describes them and loads for `src/**`, and `.eslintrc.cjs`
  enforces its import rules.
- `src/intl/` holds the Crowdin catalogues. Don't hand-edit `src/intl/messages/*.json`.
  `npm run translations:extract` exits with code 1 until the Lit message descriptors exist, so it
  can't empty `src/intl/messages.json`.

## Gotchas

- No relative imports: ESLint's `no-restricted-imports` bans `./`/`../`. Use the `@/` alias, which
  maps to `src/`, instead.
