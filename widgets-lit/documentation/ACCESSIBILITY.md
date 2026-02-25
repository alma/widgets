# Accessibility

This package ships embedded widgets meant to be integrated into third-party merchant pages.
Because of that, the accessibility strategy focuses on:

- Being usable with keyboard and screen readers.
- Not breaking host page semantics (especially heading hierarchy).
- Keeping CSS isolated (Shadow DOM) while still providing accessible focus styles.

> Note: Since the widgets run in Shadow DOM, some browser behaviors (fonts, focus, a11y tooling)
> may vary between real browsers and headless test runners.

## What we currently implement

### Modal (`<alma-modal>`)

- Dialog semantics:
  - `role="dialog"` and `aria-labelledby`.
  - Backdrop/overlay click closes the modal.
  - `Escape` closes the modal.

- Focus management:
  - When the modal opens, we make the host page non-interactive.
    - Preferred: `inert` (when supported).
    - Fallback: we disable pointer interactions and keyboard focusability in the background:
      - `pointer-events: none` on background elements.
      - All focusable descendants get `tabindex="-1"` temporarily.
      - Form controls are temporarily disabled.
      - Previous values are restored on close.
  - Focus is trapped within the dialog using a Tab key handler.
  - When the modal closes, focus is restored to the element that opened it.

- Skip links (RGAA 11.13.1 intent):
  - Skip links are rendered inside the modal.
  - They are enabled only when the modal is opened after a keyboard interaction.
    - If the modal is opened via pointer/click, skip links remain disabled to avoid visual noise.
  - When enabled, they are visually hidden by default and become visible on focus.
  - Targets use `tabindex="-1"` to allow programmatic focus.

- Screen reader friendly sectioning (without impacting the merchant page headings):
  - We avoid using `h1/h2/...` to prevent breaking the host page outline.
  - Instead, we use `role="heading" aria-level="…"` for section titles inside the component.

### Payment plans (`<alma-payment-plans>`)

- Uses real `<button>` elements for plan selection.
- Selected state is exposed through `aria-pressed`.
- Announces plan changes via a polite `aria-live` region.
- Keyboard navigation:
  - `Tab` and `Shift+Tab` move between eligible plans.
  - `ArrowLeft` and `ArrowRight` navigate between eligible plans (skipping ineligible ones).
  - `Enter` or `Space` selects the focused plan and opens the modal.
  - Ineligible plans are not focusable (`tabindex="-1"` + `disabled`).
- Focus behavior matches hover: the focused plan becomes active and displays info.
- Emits events for integrations:
  - `plan-selected` (used to open the modal on the selected plan).

---

## Known gaps

- Arrow navigation (Left/Right) is implemented; Home/End navigation not yet implemented in PaymentPlans.
- Animation instruction announcements for screen readers.
- A formal WCAG 2.1 AA audit (color contrast, focus visibility, touch targets).

---

## Tests and network calls

All automated tests are designed to be local and deterministic.

- Unit/component tests stub `globalThis.fetch`.
- No test should hit the real Alma eligibility API.

If you ever see a real network call in test output, it's a regression and should be fixed by
stubbing `fetch` earlier in the test lifecycle.

## Known limitations / things to validate

The points below are not necessarily blockers for a PoC, but they should be verified before production:

- `inert` support depends on the browser. We keep a fallback, but behavior may vary across browsers.
- We don't run automated a11y linters (axe) yet. The project currently relies on unit tests + manual audits.
- Prefer-reduced-motion is not implemented everywhere (animations might still run).

## Manual audit checklist (recommended)

### Keyboard

- Open modal from:
  - a plan button inside `<alma-payment-plans>`
  - an external "merchant" button (standalone modal integration)
- Once open:
  - `Tab` stays within the dialog.
  - `Shift+Tab` stays within the dialog.
  - `Escape` closes the dialog.
  - Focus returns to the opener.
  - If opened with keyboard: skip links become visible when focused and move focus to the correct section.

### Screen readers

- VoiceOver (macOS):
  - Confirm the dialog is announced as a dialog.
  - Confirm the modal title is read.
  - Confirm the information list (1/2/3) is readable.

- NVDA (Windows):
  - Confirm the dialog and its regions are discoverable.
  - Confirm plan buttons read proper labels and pressed state.

## Automated tests

We check a subset of accessibility-critical behaviors via unit tests:

- Modal open/close behavior
- Escape closes the modal
- Skip links gating (enabled after keyboard interaction, disabled after pointer interaction)
- Focus restore on close

> Note on focus tests: headless browsers are inconsistent with Shadow DOM focus.
> We avoid asserting pixel-perfect focus movement in unit tests and instead validate deterministic behaviors.
> For fully reliable cross-AT validation, use manual audits.

See:

- `src/components/modal.test.ts`
- `src/components/payment-plans.test.ts`

## Implementation notes

Key files:

- `src/components/modal.ts`
- `src/components/styles/modal.styles.ts`
- `src/components/payment-plans.ts`

When you add new content, prefer:

- semantic HTML (`button`, `nav`, `ol`, `ul`)
- ARIA only when semantics are not enough
- `role="heading" aria-level="…"` rather than `h1/h2/h3…` to avoid breaking the host page outline
