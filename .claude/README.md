# Claude Code setup

This folder holds the Claude Code setup that the team shares for the Lit port of `@alma/widgets`.
Generic Lit advice assumes Shadow DOM, `static styles` and `CustomEvent`s, and each of those breaks
the 4.x contract with merchants. The rules here keep Claude on the 4.x path, and a hook lints each
file that Claude edits.

Tested with Claude Code 2.1.304.

## Setup

1. Install Claude Code, 2.1.291 or later.
2. Install the dependencies and Chromium, once per machine:

   ```bash
   npm ci
   npm run test:browser:install
   ```

3. Start `claude` at the root of the repo and accept the workspace trust dialog.
4. Ask Claude to read `src/domain/plans/plans.types.ts` with the Read tool. Under that call,
   Claude Code shows `Loaded .claude/rules/architecture.md` and `Loaded .claude/rules/domain.md`.
5. Run `/hooks`. Under PostToolUse, it lists the lint hook from project settings.

## What each folder holds

| Path | Holds |
| --- | --- |
| `settings.json` | The shared permissions and the lint hook |
| `hooks/` | The scripts that the hooks of `settings.json` run |
| `rules/` | The rule files. Each one starts with `paths:` and loads only for those files. |

| Rule file | Loads for | Covers |
| --- | --- | --- |
| `architecture.md` | `src/**` | Layers, imports, placement, bans across `src/`, suffixes, the React original, tests |
| `domain.md` | `src/domain/`, `src/shared/lib/http.ts` | The eligibility request and its cache |
| `widgets.md` | `src/widgets/`, `src/shared/ui/` | Lit in light DOM and the merchant contract of the elements |
| `public-api.md` | `src/public-api/`, `src/index.ts` | The merchant contract: API, options, files |
| `lit-styling.md` | `src/widgets/`, `src/shared/ui/`, `src/styles/` | CSS that merchants can still override |
| `lit-accessibility.md` | `src/widgets/`, `src/shared/ui/`, `src/modal.browser.test.ts` | Accessibility as master has it, and the modal |

Each rule has an ID, such as `ARCH-06`, with its reason and its check: lint, a test or review. A
rule lives in the one file whose `paths:` cover every file it governs. When two files that never
load together both need it, as for ARCH-08, each holds a copy with the same ID and wording.

## How the rules load

Claude Code loads the root `CLAUDE.md` at the start of a session. It loads a rule file only after
Claude reads, edits or writes a file that matches its `paths:`. For a new file, the rules arrive
with the result of the first Write, after the content is written. That is why `CLAUDE.md` tells
Claude to read `architecture.md` and the matching rule files before it creates a file under `src/`.

`/context` lists the memory files that load at the start of a session, such as `CLAUDE.md`. It
doesn't list the rule files that load by path: each one shows up under the tool call that loaded
it, as `Loaded .claude/rules/<file>`.

## The lint hook

After each Edit or Write of a `.ts` or `.css` file under `src/`, `hooks/lint-edited-file.mjs` lints
that file with the ESLint or Stylelint config of the checkout that holds it, worktrees included.
When it finds errors, it exits with code 2 and Claude gets them, with their line and rule. The edit
has already happened, so the hook gives feedback and blocks nothing. It stays silent on warnings,
on Prettier formatting, which lint-staged fixes at commit time, and on the files that the configs
ignore, such as the lint fixtures. It doesn't run when a Bash command writes a file.

When the hook itself fails, for example without `node_modules`, the transcript shows a `hook error`
with one line, and Claude gets nothing. `npm run test:harness` runs the hook on a few files.

`/hooks` lists the hooks, each with the settings file that defines it. In an interactive session,
Claude Code runs project hooks only once you accept the workspace trust dialog. `claude -p` runs
them without it. In a worktree, `CLAUDE_PROJECT_DIR` still points to the main checkout, so a
session there runs the main checkout's copy of the hook. Try a change to the hook in the main
checkout, or run `npm run test:harness` in the worktree.

Claude Code has no switch for one hook. To turn hooks off:

- for the project, add `"disableAllHooks": true` to `.claude/settings.local.json`. It also turns off
  your own hooks in `~/.claude/settings.json`, the hooks of your plugins, your custom status line
  and your file suggestion command.
- for one session, start it with `claude --settings '{"disableAllHooks": true}'`.

## Permissions

`settings.json` lets Claude run, without a prompt, `npm test` and every `test:*` script except
`test:browser:install`, plus `typecheck`, `lint`, `build`, `build:contract` and `build-storybook`,
once that script exists. A test script run with vitest's `-u` or `--update` asks first, because it
can rewrite the snapshots under `tests/integration/contract/`.

It denies edits to `src/intl/messages/`, which Crowdin writes, and to `.ref-worktree/`, where
`npm run build:ref` checks out master. It also denies `npm publish`, `unpublish` and `deprecate`,
force pushes and the Crowdin sync commands, and asks before an edit under
`tests/integration/contract/`.

A deny wins over an allow from any other settings file, so `.claude/settings.local.json` can't lift
it. The rules have two limits:

- A Bash rule matches the command text only. `git -C . push --force`, `git push -uf origin main` or
  `git push origin +main` gets through, so GitHub branch protection stays the real guard against a
  force push.
- An Edit rule also checks Bash redirects and `tee`, but not a command or a script that writes files
  itself, such as `crowdin download` or `vitest -u`. That is why the Crowdin commands and the
  snapshot updates have their own rules.

## Personal overrides

Put your own settings, such as extra permissions or environment variables, in
`.claude/settings.local.json`. Git ignores it, and it applies on top of the shared setup. Your own
instructions for every repo go in `~/.claude/CLAUDE.md`.

## Changing the setup

Changes to `.claude/` and to the root `CLAUDE.md` go through a PR, because they change every
teammate's sessions. Keep a rule's ID once it is merged, and keep the same wording wherever the
rule appears. The rules name no ticket and no planning document, because neither is in the repo.
