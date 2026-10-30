---
name: port-react-component
description: Ports a React component, hook or SVG asset of master to Lit in light DOM, with its stories, its tests and its element when the file map gives one. Use it whenever someone asks to port or migrate master's React code to Lit, such as "migrate SkipLinks to Lit" or a folder or a file under src/components/, src/Widgets/, src/hooks/ or src/assets/, even when the React code is named without its path.
---

# Port a React original to Lit

A port reproduces master's behaviour and DOM at the reference commit, quirks included (ARCH-01).
The contract tests compare the Lit build with master's build, so a port that "improves" master
fails them. Work through the steps in order, and don't skip the pause in step 4.

Each code example in the reference files below opens with a path comment that
`npm run test:harness` pastes in; leave it out of the port.

## 1. Read before the first Write

Claude Code loads a rule file only after a file under its paths is read, and for a new file only
after the first Write. Read these files yourself before you write anything:

1. `.claude/rules/architecture.md`.
2. [references/file-map.md](references/file-map.md). Find the rows of the original: the Lit files
   to create and the test files that take master's tests.
3. The rule files of each destination folder, from the table in `architecture.md`. For
   `src/widgets/` and `src/shared/ui/`, that is `widgets.md`, `lit-styling.md` and
   `lit-accessibility.md`.
4. The React original and its tests at the reference commit. The React code is deleted on this
   branch. Read `scripts/ref-sha.txt`, then write the SHA and each path in full in each command,
   with no shell variable or loop, because Claude Code asks before it runs a command that holds `$`:

   ```bash
   git ls-tree -r --name-only <sha> -- src/components/Loader
   git show <sha>:src/components/Loader/index.tsx
   ```

   Also read what the original imports from master and renders: child components, its CSS module,
   its messages, and the code that passes it props.
5. What the branch already has for it: master's CSS module, already moved next to the destination
   (STYLE-02, never edit it), the `*.messages.ts` descriptors, already ported (ARCH-04: reuse them,
   and declare no message), and the fixtures and builders of `src/test/` that master's tests use.

When a template, story, controller or element file that the file map gives already exists, stop
and ask the developer whether the port was started. The CSS module and the `*.messages.ts` file
exist by design, and a test file can already hold another original's cases: add to it.

### Already decided, so don't ask the developer

- Paths and test files: the file map's rows.
- Props: master's names and optionality, even a prop that no caller passes.
- `intl`: a second argument only when the template formats text.
- Stories: one per variant that master renders.
- Master's quirks stay, even one that master's own comments call wrong (ARCH-01, A11Y-03).
- Tests keep master's names. Master's comments come over only when they say why.

Ask only at a file map row marked `(?)`, at an existing file of the paragraph above, and in
step 4. Once these reads are done, write the first template in the same turn.

## 2. Write each template, then its stories

A React component becomes a template function in a `.template.ts` file (ARCH-11). An SVG asset
becomes one too. For each template that the file map gives:

1. Write the template from [references/template.md](references/template.md).
2. Write its `.stories.ts` file next to it from [references/story.md](references/story.md).

A React hook becomes a reactive controller: see [references/controller.md](references/controller.md).
Don't write any test yet.

## 3. Write the contract surface into the PR description draft

List what the original exposes, from master's code, then check that the templates keep every item,
even one that looks like a bug. Merchant CSS, plugin e2e suites and screen readers depend on them
(ARCH-08, STYLE-09, A11Y-01). `tests/integration/contract/inventory.json` lists the contract names.

The draft is `pr-description.local.md` at the repo root, which Git ignores: create it if missing.
Write a `## Contract surface` section, or replace it, with one line per item and master's values.
Write "none" for an empty item, so the reviewer sees that you checked it. Name each timer and
listener with where it starts and stops, and each option with its default.

```markdown
## Contract surface

Master original: `<path>` at `<first 7 characters of scripts/ref-sha.txt>`

- Classes: `<class>` from `<Name>.module.css`, ...
- IDs: ...
- `data-testid`: ...
- Roles and ARIA: ...
- Keyboard handlers: ...
- Message IDs: ...
- Timers and listeners: ...
- Options read: ...
```

## 4. Ask the developer to check the stories

End your turn with a message like this one, and write no test before the developer answers.

> Please run `npm run storybook`, then check each story with Merchant CSS off and on, next to
> master's component:
>
> - `http://localhost:6006/?path=/story/<story id>&globals=merchantCss:off`
> - `http://localhost:6006/?path=/story/<story id>&globals=merchantCss:on`
>
> Tell me what differs from master, and any violation in the Accessibility panel, or that they
> match.

Build each story ID as `story.md` says. Fix what the developer reports, and ask again when the fix
changes what a story shows.

## 5. Port the tests

Port master's tests of the original into the test files that the file map gives, with
[references/test.md](references/test.md) and [references/jest-to-vitest.md](references/jest-to-vitest.md).
Every case of master comes over under its name, apart from the exceptions in `test.md`.

## 6. Write the element, if the port owns it

Only when the file map gives a `.element.ts` file, from [references/element.md](references/element.md).

## 7. Run the checks

Run each command, fix what fails, and run it again until everything passes. Pipe the longer ones
through `tail` so only the decisive lines reach the conversation, with `set -o pipefail` so the
exit code stays the command's own, not `tail`'s:

```bash
npm run lint
npm run typecheck
npm run test:no-coverage -- <the port's test files>
set -o pipefail && npm test 2>&1 | tail -n 40
set -o pipefail && npm run build-storybook 2>&1 | tail -n 40
npm run build:contract
set -o pipefail && npm run test:contract 2>&1 | tail -n 60
```

These scripts run without a permission prompt, unlike `npx eslint` or `npx vitest`. In the
contract run, this failure means that the port made a test pass:
`"<test>" passes on dist/. Remove it from tests/integration/contract/expected-failures.json.`
Remove that entry, and change nothing else under `tests/integration/contract/`. The other entries
keep failing until their own port lands, and their file snapshots show as `Snapshots N failed`:
the exit code is what counts. Run `npm run test:contract` again after removing entries.

Add `## Expected failures removed` and `## Dropped test cases` sections to the PR description
draft, each with its entries or "none".

## 8. Review

Invoke the lit-review skill. Once the developer has decided on each finding, fix the accepted
ones in this session, because lit-review doesn't fix. When a fix adds or changes a story, ask the
developer to check it as in step 4. When you changed any file, run the checks of step 7 again.
With no PR, add the section that lit-review prints to the PR description draft.

## 9. Report

Tell the developer which files you created and changed, the result of each check, the expected
failures removed, the review findings and their decisions, and anything left to them. Don't commit.
