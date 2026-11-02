---
name: lit-review
description: Reviews the current branch of the Lit port with three read-only agents, for architecture, CSS and the merchant contract, and accessibility, then merges their findings, lets the developer accept or reject each one and writes the PR checklist and a findings table into the PR description. It checks the port against the ARCH, LAYER, NAME, STYLE and A11Y rules and master's React code, not generic bugs. Use it whenever someone asks to review a Lit port, a branch, a diff or a PR of this repo before it merges, such as "review my changes", "run the review agents" or "is this port ready", and at the end of a port.
---

# Review a branch of the Lit port

Lint and the tests can't see a timer that never stops, a lost ARIA state, a renamed contract class,
a business rule written in a template or a helper in the wrong folder. Three agents of
`.claude/agents/` look for these, each with its own rules, and compare the changes with the React
original at the reference commit:

| Agent | Rules |
| --- | --- |
| `lit-architecture-reviewer` | ARCH, LAYER and NAME |
| `css-contract-reviewer` | STYLE, and the contract tests |
| `a11y-reviewer` | A11Y |

The agents edit nothing, and neither does this skill until the developer confirms the write to the
PR description in step 5. Fixing a finding is a separate request.

Write each SHA, branch and path in full in each command, with no `$`, variable or loop, because
Claude Code asks before it runs a command that holds `$`.

## 1. Find the base and the changes

1. Look for the PR of the branch: `gh pr view --json number,url,title,body,baseRefName`. When it
   fails, there is no PR, or `gh` isn't logged in: go on without a PR, and say so in step 5.
2. The base is the PR's `baseRefName`. With no PR, it is `feature/lit-migration` when
   `git rev-parse --verify --quiet refs/remotes/origin/feature/lit-migration` prints a SHA, and
   `master` otherwise.
3. Check that `origin/<base>` is current: compare `git rev-parse origin/<base>` with the SHA that
   `git ls-remote --exit-code --heads origin <base>` prints. A stale `origin/<base>` widens the
   diff with commits that aren't the branch's, so when `git rev-parse` fails or the two differ,
   ask the developer to run `git fetch origin <base>` and stop.
4. The merge base: `git merge-base HEAD origin/<base>`.
5. The changes, uncommitted ones included: `git diff --name-status <merge base>` for the tracked
   files, and `git ls-files --others --exclude-standard` for the new files that aren't staged yet.
6. The reference SHA: read `scripts/ref-sha.txt`.

When nothing changed, say so and stop.

## 2. Run the three agents in one message

Send the three Agent calls in a single message, so they run in parallel. Give each the same
prompt:

```text
Review the changes of this branch against your rules.

- Base branch: <base>
- Merge base: <merge base SHA>
- Reference SHA: <reference SHA>
- Changed files, uncommitted changes included:
  <one line per file: status and path, a rename as "R <old> -> <new>", untracked files as "??">
- PR: <number, title and body, or "none">

Return your findings in your output format, or "No findings.", with any closing line that your
output format asks for.
```

An agent reviews only the files that its rules cover, so pass every changed file to all three.
Wait until all three have returned before you merge.
Run an agent once more when it fails, returns lines that don't follow its format, or, for
`lit-architecture-reviewer`, has no `Searched:` line, which means it skipped its searches. When it
returns `Missing input: <input>`, add that input to the prompt first. If it fails again, go on
with the other two and say which review is missing.

## 3. Merge the findings

Each finding is one line: `SEVERITY | RULE-ID | path:line | problem | fix`. Ignore the other
lines, such as the `Searched:` line.

1. Drop duplicates. Two findings on the same file, within a few lines, that describe the same
   problem are one finding: keep the higher severity, list both rule IDs, and keep the clearer fix.
2. Sort by severity, CRITICAL, then HIGH, then MEDIUM, then by path and line.
3. Number them from 1.

## 4. Let the developer decide

Show the findings as a table, with the number, severity, rule, `path:line`, problem and fix, and
the count for each agent, "no findings" included. Then end your turn with:

> Reply with the numbers of the findings you reject, each with a reason, or "all accepted".

A finding the developer doesn't reject is accepted. Don't change any code in this step.

## 5. Write the checklist and the findings

Build the section from [references/pr-checklist.md](references/pr-checklist.md), with its two
`lit-review` markers. `.github/pull_request_template.md` must hold that block as it is, and
`npm run test:harness` checks it.

1. Copy the checklist. When a checklist item covers the rule of an accepted finding, add
   `(findings 2, 5)` at its end. Leave every box as it is in the PR description, and unticked when
   the PR description doesn't have the item yet, because the developer ticks them. Match an item
   by its text without a trailing `(findings …)`, and replace that suffix rather than adding a
   second one. A finding whose rule no item lists stays in the table only.
2. The checklist sits in a collapsed `<details>` block, because it mostly serves the agents. After
   `</details>`, add this, before the end marker, so the findings stay visible:

   ```markdown
   ## Review findings

   `<merge base, first 7 characters>`..`<HEAD, first 7 characters>` and uncommitted changes, against master at `<reference SHA, first 7 characters>`.

   | # | Severity | Rule | Location | Problem | Fix | Decision |
   | --- | --- | --- | --- | --- | --- | --- |
   | 1 | HIGH | ARCH-12 | `src/...:41` | ... | ... | Accepted |
   ```

   The Decision column says `Accepted`, or `Rejected: <reason>`. With no finding, write
   `No findings.` instead of the table. For each agent that failed twice in step 2, add
   `Missing review: <agent>` after the range line, so the PR never reads as clean when a review
   didn't run.

The section holds the code findings only, and the `Missing review:` lines: no summary of this
conversation, no test results and no other notes.

**With a PR**, show the section and ask: "Write this section into the description of PR #<number>?"
Write nothing until the developer says yes. Then:

1. Read the current body again with `gh pr view <number> --json body`, because someone may have
   edited it since step 1.
2. Replace everything from `<!-- lit-review:start -->` to `<!-- lit-review:end -->` with the new
   section. When the body has no markers, add the section at its end, after a blank line. Keep
   every other line of the body as it is.
3. Pass the new body on standard input, in a quoted heredoc so the shell expands nothing in it:

   ```bash
   gh pr edit <number> --body-file - <<'LIT_REVIEW_BODY'
   <new body>
   LIT_REVIEW_BODY
   ```

   Claude Code asks before it runs `gh pr edit`, because `settings.json` leaves it out of the
   allowed commands on purpose. The developer sees the whole body in that prompt.
4. Give the developer the PR URL.

**With no PR**, print the section in a fenced `markdown` block, so the developer can paste it into
the PR description later.
