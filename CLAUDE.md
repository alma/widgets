# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`@alma/widgets` is an npm package (also served via jsDelivr) of embeddable payment-plan widgets for
merchants using Alma's BNPL API. The widgets are being migrated from React to Lit. The React code is
deleted and stays readable on master. In these docs, "master" means the master commit that
`scripts/ref-sha.txt` names, the React reference that the port reproduces. The Lit code arrives in
steps, so a doc may name a file or a script that doesn't exist yet. Don't create a script that is
missing from `package.json`: it belongs to work that hasn't landed.

## Commands

```bash
npm test                                              # unit and browser tests with coverage
npm run test:no-coverage                              # unit and browser tests without coverage
npm run test:unit                                     # unit tests (jsdom) only
npm run test:browser                                  # browser tests (headless Chromium) only
npm run test:no-coverage -- src/path/to/file.test.ts  # one test file
npm run test:no-coverage -- -t "test name"            # tests matching a name
npm run test:browser:install                          # install Chromium, once per machine
npm run typecheck                                     # tsc --noEmit
npm run lint                                          # eslint on src/*.ts + stylelint
npm run lint:fix                                      # eslint --fix + stylelint --fix
```

Husky `pre-commit` already runs the typecheck, the tests of the changed files and lint-staged.
`pre-push` runs `npm test` and `npm run lint`. No need to run those manually before committing.

## Tests

- Two Vitest projects: `browser` runs the `*.browser.test.ts` files in headless Chromium, for what
  jsdom can't do (layout, real Tab navigation), and `unit` runs every other `*.test.ts` in jsdom.
  Only `src/modal.browser.test.ts` needs a browser. `npm run test:browser:install` must have run
  once, or `npm test` and the `pre-push` hook fail.
- `src/test/setup.ts` runs before every unit and browser test file, but not the contract tests. It
  fixes `Date.now()` to master's "today" (`1638350762000`), adds the `vitest-axe` matchers, and
  after each test restores the spies, clears the mock calls, and empties `<body>`, its
  `ReactModal__Body--open` class, `sessionStorage` and the `warnOnce` memory.
- `src/test/setup-jsdom.ts` runs in the `unit` project only. It puts the time zone back to UTC after
  each test and mocks `matchMedia` (no query matches), `no-scroll` and the canvas context axe needs.
  In unit tests, a CSS module class name equals its key (`styles.planButton === 'planButton'`).
- `setup-jsdom.ts` also starts the msw server of `src/test/msw-server.ts`. A test adds the handlers
  of `src/test/eligibilityHandlers.ts`, the ones the stories use, with `server.use()`, and they go
  away after it. A request that no handler of the test answers fails the test, even when the code
  catches the error, and never reaches the network.
- A custom element definition can't be removed, so a tag stays defined until its test file ends.
  Each test file gets a fresh page.
- Coverage leaves out the files whose tests aren't ported yet (the list in `vitest.config.ts`).
  Porting a file's tests removes it from that list.

## Architecture

- Before you create any file under `src/`, read `.claude/rules/architecture.md` and the rule files
  that its table lists for that folder. Claude Code loads a rule file only after a file under its
  paths is read or written, and for a new file that happens after the first Write.
- The code in `src/` sits in four layers: `public-api/`, `widgets/`, `domain/` and `shared/`.
  `.claude/rules/architecture.md` describes them and loads for `src/**`, and `.eslintrc.cjs`
  enforces its import rules.
- `src/intl/` holds the Crowdin catalogues. Don't hand-edit `src/intl/messages/*.json`.
  `npm run translations:extract` exits with code 1 until the Lit message descriptors exist, so it
  can't empty `src/intl/messages.json`. `npm run translations:upload` and `translations:download`
  sync with Crowdin, and only a developer runs them.

## Contract tests

```bash
npm run build:ref                      # build master at scripts/ref-sha.txt into dist-ref/
npm run test:contract:ref              # contract tests on dist-ref/
npm run test:contract                  # contract tests on dist/
npm run fixtures:messages              # write the message and date fixtures from master's libraries
npm run fixtures:messages -- --check   # fail when the fixtures are out of date
```

- `tests/integration/contract/` holds black-box tests on the built bundles. A feature PR never
  edits them. It only removes its own entries from `expected-failures.json`, once those tests pass.

## Gotchas

- No relative imports: ESLint's `no-restricted-imports` bans `./`/`../`. Use the `@/` alias, which
  maps to `src/`, instead.
