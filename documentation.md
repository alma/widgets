# Alma.Widgets

## `initialize(merchantId: string, domain: Alma.ApiMode.TEST | Alma.ApiMode.LIVE)`

Initialize the widget library with your merchantID

### merchantId `string` [required]

Your merchant id as it is found in the dashboard

### domain `Alma.ApiMode.TEST | Alma.ApiMode.LIVE` [required]

- `Alma.ApiMode.TEST` Used to test the widget
- `Alma.ApiMode.LIVE` Used in production mode. data will match what is provided in your dashboard

## `add(widget: Alma.Widgets.PaymentPlans, options: PaymentPlansOptions )`

### widget: `Alma.Widgets.PaymentPlans` [required]

Add a button with the eligibles payment plans for the given purchase amount

## Options: `PaymentPlansOptions`

### container: `string` [required]

Your container's selector

### purchaseAmount: `number` [required]

The purchase amount (in euro cents)

### plans: `Plan[]` [optional]

An array of the plans you want to display. If not provided, the widget returns all your available payment plans.

### transitionDelay: `number` [optional, default: 5500]

The ammount of time in between button animations in ms.

### locale: `fr|en|es|it|de|nl` [optional, default: en]

### hideIfNotEligible: `boolean` [optional, default: false]

Totally hide the widget if set to true and no plan matches the purchase amount.

## Plan: `Plan`

### installmentsCount: `number` [required]:

the number of installement in the plan

### minAmount: `number` [required]

the minimum purchase amount required to activate the plan (in euro cents)

### maxAmount: `number` [required]

the minimum purchase amount allowed to activate the plan (in euro cents)

### deferredDays: `number` [optional]:

the number of days by which the first payment will be deferred

### deferredMonths: `number` [optional]

the number of months by which the first payment will be deferred
