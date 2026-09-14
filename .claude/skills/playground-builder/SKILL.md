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
2. Copy `playground/main.ts`, `playground/mockFetch.ts`, `playground/dom.ts`,
   `playground/harnessConfig.ts`, `playground/ConfigPanel.ts`, `playground/ConfigPlansEditor.ts`,
   `playground/planDrafts.ts`, `playground/PlanDraftCard.ts`, `playground/ResponseEditor.ts`,
   `playground/almaLogo.ts`, `playground/formatDueDate.ts`, `playground/productPreview.ts`,
   `playground/playground.css`, `playground/tsconfig.json`, and `playground/index.html` from
   `${CLAUDE_SKILL_DIR}/assets/playground/` verbatim — never retype or re-derive them from the
   gotchas that describe them. This isn't optional plumbing to skip for a "simpler" playground; see
   the Architecture reference table at the bottom of this file for what each one is for and why
   it's copied rather than written. `index.html` is bundled too, not written fresh, since its
   content (a root `<div>`, a script tag pointing at `./main.ts`, a stylesheet link to
   `./playground.css`) is just as feature-independent as the rest — keep gotcha 3 in mind if it
   ever needs a new asset link (it can't link anything outside `playground/`).
3. `main.ts` calls `mountApp(container)` — `playground/App.ts` (Step 3) must export a function
   with that exact name and signature, since that's the contract the bundled entry point relies
   on. `App.ts` wires `buildConfigPanel`, `buildConfigPlansEditor`, `buildResponseEditor`, and
   `buildProductPreview`/`buildAlmaLogo` together, defines this feature's own preset list (built
   from the bundled `makeEligibleDraft`/`makeIneligibleDraft`), and passes `configPlans` through as
   `Widgets.add`'s `plans` option (`undefined` when the list is empty, not `[]` — an empty array
   and "option not passed" are different states to `filterEligibility.ts`). Purchase amount is
   `config.purchaseAmount * quantity` (unit price × the product mockup's quantity selector, gotcha
   17) — threaded into both `draftToEligibilityPlan(...)` and `Widgets.add(...)`.
4. Run the setup script to gitignore the playground paths (this script itself is fine to keep
   committed — it's just a pointer, harmless even before the playground exists; see the script's
   own header for why its write is safe to run unconfirmed). It doesn't touch `package.json`: the
   playground runs via `npx vite --config vite.playground.config.ts` directly (Step 4), so there's
   no npm script to add.
   ```bash
   bash "${CLAUDE_SKILL_DIR}/scripts/ensure-setup.sh"
   ```

Step 2 is done when `playground/main.ts`, `mockFetch.ts`, `dom.ts`, `harnessConfig.ts`,
`ConfigPanel.ts`, `ConfigPlansEditor.ts`, `planDrafts.ts`, `PlanDraftCard.ts`, `ResponseEditor.ts`,
`almaLogo.ts`, `formatDueDate.ts`, `productPreview.ts`, `playground.css`, `tsconfig.json`, and
`index.html` all exist under `playground/`, `vite.playground.config.ts` exists at the repo root,
and `ensure-setup.sh` has run — not before moving to Step 3.

### Class vocabulary — reuse these, don't invent new ones

`playground.css` (bundled) already styles every class below. `App.ts` (the one remaining
written-fresh file that builds markup — `PlanDraftCard.ts`/`ResponseEditor.ts` are bundled now)
should build its own markup to use these directly, rather than inventing new one-off class names
that `playground.css` has no rule for and that end up unstyled.

*Maintenance note for whoever edits this table:* before changing a row, `grep` the class name
against `assets/playground/*.ts` to confirm the claim still matches what the bundled code actually
does — this table has twice drifted from the real code (a class documented as applied that wasn't,
a class documented with no caveat that in fact had zero usage).

| Purpose | Classes |
|---|---|
| Collapsible section (`<details>`) | `pg-section` (wraps), `pg-section > summary` gets a `pg-section-chevron` child span, body goes in `pg-section-body` |
| Section sub-groups | `pg-subheading` (a small caption above a related group of fields/buttons) |
| Labeled input/select | `pg-field` (wraps a `<label>` + `<input>`/`<select>`) |
| A field grid inside a card | `pg-plan-grid` (2-column), each `<label>` wraps its own input; invalid input gets `pg-field-invalid`, its message `pg-field-error` |
| Explanatory text | `pg-callout` (a static aside), `pg-toggle-row` (a checkbox + its explanation as one row) |
| Buttons | `pg-button` (base) + `pg-button--primary` (the one main action, e.g. "+ Add plan") or `pg-button--ghost` (everything else, e.g. presets); group several in `pg-button-row` |
| One mocked-plan card (baseline in `PlanDraftCard.ts`) | outer `pg-plan-card` + `pg-plan-card--eligible`/`--ineligible` (the current draft's variant) wrapping an inner `<details class="pg-plan-card-details">`; `pg-remove` for its remove button (absolutely positioned, so the outer wrapper needs `position: relative`, which `pg-plan-card` already sets); the summary's label text goes in `pg-plan-summary-text` |
| Status pill (in a card summary) | `pg-pill` + `pg-pill--eligible`/`--ineligible`/`--error` |
| The eligible/ineligible toggle (baseline in `PlanDraftCard.ts`) | `pg-switch-label` wrapping `pg-switch` (which wraps the checkbox + a `pg-switch-track` span) |
| The due-dates chip row (baseline in `PlanDraftCard.ts`, eligible drafts only) | `pg-chip-row` (+ a `pg-chip-row-label` caption) containing `pg-chip` spans |
| Merchant-plan-constraints table | `pg-plan-table` (already used by the bundled `ConfigPlansEditor.ts`), row-remove buttons use `pg-remove-inline` |
| Raw JSON preview | `pg-json-preview` (a `<pre>`) |
| Drag-to-reorder list (baseline in `ResponseEditor.ts`, gotchas 5-7) | `pg-plan-drag-item` (+ `--over` while a drop target), `pg-plan-drag-handle` for the grip |
| A single-line inline error (e.g. next to a button) | `pg-inline-error` (available for `App.ts`'s own feature-specific errors — no baseline usage) |

Page-level layout (`App.ts`, written once and reused as-is across features): `pg-layout` (the two-
column shell), `pg-app-header`/`pg-app-header-title` (page header + `buildAlmaLogo()`),
`pg-panel` (left column, scrollable), `pg-preview`/`pg-preview-label`/`pg-preview-surface` (right
column, the live-preview pane). The product mockup wrapping the widget mount inside the preview
pane (built by the bundled `productPreview.ts`, not written by hand) uses `product` (the card),
`pg-widget-slot` (where the widget's own mount div goes), and `add-to-cart` (the decorative
button) — undocumented-but-real classes worth knowing about if `App.ts` needs to adjust the shell.

## Step 3: Scope the playground to the feature under test

Do this every time — including immediately after building the plumbing, and again whenever the
feature under test changes. This is the step that actually needs judgment; everything else is
mechanical.

The temptation is to expose every widget option "just in case." Resist it — a playground that once
scoped itself to DCC2 legal disclosures worked well specifically *because* it only showed six
fields (installments, deferred period, fee, interest rate, country, eligibility) instead of every
`PaymentPlanWidgetOptions` key. A panel with thirty knobs where only four matter is worse than one
with the right four.

1. **`ConfigPanel.ts`, `ConfigPlansEditor.ts`, `ResponseEditor.ts`, and `PlanDraftCard.ts` are all
   baseline, not optional extras** — every fresh playground gets the full mocked-plan editor
   (eligible *and* ineligible drafts, the eligible/ineligible toggle, drag-to-reorder, due-date
   chips, cross-draft duplicate-installments validation) and the product-mockup/quantity-selector
   preview shell, whether or not the feature under test "needs" all of it. This is a deliberate
   exception to the "don't expose thirty knobs" principle below: `PlanDraft`'s field set mirrors
   `EligiblePlan`/`IneligiblePlan` exactly (fixed by the API contract, not by any one feature), so
   there's no meaningful sense in which a feature would need *fewer* of those fields — the scoping
   judgment is entirely about `ConfigPanel.ts`'s own widget-level options (point 4) and this
   feature's own presets (point 5), never about trimming the plan editor itself. If a feature
   interacts with `filterEligibility.ts`'s merchant-plan-config behavior (most do), demonstrate it
   by actually adding/removing rows in the running `ConfigPlansEditor.ts` table, not by leaving it
   out and writing a comment that explains what would happen if it existed.
2. **Seed non-empty, matching defaults for `configPlans` and `drafts` — don't start the panel
   empty.** `App.ts` wires both `ConfigPlansEditor.ts`'s initial `configPlans` and
   `ResponseEditor.ts`'s initial `drafts` state; default each to a small set of *matching* plans
   (a few installments counts, one `makeDefaultConfigPlanRow(count)` row paired with one eligible
   draft at that same count — see `ConfigPlansEditor.ts`'s `makeDefaultConfigPlanRow(installmentsCount)`)
   derived from one shared list of counts, so they can't drift apart and so the widget preview
   shows real plans the moment the playground loads — not an empty preview the user has to reach
   for a preset button before seeing anything. Use the bundled `planDrafts.ts`'s
   `makeEligibleDraft(installmentsCount)` for this (no fees/interest/deferral) — both the defaults
   here and any preset in point 5 below build off the same primitive.
3. **Find out what actually changes rendering for this feature**, before touching any UI code:
   - Grep `src/` for the feature's own logic — a new predicate, a hook, a branch in a component.
   - Read `src/hooks/useFetchEligibility.ts` and `src/utils/filterEligibility.ts` regardless of the
     feature — nearly every observable rendering difference traces back to what these two do with
     the raw API response (what gets hidden, what gets recomputed, what triggers a refetch), not to
     the widget's top-level options.
   - If unsure, spawn an Explore agent rather than guessing: "which files determine whether/how
     [X] renders in this widget, and what response/config fields do they read?"
4. **Only add a field to `ConfigPanel.ts` if step 3 found a real code path that reads it** — this
   is the one place the "don't expose thirty knobs" principle still applies (point 1 already
   covers why it no longer applies to the plan editor itself). Everything else stays out entirely —
   the mocked response can still set a sensible fixed value for it under the hood without exposing
   a control nobody needs. If `App.ts` needs any other new markup, build it as a plain DOM node
   (see `el()` in `dom.ts`); event handlers mutate state and call `refreshWidgetPreview()` (gotcha
   2). `ResponseEditor.ts`/`PlanDraftCard.ts` are bundled now, but read
   `references/gotchas.md` gotchas 7-9 and 12 anyway if `App.ts` needs its own list-like or
   per-item-validated UI beyond what they already provide — the failure modes there (stale
   closures, doubled-up listeners, fighting an input's own cursor, orphaned nodes from touching
   `syncList`'s handle map directly) are easy to hit blind and easy to avoid once you know they
   exist.
5. **Build one-click presets for this feature's branches, in `App.ts`, off the bundled
   `makeEligibleDraft`/`makeIneligibleDraft` factories** — one per code branch the feature
   introduces (DCC2's are one per `requiresLegalDisclosure()` outcome: pay now, pay later, PNX,
   credit), not generic "3x/6x/12x" presets that don't map to anything meaningful here. Pass the
   resulting `PlanPreset[]` into `buildResponseEditor(...)` — it's a parameter, not a fixed import,
   precisely so each feature supplies its own.
6. **Don't carry over fields specific to a different feature.** A country field only belongs in the
   panel if the current feature is country-dependent, the way DCC2 disclosures are — a feature with
   some other axis needs its own equivalent, not a leftover unused field from last time.
7. **If the feature has a "surprising unless you know why" quirk beyond what `ConfigPlansEditor.ts`
   already covers** — surface it inline at the exact point someone would trip over it (an
   empty-state message, a disabled control with a one-line reason next to it), rather than as
   upfront documentation nobody will read before hitting the confusing behavior themselves.

Step 3 is done when every field in the panel traces back to a code path found in step 3, the panel
shows real plans on first load per point 2 (not an empty state), and every branch the feature
introduces has its own preset — not when the panel merely looks plausible.

## Step 4: Verify before calling it done

```bash
npx vite --config vite.playground.config.ts     # starts the dev server (no package.json script needed)
npx tsc --noEmit -p playground/tsconfig.json    # NOT plain `tsc --noEmit` — see gotcha 11, it checks nothing in playground/
```

Actually exercise 2-3 scenarios in the running playground — including at least one edge case
specific to the feature just scoped for — rather than trusting that it compiles and looks
plausible.

Step 4 is done when the dev server starts, `npx tsc --noEmit -p playground/tsconfig.json` exits
0, and 2-3 scenarios (including that edge case) have actually been exercised in the browser —
not when it merely compiles.

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
| `playground/harnessConfig.ts` | `HarnessConfig` type + defaults: merchant ID, domain, locale, unit price. Fully generic — every feature needs these four. | Copied from `assets/playground/` |
| `playground/ConfigPanel.ts` | Builds the "Widget" section: locale + purchase amount. A copied starting point, not purely verbatim — Step 3 may add a field here (rare) if it found a widget-level option beyond those two. | Copied from `assets/playground/`, extend only if Step 3 finds a reason to |
| `playground/ConfigPlansEditor.ts` | Builds the editable merchant-plan-constraints table — what `filterEligibility.ts` matches mocked plans against (`ConfigPlan` from `@/types`, fixed shape). Fully generic, never needs a feature-specific field. | Copied from `assets/playground/` |
| `playground/tsconfig.json` | Generic plumbing — see Step 2 point 2, gotcha 11. | Copied from `assets/playground/` |
| `playground/index.html` | Generic plumbing — see Step 2 point 2, gotcha 3. | Copied from `assets/playground/` |
| `playground/planDrafts.ts` | Fully generic mocked-plan draft machinery: the `PlanDraft` discriminated union (`EligiblePlanDraft \| IneligiblePlanDraft`, mirroring `EligiblePlan`/`IneligiblePlan`'s own fields), `draftToEligibilityPlan(draft, purchaseAmount)`, `isDuplicateInstallments`/`isValidDraft(drafts, draft)`, `toEligibleDraft`/`toIneligibleDraft`, `makeEligibleDraft`/`makeIneligibleDraft`, `defaultSummarizeDraft`. The ineligible branch's `withConstraints({ purchase_amount: { minimum, maximum } })` — gotcha 13 — is the one place a flat shape compiles-looking-fine under an unscoped `tsc` and is silently wrong. | Copied from `assets/playground/` |
| `playground/planSummary.ts` | Optional. Only written when a feature wants custom category wording (DCC2's "pay later"/"PNX"/"credit" labels, say) beyond the bundled generic `defaultSummarizeDraft`; `App.ts` passes whichever one it imports into `buildResponseEditor`/cards. | Written fresh, scoped to the feature, optional |
| `playground/PlanDraftCard.ts` | Builds one collapsible card per mocked plan draft: eligible/ineligible toggle + status pill, per-variant field grid, due-dates chip row (eligible drafts only, derived from `draftToEligibilityPlan` — gotcha 19), required/duplicate validation (gotchas 7-9). | Copied from `assets/playground/` |
| `playground/ResponseEditor.ts` | Orchestrates the draft list via `syncList`: add/remove, drag-to-reorder (gotchas 5-7, 12), cross-draft duplicate detection, quick-scenario presets (passed in, not a fixed import — Step 3 point 5), response delay/error simulation, raw JSON preview. Returns `{ element, refresh() }`, not a bare element — `App.ts` calls `.refresh()` whenever `purchaseAmount` changes independently of the draft list (gotcha 17). | Copied from `assets/playground/` |
| `playground/almaLogo.ts` | `ALMA_LOGO_SVG` + `buildAlmaLogo()` — the real Alma wordmark, inlined per gotcha 3. | Copied from `assets/playground/` |
| `playground/formatDueDate.ts` | `formatDueDate(unixSeconds)`, used by `PlanDraftCard.ts`'s due-dates chip row. | Copied from `assets/playground/` |
| `playground/productPreview.ts` | `buildProductPreview({ productName, unitPriceCents, quantity, quantities?, onQuantityChange, widgetMount })` — the product-card shell (title, quantity select, price, the widget's own mount slot, "add to cart") wrapping the widget preview, mirroring `examples/basic.html`. Returns `{ element, refresh(unitPriceCents, quantity) }`, not a bare element — same reason as `ResponseEditor.ts` (gotcha 17): the unit price can change from `ConfigPanel.ts` independently of this component. | Copied from `assets/playground/` |
| `playground/App.ts` | Exports `mountApp(container)`; wires `ConfigPanel.ts`, `ConfigPlansEditor.ts`, `ResponseEditor.ts`, `productPreview.ts`, and `almaLogo.ts` to one shared state object plus local `quantity` state; defines this feature's presets (Step 3 point 5) and, if written, imports `planSummary.ts`'s `summarize`; seeds `configPlans`/`drafts` with matching non-empty defaults (Step 3 point 2) instead of starting empty; mounts the widget via `Widgets.initialize(...).add(...)`, passing `configPlans` through as the `plans` option and `config.purchaseAmount * quantity` as `purchaseAmount` — gotchas 4 and 17. | Written fresh, scoped to the feature |
| `playground/playground.css` | Styles for the panel — the full `pg-*` class vocabulary (see the table above Step 3). Fully generic: no feature-specific selectors, safe to reuse unchanged every time. | Copied from `assets/playground/` |

Every path above, plus `vite.playground.config.ts`, is gitignored (`scripts/ensure-setup.sh`
ensures this). `main.ts`, `mockFetch.ts`, `dom.ts`, `harnessConfig.ts`, `ConfigPlansEditor.ts`,
`planDrafts.ts`, `PlanDraftCard.ts`, `ResponseEditor.ts`, `almaLogo.ts`, `formatDueDate.ts`,
`productPreview.ts`, `playground.css`, `tsconfig.json`, and `index.html` are bundled and copied
byte-for-byte — their content never depends on the feature under test, so copying them avoids
retyping the gotchas that describe them from memory each time. `ConfigPanel.ts` is also bundled
but, unlike those, is a starting point Step 3 may extend. `App.ts` is written fresh every time
(it's the one file with the `mountApp(container)` contract, and the one whose content genuinely
depends on the feature under test); `planSummary.ts` is written fresh only when a feature wants
custom category wording. Use this table (plus the class vocabulary table above) as the map of
what to create, and `references/gotchas.md` for the parts that are easy to get subtly wrong.

The Alma logo in `App.ts`'s `pg-app-header-title` is already handled by the bundled
`almaLogo.ts` (`buildAlmaLogo()`) — inlined as an SVG string constant rather than imported from a
component or linked as a raw `<img src>`, see gotcha 3. Any *other* small static image a specific
feature needs should follow the same pattern.
