# @alma/widgets

`@alma/widgets` is an npm package, also served via jsDelivr, of embeddable payment-plan widgets
that merchants embed on their own pages to call Alma's BNPL API. It ships only as a browser
bundle: no server, and nothing here runs in Alma's own backend. The widgets are being migrated
from React to Lit; the React code is deleted from this branch but stays readable at the reference
commit `scripts/ref-sha.txt` names ("master"). Lit code arrives in steps, so a doc may name a file
or a script that doesn't exist yet.

## Tech stack

| | |
|---|---|
| Language | TypeScript |
| Framework | Lit (migrating off React) |
| Package manager | npm |
| Toolchain | nvm, via `.nvmrc` |

## Commands

Run `npm run` to list every script this repository defines.

Only what discovery will not tell you:

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
npm run build:ref                                     # build master at scripts/ref-sha.txt into dist-ref/
npm run test:contract:ref                             # contract tests on dist-ref/
npm run test:contract                                 # contract tests on dist/
npm run fixtures:messages                             # write the message and date fixtures from master's libraries
npm run fixtures:messages -- --check                  # fail when the fixtures are out of date
```

Husky `pre-commit` already runs the typecheck, the tests of the changed files and lint-staged.
`pre-push` runs `npm test` and `npm run lint`. No need to run those manually before committing.

`npm run translations:extract` exits with code 1 until the Lit message descriptors exist, so it
can't empty `src/intl/messages.json` early.

## Source of truth

Read the file, not a description of it.

| For… | Read… |
|---|---|
| The React reference commit this Lit port reproduces | `scripts/ref-sha.txt` |
| Layer order, folder placement and import rules | `.claude/rules/architecture.md` — loads for every file under `src/**` |
| Which source files have no ported tests yet | `vitest.config.ts`'s coverage exclude list |
| Crowdin message catalogues | `src/intl/messages/*.json` — generated; never hand-edit |
| Contract expectations the Lit port hasn't met yet | `tests/integration/contract/expected-failures.json` |

## Testing

- Two Vitest projects: `browser` runs the `*.browser.test.ts` files in headless Chromium, for what
  jsdom can't do (layout, real Tab navigation), and `unit` runs every other `*.test.ts` in jsdom.
  Only `src/modal.browser.test.ts` needs a browser. `npm run test:browser:install` must have run
  once, or `npm test` and the `pre-push` hook fail.
- `src/test/setup.ts` runs before every unit and browser test file, but not the contract tests. It
  fixes `Date.now()` to master's "today" (`1638350762000`), adds the `vitest-axe` and jest-dom
  matchers, and after each test restores the spies, clears the mock calls, and empties `<body>`,
  its `ReactModal__Body--open` class, `sessionStorage` and the `warnOnce` memory.
- `src/test/setup-jsdom.ts` runs in the `unit` project only. It puts the time zone back to UTC after
  each test and mocks `matchMedia` (no query matches), `no-scroll` and the canvas context axe needs.
  In unit tests, a CSS module class name equals its key (`styles.planButton === 'planButton'`).
- `setup-jsdom.ts` also starts the msw server of `src/test/msw/msw-server.ts`. A test adds the
  handlers of `src/test/msw/eligibility-handlers.ts`, the ones the stories use, with `server.use()`,
  and they go away after it. A request that no handler of the test answers fails the test, even
  when the code catches the error, and never reaches the network.
- A custom element definition can't be removed, so a tag stays defined until its test file ends.
  Each test file gets a fresh page.
- Coverage leaves out the files whose tests aren't ported yet (the list in `vitest.config.ts`).
  Porting a file's tests removes it from that list.

## Workflow

- Before you create any file under `src/`, read `.claude/rules/architecture.md` and the rule files
  that its table lists for that folder. Claude Code loads a rule file only after a file under its
  paths is read or written, and for a new file that happens after the first Write.
- A Lit port PR fills the pull request template's "Lit port" section (contract surface, expected
  failures removed, dropped test cases), copied from `pr-description.local.md`.

## Non-negotiables

1. English for everything: code, comments, commit messages, documentation, branch names.
2. Conventional Commits for commit subjects, wherever the repository's history already uses them. Where it does not, follow the convention its history shows.
3. Never commit directly to the default branch. Work on a topic branch named after the Linear issue id, and open a pull request. Ask for the Linear issue id when it was not given.
4. Link the Linear issue in the pull request description.
5. Never bypass hooks with `--no-verify`. Fix the failure instead.
6. Never force-push without explicit human instruction.
7. Add or update tests for any behaviour change, whether or not tests were requested.
8. Comment the why, never the what. A comment that restates the code does not belong.
9. Never create a script that doesn't already exist in `package.json`: it belongs to work that hasn't landed yet.
10. A feature PR never edits `tests/integration/contract/`, the black-box tests on the built bundles; it only removes its own entries from `expected-failures.json` once those tests pass.
