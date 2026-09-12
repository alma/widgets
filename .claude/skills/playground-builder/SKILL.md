---
name: playground-builder
description: Scaffolds and adapts a local, live-reloading playground for @alma/widgets — a control panel for editing widget config and a mocked eligibility-API response side by side with a live widget preview, so behavior (payment plan lists, legal disclosures, ineligible plans, deferred/pay-later/credit scenarios, merchant plan constraints) can be verified visually without hitting the real API or waiting on backend test data. Use this when the user wants to visually verify or demo a change to @alma/widgets, mock the eligibility API response, or see how the widget looks with a specific plan or scenario (P1X, pay later, an ineligible plan, a given country, a fee or interest rate, a merchant plan config). Also use it to set up, fix, or rescope a local playground, QA harness, or preview/sandbox tool for the widgets package — even if the user never says the word "skill", and even if no playground/ folder exists yet in the checkout.
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, Agent
---

# Playground builder

## What this is for

`@alma/widgets` components fetch real eligibility data from Alma's API. Verifying a rendering
change usually means either standing up real merchant test data (slow, and someone else's plan
constraints) or reading the code very carefully and hoping (unreliable). This playground sidesteps
both: a small Vite app that mounts the real widget through its real public API, but intercepts only
the eligibility fetch so you can shape the response by hand — while the widget's own hook,
filtering, and rendering logic all run unmodified. If it looks right here, it looks right for real.

This only works inside alma/widgets: it depends on the repo's own path aliases,
`src/test/planBuilders.ts`, `src/utils/filterEligibility.ts`, and the public
`Widgets.initialize(...)` API.

**The control panel itself is plain TypeScript + DOM APIs — no JSX, no React, no Preact, no
framework of any kind** — see `references/gotchas.md`'s intro for why this stays framework-free
even though the widget under test is Preact today.

**The playground (`playground/`, `vite.playground.config.ts`) is scratch, not a maintained
artifact — it is never committed.** `.gitignore` covers both paths (see
`scripts/ensure-setup.sh`). A playground scoped to one feature goes stale the instant a different
feature needs testing, so it's rebuilt fresh (or adapted from whatever's already on disk in the
same session) each time instead. If `git status` shows `playground/` or
`vite.playground.config.ts` as untracked, that's expected — don't `git add` them.

## Step 1: Figure out which mode you're in

Check whether the playground already exists on disk (most likely because you're continuing the
same working session — it can't have survived from an earlier one via git):

```bash
test -f vite.playground.config.ts && test -d playground && echo "playground exists" || echo "needs building"
```

- **Doesn't exist** → Step 2 (build the plumbing), then Step 3 (scope).
- **Already exists** → skip straight to Step 3, but read the existing files first (see
  "Rescoping an existing playground" below) instead of overwriting them.

## Step 2: Build the generic plumbing

This part is the same every time regardless of feature — it's not something to expose judgment on,
just infrastructure:

1. Write `vite.playground.config.ts` (repo root): a separate Vite dev server rooted at
   `playground/`, reusing the *current* `resolve.alias` block from the repo's real
   `vite.config.ts` — read it directly rather than assuming what it contains. This block exists
   purely so the playground can `import` the widget under test (`@/...`), not for anything the
   panel itself needs — the panel has no aliases to keep in sync with, since it's plain DOM code.
2. Copy `playground/main.ts`, `playground/mockFetch.ts`, `playground/dom.ts`, and
   `playground/tsconfig.json` from `${CLAUDE_SKILL_DIR}/assets/playground/` verbatim — their
   content never depends on the feature under test or repo state, so there's no reason to retype
   them from scratch (or from the explanations in the gotchas that describe them, which exist to
   explain *why* they're written this way, not to be transcribed each time). `tsconfig.json`
   specifically exists because the repo's own `tsconfig.json` doesn't include `playground/` at
   all — without it, Step 4's typecheck silently checks nothing in `playground/` and passes
   regardless of what's actually in there (gotcha 11). Write `playground/index.html` fresh — a
   root `<div>`, a script tag pointing at `./main.ts` (`type="module"`), and a stylesheet link to
   `./playground.css` (the panel styles Step 3 will write) — keeping in mind gotcha 3 (it can't
   link anything outside `playground/`).
3. `main.ts` calls `mountApp(container)` — `playground/App.ts` (Step 3) must export a function
   with that exact name and signature, since that's the contract the bundled entry point relies
   on.
4. Run the setup script to gitignore the playground paths (this script itself is fine to keep
   committed — it's just a pointer, harmless even before the playground exists; see the script's
   own header for why its write is safe to run unconfirmed). It doesn't touch `package.json`: the
   playground runs via `npx vite --config vite.playground.config.ts` directly (Step 4), so there's
   no npm script to add.
   ```bash
   bash "${CLAUDE_SKILL_DIR}/scripts/ensure-setup.sh"
   ```

Step 2 is done when `playground/main.ts`, `mockFetch.ts`, `dom.ts`, `tsconfig.json`, and
`index.html` all exist under `playground/`, `vite.playground.config.ts` exists at the repo root,
and `ensure-setup.sh` has run — not before moving to Step 3.

## Step 3: Scope the playground to the feature under test

Do this every time — including immediately after building the plumbing, and again whenever the
feature under test changes. This is the step that actually needs judgment; everything else is
mechanical.

The temptation is to expose every widget option "just in case." Resist it — a playground that once
scoped itself to DCC2 legal disclosures worked well specifically *because* it only showed six
fields (installments, deferred period, fee, interest rate, country, eligibility) instead of every
`PaymentPlanWidgetOptions` key. A panel with thirty knobs where only four matter is worse than one
with the right four.

1. **Find out what actually changes rendering for this feature**, before touching any UI code:
   - Grep `src/` for the feature's own logic — a new predicate, a hook, a branch in a component.
   - Read `src/hooks/useFetchEligibility.ts` and `src/utils/filterEligibility.ts` regardless of the
     feature — nearly every observable rendering difference traces back to what these two do with
     the raw API response (what gets hidden, what gets recomputed, what triggers a refetch), not to
     the widget's top-level options.
   - If unsure, spawn an Explore agent rather than guessing: "which files determine whether/how
     [X] renders in this widget, and what response/config fields do they read?"
2. **Only add a field to the panel if step 1 found a real code path that reads it.** Everything
   else stays out entirely — the mocked response can still set a sensible fixed value for it under
   the hood without exposing a control nobody needs. Build each field as a plain DOM node (see
   `el()` in `dom.ts`) driven by one shared state object — there's no component tree, just
   functions that build DOM and event handlers that mutate state and call `refreshWidgetPreview()`
   (gotcha 2). Read `references/gotchas.md` gotchas 7-9 and 12 before wiring up anything list-like
   (add/remove/reorder) or anything with per-item validation — the failure modes there (stale
   closures, doubled-up listeners, fighting an input's own cursor, orphaned nodes from touching
   `syncList`'s handle map directly) are easy to hit blind and easy to avoid once you know they
   exist.
3. **Build one-click presets for this feature's branches** — one per code branch the feature
   introduces (the DCC2 playground had one per `requiresLegalDisclosure()` outcome: pay now, pay
   later, PNX, credit), not generic "3x/6x/12x" presets that don't map to anything meaningful here.
4. **Don't carry over fields specific to a different feature.** A country field only belongs in the
   panel if the current feature is country-dependent, the way DCC2 disclosures are — a feature with
   some other axis needs its own equivalent, not a leftover unused field from last time.
5. **If the feature has a "surprising unless you know why" quirk** — DCC2's is: P1X plans are
   hidden whenever no merchant plan config is passed at all, purely because that's the widget's own
   production safety default — surface it inline at the exact point someone would trip over it
   (e.g. an empty-state message right where the config table would be), rather than as upfront
   documentation nobody will read before hitting the confusing behavior themselves.

Step 3 is done when every field in the panel traces back to a code path found in step 1, and every
branch the feature introduces has its own preset — not when the panel merely looks plausible.

## Step 4: Verify before calling it done

```bash
npx vite --config vite.playground.config.ts     # starts the dev server (no package.json script needed)
npx tsc --noEmit -p playground/tsconfig.json    # NOT plain `tsc --noEmit` — see gotcha 11, it checks nothing in playground/
```

Actually exercise 2-3 scenarios in the running playground — including at least one edge case
specific to the feature just scoped for — rather than trusting that it compiles and looks
plausible.

## Rescoping an existing playground

If `playground/` already exists on disk — most likely built earlier in this same session for a
different feature — don't regenerate it from scratch. Whatever's there likely already accounts for
the pitfalls in `references/gotchas.md`; rewriting risks reintroducing them. Instead:

1. Read the existing files before changing anything.
2. Add, remove, or adjust only the fields/presets/callouts relevant to the *current* feature,
   following the same research-first approach as Step 3.
3. If the playground still carries fields for a feature that's no longer what's being tested, it's
   fine to prune them rather than let the panel accumulate every feature ever tested in one
   session.

## Architecture reference

| File | Role | Source |
|---|---|---|
| `vite.playground.config.ts` (repo root) | Generic plumbing — see Step 2 point 1. Run via `npx vite --config vite.playground.config.ts`. | Written fresh (aliases can drift) |
| `playground/main.ts` | Generic plumbing — see Step 2 point 2, gotcha 1. | Copied from `assets/playground/` |
| `playground/mockFetch.ts` | Generic plumbing — see Step 2 point 2, gotcha 2. | Copied from `assets/playground/` |
| `playground/dom.ts` | Generic plumbing — see Step 2 point 2, gotchas 12 and 15. | Copied from `assets/playground/` |
| `playground/tsconfig.json` | Generic plumbing — see Step 2 point 2, gotcha 11. | Copied from `assets/playground/` |
| `playground/index.html` | Generic plumbing — see Step 2 point 2, gotcha 3. | Written fresh |
| `playground/planDrafts.ts` | Small "draft" shapes for a mocked plan, converted to realistic `EligibilityPlan` fixtures via `src/test/planBuilders.ts`. Ineligible plans need `withConstraints({ purchase_amount: { minimum, maximum } })` — gotcha 13 (a flat shape compiles-looking-fine under an unscoped `tsc` and is silently wrong). | Written fresh, scoped to the feature |
| `playground/planSummary.ts` | One-line human-readable summary of a draft, for collapsed card headers. | Written fresh, scoped to the feature |
| `playground/playgroundConfig.ts` | Widget-level config (merchant ID, domain, locale, unit price) — separate from the mocked response. | Written fresh, scoped to the feature |
| `playground/ConfigPanel.ts` | Builds the config fields — only the ones Step 3 found to matter. | Written fresh, scoped to the feature |
| `playground/ConfigPlansEditor.ts` | Builds the editable table for the merchant's plan constraints — what `filterEligibility.ts` matches mocked plans against. | Written fresh, scoped to the feature |
| `playground/PlanDraftCard.ts` | Builds one collapsible card per mocked plan draft, with per-field validation (gotchas 7-9). | Written fresh, scoped to the feature |
| `playground/ResponseEditor.ts` | Orchestrates the draft list via `syncList`: add/remove, drag-to-reorder (gotchas 5-7, 12), quick-scenario presets, response delay/error simulation, raw JSON preview. | Written fresh, scoped to the feature |
| `playground/App.ts` | Exports `mountApp(container)`; wires everything to one shared state object; mounts the widget via `Widgets.initialize(...).add(...)` — gotcha 4. | Written fresh, scoped to the feature |
| `playground/playground.css` | Styles for the panel. | Written fresh, scoped to the feature |

Every path above, plus `vite.playground.config.ts`, is gitignored (`scripts/ensure-setup.sh`
ensures this). Only `main.ts`, `mockFetch.ts`, `dom.ts`, and `tsconfig.json` are bundled — their
content never depends on the feature under test, so copying them avoids retyping the gotchas that
describe them from memory each time. Everything else is written fresh and scoped per Step 3, using
this table as the map of what to create and `references/gotchas.md` for the parts that are easy to
get subtly wrong.

A logo or other small static image (`playground/App.ts`'s header, say) should be inlined as an SVG
string constant rather than imported from a component or linked as a raw `<img src>` — see
gotcha 3.
