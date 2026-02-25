# Feature Parity: Lit vs Preact

Detailed comparison of features between the Preact widget (original) and the Lit implementation (current).

This document reflects the current code in `widgets/src/Widgets/*` (Preact) and `widgets-lit/src/*` (Lit).

---

## Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| **Core Features** | ✅ Complete | Payment plans + modal behavior match at feature level |
| **API Compatibility** | ✅ 100% | Same `Alma.Widgets.initialize()` / `add()` interface |
| **CSS Isolation** | ✅ Better (Lit) | Shadow DOM prevents host CSS conflicts |
| **Reactivity** | ✅ Better (Lit) | Property updates without re-mount |
| **Session Cache + Dedup** | ✅ Complete | Hashed cache + 1h TTL + in-flight dedup |
| **Accessibility** | ⚠️ Partial | Keyboard navigation still missing in Lit |
| **Translations** | ✅ Complete | Same locales supported |

---

## Detailed Feature Comparison

### Payment Plans Widget

| Feature | Preact | Lit | Status | Notes |
|---------|--------|-----|--------|-------|
| Display available plans | ✅ | ✅ | ✅ Complete | Uses eligibility API response |
| Plan animation (cycling) | ✅ | ✅ | ✅ Complete | Stops after one cycle; respects suggested plan behavior |
| Installments display (2x/3x/4x/10x) | ✅ | ✅ | ✅ Complete | Buttons from eligibility data |
| Deferred payments (J+15, J+30) | ✅ | ✅ | ✅ Complete | Deferred plans supported |
| P1X visibility | ✅ | ✅ | ✅ Complete | Only shown when explicitly configured in `plans` |
| Fee indicator / info text | ✅ | ✅ | ✅ Complete | Matches preact behavior |
| Monochrome mode | ✅ | ✅ | ✅ Complete | Orange vs monochrome styling |
| Hide if not eligible | ✅ | ✅ | ✅ Complete | No render when no plans |
| Suggested plan highlight | ✅ | ✅ | ✅ Complete | `suggestedPaymentPlan` honored |
| Disabled plans visible (eligible=false) | ✅ | ✅ | ✅ Complete | Only when `plans` is provided |
| Disabled plans non-interactive | ✅ | ✅ | ✅ Complete | Not clickable / focusable |
| Stop animation on hover | ✅ | ✅ | ✅ Complete | Permanent stop after user interaction |
| Screen-reader announcement on plan change | ✅ | ✅ | ✅ Complete | `aria-live` announcement in Lit |
| Animation instruction announcement | ✅ | ⚠️ | ⚠️ Partial | Pre/React announces instructions; Lit does not |
| Keyboard navigation (arrows/home/end) | ✅ | ⚠️ | ⚠️ Partial | Arrow L/R implemented; Home/End missing |

### Modal Widget

| Feature | Preact | Lit | Status | Notes |
|---------|--------|-----|--------|-------|
| Payment schedule display | ✅ | ✅ | ✅ Complete | Timeline + amounts |
| Plan buttons (eligible only) | ✅ | ✅ | ✅ Complete | Modal shows eligible only |
| P1X visibility | ✅ | ✅ | ✅ Complete | Only when explicitly configured |
| Calendar visualization | ✅ | ✅ | ✅ Complete | Desktop + mobile layouts |
| Total + fees breakdown | ✅ | ✅ | ✅ Complete | Includes “dont frais” line |
| Legal credit text | ✅ | ✅ | ✅ Complete | Credit warnings in modal |
| Card logos | ✅ | ✅ | ✅ Complete | CB / Visa / Mastercard / Amex |
| Alma branding | ✅ | ✅ | ✅ Complete | Logo + brand colors |
| Close button + overlay click | ✅ | ✅ | ✅ Complete | Escape key supported |
| Responsive layout | ✅ | ✅ | ✅ Complete | Desktop modal + mobile drawer |
| Skip links (RGAA 11.13.1) | ✅ | ✅ | ✅ Complete | Keyboard-only visibility in Lit |
| Focus trap in modal | ✅ | ✅ | ✅ Complete | Tab stays inside modal |
| Initial focus on open | ✅ | ✅ | ✅ Complete | Focus moved into dialog |
| Loading announcement | ✅ | ✅ | ✅ Complete | `role="status"` + `aria-live` |

### Data & API Handling

| Feature | Preact | Lit | Status | Notes |
|--------|--------|-----|--------|-------|
| Fetch eligibility API | ✅ | ✅ | ✅ Complete | `POST /v2/payments/eligibility` |
| Session cache | ✅ | ✅ | ✅ Complete | SessionStorage cache in Lit |
| Cache expiry (1h) | ✅ | ✅ | ✅ Complete | TTL enforced |
| Cache key hashing | ✅ | ✅ | ✅ Complete | Hashed key in Lit |
| Shared in-flight dedup | ✅ | ✅ | ✅ Complete | Prevents double API calls |
| Error handling | ✅ | ✅ | ✅ Complete | Fallback + logging |
| Loading states | ✅ | ✅ | ✅ Complete | Loading indicators |

### Integration & API Surface

| Feature | Preact | Lit | Status | Notes |
|--------|--------|-----|--------|-------|
| UMD bundle | ✅ | ✅ | ✅ Complete | CDN-friendly |
| ESM export | ✅ | ✅ | ✅ Complete | Module usage |
| `initialize()` | ✅ | ✅ | ✅ Complete | Same signature |
| `add()` | ✅ | ✅ | ✅ Complete | Same widget constants |
| Auto-modal integration | ✅ | ✅ | ✅ Complete | PaymentPlans opens modal |
| Manual modal wiring | ✅ | ✅ | ✅ Complete | `modalSelector` supported |
| Reactive updates | ⚠️ | ✅ | ✅ Better in Lit | No re-mount needed |
| Shadow DOM isolation | ❌ | ✅ | ✅ New in Lit | Prevents CSS conflicts |
| Global constants (Widgets/Utils/ApiMode) | ✅ | ✅ | ✅ Complete | Same global API surface |

### Localization

| Language | Preact | Lit | Status |
|----------|--------|-----|--------|
| French | ✅ | ✅ | ✅ Complete |
| English | ✅ | ✅ | ✅ Complete |
| German | ✅ | ✅ | ✅ Complete |
| Spanish | ✅ | ✅ | ✅ Complete |
| Italian | ✅ | ✅ | ✅ Complete |
| Portuguese | ✅ | ✅ | ✅ Complete |
| Dutch | ✅ | ✅ | ✅ Complete |

### Styling & Fonts

| Feature | Preact | Lit | Status | Notes |
|---------|--------|-----|--------|-------|
| Argent font | ✅ | ✅ | ✅ Complete | Loaded via CDN in Lit |
| Inter font | ✅ | ✅ | ✅ Complete | Loaded via CDN in Lit |
| Brand colors | ✅ | ✅ | ✅ Complete | Orange + monochrome |
| CSS isolation | ❌ | ✅ | ✅ New in Lit | Shadow DOM |
| Responsive breakpoints | ✅ | ✅ | ✅ Complete | Desktop + mobile layouts |
| Inline compact width | ✅ | ✅ | ✅ Complete | Container shrinks to fit plan buttons |
| Plan style (tabs/buttons) | ✅ | ✅ | ✅ Complete | Tabs style supported in Lit |
| Bottom sheet modal | ✅ | ✅ | ✅ Complete | Desktop can render a bottom sheet |

---

## Known Gaps (Lit)

1. **PaymentPlans keyboard navigation (Home/End)**
   - Preact supports full keyboard navigation including Home/End keys.
   - Lit currently implements ArrowLeft/ArrowRight but not Home/End navigation.

2. **Animation instruction announcements**
   - Preact announces animation controls via screen reader instructions.
   - Lit currently does not announce these instructions.

3. **Crowdin integration**
   - Not implemented in Lit POC (translations are static JSON only).

---

## Notes on Performance

- Lit avoids full re-mount on property updates and uses Shadow DOM for isolation.
- Session cache + in-flight dedup reduces repeated eligibility API calls.
- Bundle sizes should be measured locally via `npm run build` (sizes vary per build).

---

## Migration Path

See `docs/MIGRATION.md` for the detailed migration guide.

**TL;DR:** API is compatible; migration usually requires no integration changes.
