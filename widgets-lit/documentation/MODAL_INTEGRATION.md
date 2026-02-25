# Modal Integration Guide

## Automatic Modal (Default)

If you do not provide `modalSelector`, the modal is created automatically and opens when a plan is clicked.

```js
const widgets = Alma.Widgets.initialize('YOUR_MERCHANT_ID', Alma.ApiMode.LIVE)

widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#alma-widget',
  purchaseAmount: 45000,
  locale: 'fr',
})
```

---

## Manual Modal (Shared / External Trigger)

Declare the modal explicitly when you need a shared dialog or external triggers.

```js
const widgets = Alma.Widgets.initialize('YOUR_MERCHANT_ID', Alma.ApiMode.LIVE)

widgets.add(Alma.Widgets.Modal, {
  container: '#alma-modal',
  purchaseAmount: 45000,
  locale: 'fr',
  clickableSelector: '#custom-button',
})

widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#alma-payment-plans',
  purchaseAmount: 45000,
  locale: 'fr',
  modalSelector: '#alma-modal alma-modal',
})
```

Notes:
- The modal is resolved at click time, so you can re-run `widgets.add()` without re-mounting.
- For reactive updates, update `purchaseAmount` directly on the elements.

---

## Programmatic Control

`widgets.add(Alma.Widgets.Modal, ...)` returns `open()` and `close()` helpers:

```js
const modal = widgets.add(Alma.Widgets.Modal, {
  container: '#alma-modal',
  purchaseAmount: 45000,
})

modal.open()
modal.close()
```
