# Claude Code setup

This folder holds the Claude Code setup that the team shares for the Lit port of `@alma/widgets`.
Generic Lit advice assumes Shadow DOM, `static styles` and `CustomEvent`s, and each of those breaks
the 4.x contract with merchants. The rules here keep Claude on the 4.x path.

Tested with Claude Code 2.1.291.

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

## What each folder holds

| Path | Holds |
| --- | --- |
| `rules/` | The rule files. Each one starts with `paths:` and loads only for those files. |

| Rule file | Loads for | Covers |
| --- | --- | --- |
| `architecture.md` | `src/**` | Layers, imports, placement, suffixes, the React original, the contract tests |
| `domain.md` | `src/domain/` | Plain TypeScript, with no DOM and no Lit |
| `widgets.md` | `src/widgets/`, `src/shared/ui/` | Lit in light DOM and the merchant contract of the elements |
| `public-api.md` | `src/public-api/`, `src/index.ts` | The merchant contract: API, options, files, request |
| `lit-styling.md` | `src/widgets/`, `src/shared/ui/`, `src/styles/` | CSS that merchants can still override |
| `lit-accessibility.md` | `src/widgets/`, `src/shared/ui/`, `src/modal.browser.test.ts` | Accessibility as master has it, and the modal |

Each rule has an ID, such as `ARCH-06`, with its reason and its check: lint, a test or review. A
rule that applies to several folders has the same ID and wording in each file.

## How the rules load

Claude Code loads the root `CLAUDE.md` at the start of a session. It loads a rule file only after
Claude reads, edits or writes a file that matches its `paths:`. For a new file, the rules arrive
with the result of the first Write, after the content is written. That is why `CLAUDE.md` tells
Claude to read `architecture.md` and the matching rule files before it creates a file under `src/`.

`/context` lists the memory files that load at the start of a session, such as `CLAUDE.md`. It
doesn't list the rule files that load by path: each one shows up under the tool call that loaded
it, as `Loaded .claude/rules/<file>`.

## Personal overrides

Put your own settings, such as extra permissions or environment variables, in
`.claude/settings.local.json`. Git ignores it, and it applies on top of the shared setup. Your own
instructions for every repo go in `~/.claude/CLAUDE.md`.

## Changing the setup

Changes to `.claude/` and to the root `CLAUDE.md` go through a PR, because they change every
teammate's sessions. Keep a rule's ID once it is merged, and keep the same wording wherever the
rule appears. The rules name no ticket and no planning document, because neither is in the repo.
