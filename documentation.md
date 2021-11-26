# Alma.Widgets

### initialise

> initialise(merchantId: string, domain: Alma.ApiMode.TEST | Alma.ApiMode.PROD)

Initialises the widget library with your merchantID

###### parameters

> merchantId: `string` [required]

Your merchant id as it is found in the dashboard

domain: `Alma.ApiMode.TEST | Alma.ApiMode.PROD` [required]

- `Alma.ApiMode.TEST` Used to test the widget
- `Alma.ApiMode.LIVE` Used in production mode. data will match what is provided in your dashboard

### add

> add(widget: widgetTypes.PaymentPlans, options: {} | {})

Adds an element to the widget

###### parameters

> widget: `widgetTypes.PaymentPlans [required]

will define the element to be added:

- widgetTypes.PaymentPlans: A button with the your eligibilies for a given price that opens a modal

> options: `PaymentPlansOptions`

> PaymentPlansOptions:`{container:string, purchaseAmount:number, plans: Plan[], transitionDelay:number}`

- **container** [required]: a string with the selector of your container - must select a unique element
- **purchaseAmount** [required]: the amount of the purchase (in cents)
- **plans** [optionnal]: an array of the plans you intend to offer
- **transitionDelay** [optionnal]: The ammount of time in between button animations

> Plan: `{installmentsCount:number,deferredDays:number, deferredMonths:number, minAmount:number, maxAmount:number}`

- **installmentsCount** [required]: the number of installement in the plan
- **deferredDays** [optionnal]: the number of days by which the first payment will be deferred
- **deferredMonths** [optionnal] the number of months by which the first payment will be deferred
- **minAmount** [required] the minimum purchase amount required to activate the plan (in cents)
- **maxAmount** [required] the minimum purchase amount allowed to activate the plan (in cents)
