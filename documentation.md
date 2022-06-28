# Alma.Widgets

## `initialize(merchantId: string, domain: Alma.ApiMode.TEST | Alma.ApiMode.LIVE)`

Initialize the widget library with your merchantID

### merchantId `string` [required]

Your merchant id as it is found in the dashboard

### domain `Alma.ApiMode.TEST | Alma.ApiMode.LIVE` [required]

- `Alma.ApiMode.TEST` Used to test the widget
- `Alma.ApiMode.LIVE` Used in production mode. data will match what is provided in your dashboard

## Add PaymentPlans

`add(widget: Alma.Widgets.PaymentPlans, options: PaymentPlansOptions)`

```
widgets.add(Alma.Widgets.PaymentPlans, {
    container: '#alma-widget-payment-plans',
    purchaseAmount: 20000
})
```

Add a button with the eligibles payment plans for the given purchase amount

### `PaymentPlansOptions`

- container: `string` [required]

Your container's selector

- purchaseAmount: `number` [required]

The purchase amount (in euro cents)

- plans: `Plan[]` [optional]

An array of the plans you want to display. If not provided, the widget returns all your available payment plans.

- transitionDelay: `number` [optional, default: 5500]

The amount of time in between button animations in ms.

- locale: `fr|en|es|it|de|nl` [optional, default: en]

- hideIfNotEligible: `boolean` [optional, default: false]

Totally hides the widget if set to true and no plan matches the purchase amount.

- monochrome: `boolean` [optional, default: true]

If set to `false`, Alma's logo and the active payments plan will be underlined in red (#FF414D).

- suggestedPaymentPlan: `number` | `number[]` [optional]

Allow to choose which payment plan's tab will be displayed by default. It will have effect only if the selected plan is eligible. If an array is provided, it will select the first eligible plan from this array.

- hideBorder: `boolean` [optional, default: false]

Hide the border if set to true, set to false as default

```
suggestedPaymentPlan: [10, 4],
```

In the above example, the 10 installments plan will be selected. If it's not eligible, the 4 installments plan will be selected. If the 4 installments plan is not eligible, it will select the first tab.
When `suggestedPaymentPlan` is used, the transition is disable. Unless `transitionDelay` is specified.

- cards: ('cb' | 'visa' | 'amex' | 'mastercard')[] [optional]

Display card logos in the modal

## Add Modal

`add(widget: Alma.Widgets.Modal, options: ModalOptions)`

```
const {open, close} = widgets.add(Alma.Widgets.Modal, {
    container: '#alma-widget-modal',
    purchaseAmount: 20000
})
```

Display a modal with the eligibles payment plans for the given purchase amount.
Can be open with the `clickableSelector` option or by calling the `open` methods.

### `ModalOptions`

- container: `string` [required]

Your container's selector

- purchaseAmount: `number` [required]

The purchase amount (in euro cents)

- plans: `Plan[]` [optional]

An array of the plans you want to display. If not provided, the widget returns all your available payment plans.

- locale: `fr|en|es|it|de|nl` [optional, default: en]

- clickableSelector: `string` [optional, default: null]

If provided, the modal will open when the element matching this query selector is clicked.

- cards: ('cb' | 'visa' | 'amex' | 'mastercard')[] [optional]

Display card logos in the modal

## Plan option: `Plan`

- installmentsCount: `number` [required]:

the number of installment in the plan

- minAmount: `number` [required]

the minimum purchase amount required to activate the plan (in euro cents)

- maxAmount: `number` [required]

the minimum purchase amount allowed to activate the plan (in euro cents)

- deferredDays: `number` [optional]:

the number of days by which the first payment will be deferred

- deferredMonths: `number` [optional]

the number of months by which the first payment will be deferred

## Customize CSS

If you inspect the widgets, you can see two types of classes :

- one that looks gibberish
- one starting with `alma-`

You want to use those starting with `alma-` to add your own css style.
