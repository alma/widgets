# Migration Guide: Preact Widgets → Lit Widgets (POC)

This POC provides a Lit Web Components implementation designed to replace the existing Preact widgets **without breaking the integration API**.

## Goals

- Keep the same global API: `Alma.Widgets.initialize()` and `widgets.add()`
- Keep the same widget names: `Alma.Widgets.PaymentPlans` and `Alma.Widgets.Modal`
- Keep the same configuration options (as much as possible)
- Improve performance:
  - ✅ Smaller bundle
  - ✅ CSS isolation (Shadow DOM)
  - ✅ Reactive updates (no full re-mount required on amount changes)

---

## 1) Script tag (CDN) – the only required asset

### Preact

```html
<script src="https://cdn.../widgets.umd.js"></script>
```

### Lit

```html
<script src="https://cdn.../alma-widgets.umd.js"></script>
```

The Lit build inlines its styles into the JS bundle and relies on Shadow DOM for CSS isolation.

---

## 2) Initialization – identical

```js
const widgets = Alma.Widgets.initialize('merchant_xxx', Alma.ApiMode.TEST)
```

---

## 3) PaymentPlans options – compatibility matrix

| Option | Preact | Lit | Notes |
|---|---:|---:|---|
| `container` | ✅ | ✅ | CSS selector string |
| `purchaseAmount` | ✅ | ✅ | Amount in cents |
| `locale` | ✅ | ✅ | Defaults to `fr` |
| `plans` | ✅ | ✅ | JSON array of plan constraints |
| `cards` | ✅ | ✅ | `['cb','visa','mastercard','amex']` |
| `monochrome` | ✅ | ✅ | `false` = orange, `true` = black/white |
| `hideBorder` | ✅ | ✅ | Borderless mode |
| `hideIfNotEligible` | ✅ | ✅ | Hide widget when no eligible plans |
| `transitionDelay` | ✅ | ✅ | Animation delay; `-1` disables |
| `suggestedPaymentPlan` | ✅ | ✅ | Number or array of numbers |
| `onModalClose` | ✅ | ✅* | *Supported via `widgets.add(Modal, { onModalClose })` for migration convenience |
| `modalSelector` | ❌ | ✅ | New in Lit to connect PaymentPlans → an existing modal |

---

## 4) Modal options – compatibility matrix

| Option | Preact | Lit | Notes |
|---|---:|---:|---|
| `container` | ✅ | ✅ | CSS selector string |
| `purchaseAmount` | ✅ | ✅ | Amount in cents |
| `locale` | ✅ | ✅ | Defaults to `fr` |
| `plans` | ✅ | ✅ | JSON array of plan constraints |
| `cards` | ✅ | ✅ | Accepted cards list for display |
| `clickableSelector` | ✅ | ✅ | Selector for external triggers |
| `onClose` | ✅ | ✅ | In Lit: implemented by listening to `modal-closed` event |

**Events (Lit only):**
- `modal-opened`
- `modal-closed`

---

## 5) Amount updates – avoid re-mounting

### Preact (typical pattern)

The legacy HTML examples often re-add the widget to update the amount:

```js
widgets.add(Alma.Widgets.PaymentPlans, { container: '#alma', purchaseAmount })
```

This re-mounts the entire React tree.

### Lit (recommended pattern)

With Lit, you can keep the same widget instance mounted and update properties:

```js
const el = document.querySelector('alma-payment-plans')
const modal = document.querySelector('alma-modal')

el.purchaseAmount = newAmount
modal.purchaseAmount = newAmount
```

If you still call `widgets.add()` repeatedly with the same `container`, the Lit implementation **reuses the same Web Component instance** and only updates reactive properties.

---

## 6) Recommended integration patterns

### A. Simplest integration (auto modal)

```js
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#alma-widget',
  purchaseAmount: 45000,
  locale: 'fr',
})
```

No modal declaration required.

### B. Manual modal (external triggers + shared modal)

```js
widgets.add(Alma.Widgets.Modal, {
  container: '#alma-modal',
  purchaseAmount: 45000,
  locale: 'fr',
  clickableSelector: '#open-modal',
})

widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#alma-widget',
  purchaseAmount: 45000,
  locale: 'fr',
  modalSelector: '#alma-modal alma-modal',
})
```

---

## Out of scope (POC)

- Crowdin integration and automated translation sync
- Deployment automation

