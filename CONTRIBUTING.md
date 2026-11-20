# Contributing to @alma/widgets

## Setup

Clone the repository. If you can't push to `alma/widgets`, clone your fork with its URL instead:

```bash
git clone https://github.com/alma/widgets.git
cd widgets
nvm install                   # the Node version of .nvmrc
npm ci                        # install the dependencies at the lockfile's versions
npm run test:browser:install  # once per machine
npm test                      # check that the setup works
```

Run `npm run` to list the scripts.

## Tests

```bash
npm test                                              # every test, with coverage
npm run test:no-coverage -- src/path/to/file.test.ts  # one test file
npm run test:no-coverage -- -t "test name"            # tests matching a name
```

`npm test` fails when coverage drops below the thresholds of `vitest.config.ts`, even when every
test passes.

## Code layout

`src/` is split into layers, and [`.claude/rules/architecture.md`](.claude/rules/architecture.md)
holds the rules: what each layer may import, where each kind of file goes and how to name it.

## Branches, commits and pull requests

- Start a branch name with one of the prefixes of [`.github/pr-labeler.yml`](.github/pr-labeler.yml).
- Write commit subjects and the pull request title as Conventional Commits.
- Open the pull request against the default branch and fill in
  [`.github/pull_request_template.md`](.github/pull_request_template.md).

## Translations

Edit a message in its `*.messages.ts` file. Maintainers generate the files of `src/intl/messages/`,
so never edit them by hand.

## Claude Code

See [`.claude/README.md`](.claude/README.md).
