# @alma/widgets

`@alma/widgets` is an npm package, also served via jsDelivr, of embeddable payment-plan widgets
that merchants embed on their own pages to call Alma's BNPL API. It ships only as a browser
bundle: no server, and nothing here runs in Alma's own backend. Each widget is one Lit 3 custom
element that renders in light DOM (`alma-payment-plans`, `alma-eligibility-modal`). Template
functions render the parts below each element. Reactive controllers in `*.controller.ts` files
keep the shared state, such as the eligibility request.

## Tech stack

| | |
|---|---|
| Language | TypeScript |
| Framework | Lit 3, light DOM |
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
npm run test:contract                                 # contract tests on dist/
npm run fixtures:messages                             # write the message and date fixtures from @formatjs/intl
npm run fixtures:messages -- --check                  # fail when the fixtures are out of date
```

Husky `pre-commit` already runs the typecheck, the tests of the changed files and lint-staged.
`pre-push` runs `npm test` and `npm run lint`. No need to run those manually before committing.

`npm test` fails when coverage drops below the thresholds of `vitest.config.ts`, even when every
test passes.

Run `npm run fixtures:messages` after `npm run translations:download`, because new catalogues
change the fixtures.

## Source of truth

Read the file, not a description of it.

| For… | Read… |
|---|---|
| Layer order, folder placement and import rules | `.claude/rules/architecture.md` — loads for every file under `src/**` |
| Which source files coverage leaves out | `vitest.config.ts`'s coverage exclude list |
| Crowdin message catalogues | `src/intl/messages/*.json` — generated; never hand-edit |
| Contract expectations the bundles don't meet yet | `tests/integration/contract/expected-failures.json` |

## Testing

- Two Vitest projects: `browser` runs the `*.browser.test.ts` files in headless Chromium, for what
  jsdom can't do (layout, real Tab navigation), and `unit` runs every other `*.test.ts` in jsdom.
  Only `src/modal.browser.test.ts` needs a browser. `npm run test:browser:install` must have run
  once, or `npm test` and the `pre-push` hook fail.
- `src/test/setup.ts` runs before every unit and browser test file, but not the contract tests. It
  sets `Date.now()` to a fixed date (`1638350762000`), adds the `vitest-axe` and Testing Library
  DOM matchers, and after each test restores the spies, clears the mock calls, and empties `<body>`,
  its `ReactModal__Body--open` class, `sessionStorage` and the `warnOnce` memory. A
  `navigator.sendBeacon` call or an image `src` set fails the test, even when the code catches the
  error, because the widget sends no tracking.
- `src/test/setup-jsdom.ts` runs in the `unit` project only. It puts the time zone back to UTC after
  each test and mocks `matchMedia` (no query matches), `no-scroll` and the canvas context axe needs.
  In unit tests, a CSS module class name equals its key (`styles.planButton === 'planButton'`).
- `setup-jsdom.ts` also starts the msw server of `src/test/msw/msw-server.ts`. A test adds the
  handlers of `src/test/msw/eligibility-handlers.ts`, the ones the stories use, with `server.use()`,
  and they go away after it. A request that no handler of the test answers fails the test, even
  when the code catches the error, and never reaches the network.
- A custom element definition can't be removed, so a tag stays defined until its test file ends.
  Each test file gets a fresh page.

## Workflow

- Before you create any file under `src/`, read `.claude/rules/architecture.md` and the rule files
  that its table lists for that folder. Claude Code loads a rule file only after a file under its
  paths is read or written, and for a new file that happens after the first Write.
- Only a major release that is allowed to break the merchant contract fills the pull request
  template's "Merchant contract" section.

## Non-negotiables

1. English for everything: code, comments, commit messages, documentation, branch names.
2. Conventional Commits for commit subjects, wherever the repository's history already uses them. Where it does not, follow the convention its history shows.
3. Never commit directly to the default branch. Work on a topic branch whose name starts with a prefix of `.github/pr-labeler.yml`, and open a pull request.
4. Link the issue in the pull request description, when there is one.
5. Never bypass hooks with `--no-verify`. Fix the failure instead.
6. Never force-push without explicit human instruction.
7. Add or update tests for any behaviour change, whether or not tests were requested.
8. Comment the why, never the what. A comment that restates the code does not belong.
9. Never name a script that isn't in `package.json`: it doesn't exist. Check `npm run` before naming one.
10. A feature PR never edits `tests/integration/contract/`, the black-box tests on the built bundles; it only removes its own entries from `expected-failures.json` once those tests pass.
