# Alma.Widgets

## `initialize(merchantId: string, domain: Alma.ApiMode.TEST | Alma.ApiMode.LIVE)`

Initialize the widget library with your merchantID

### merchantId `string` [required]

Your merchant id as it is found in the dashboard

### domain `Alma.ApiMode.TEST | Alma.ApiMode.LIVE` [required]

- `Alma.ApiMode.TEST` Used to test the widget. Data will match what is provided in your sandbox dashboard
- `Alma.ApiMode.LIVE` Used in production mode. Data will match what is provided in your production dashboard

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

| Option name             |                                                                      Type                                                                      |              Required               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :---------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| container               |                                                                    `string`                                                                    |            **required**             | Your container's selector                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| purchaseAmount          |                                                                    `number`                                                                    |            **required**             | The purchase amount (in euro cents)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| plans                   |                                                 `Plan[]` [more info below](#plan-option-plan)                                                  |              optional               | An array of the plans you want to display. If not provided, the widget returns all your available payment plans.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| transitionDelay         |                                                                    `number`                                                                    | optional (default value is `5500`)  | The amount of time in between button animations in ms. If the value is set to `-1` there is no loop.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| locale                  | `fr` or `es` or `it` or `de` or `nl` or `pt`, or `en` or local-country format (e.g `fr-FR`, `de-DE`, `it-IT`)[more info below](#locale-option) | optional (default value is `"en"`)  | Defines the language displayed on the widgets                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| hideIfNotEligible       |                                                                   `boolean`                                                                    | optional (default value is `false`) | Totally hides the widget if set to true and no plan matches the purchase amount.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| monochrome              |                                                                   `boolean`                                                                    | optional (default value is `true`)  | If set to `false`, Alma's logo and the active payments plan will be orange (#FA5022).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| suggestedPaymentPlan    |                                                             `number` or `number[]`                                                             |              optional               | Allow to choose which payment plan's tab will be displayed by default. It will have effect only if the selected plan is eligible. If an array is provided, it will select the first eligible plan from this array.<br /> ex: `suggestedPaymentPlan: [10, 4]` In this example, the 10 installments plan will be selected. If it's not eligible, the 4 installments plan will be selected. If the 4 installments plan is not eligible, it will select the first tab. When `suggestedPaymentPlan` is used, the transition is disable. Unless `transitionDelay` is specified. |
| customerBillingCountry  |                     `string` (e.g `fr` or `es` or `it` or `de` or `nl` or `pt`, or `en`) [more info below](#locale-option)                     |              optional               | Allow to display fee plans specific for a country. Example: you're selling in France and Germany, the credit options are only available in France, so you can specify this option to 'fr' to show credits on the widget for french customers.Both options offer the same result, they allow to simplify the integration if there is no information about customer's shipping address.                                                                                                                                                                                     |
| customerShippingCountry |                     `string` (e.g `fr` or `es` or `it` or `de` or `nl` or `pt`, or `en`) [more info below](#locale-option)                     |              optional               | Allow to display fee plans specific for a country. Example: you're selling in France and Germany, the credit options are only available in France, so you can specify this option to 'fr' to show credits on the widget for french customers.Both options offer the same result, they allow to simplify the integration if there is no information about customer's shipping address.                                                                                                                                                                                     |
| hideBorder              |                                                                   `boolean`                                                                    | optional (default value is `false`) | Hide the border if set to true, set to false as default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| cards                   |                                  `cb` and/or `visa` and/or `amex` and/or `mastercard` as an array of strings                                   |              optional               | Display card logos in the modal                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| onModalClose            |                                                                (event) => void                                                                 |              optional               | Call back that will be called when the modal is closed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Add Modal

`add(widget: Alma.Widgets.Modal, options: ModalOptions)`

```
const {open, close} = widgets.add(Alma.Widgets.Modal, {
    container: '#alma-widget-modal',
    purchaseAmount: 20000
})
```

Display a modal with the eligible payment plans for the given purchase amount.
Can be open with the `clickableSelector` option or by calling the `open` methods.

### `ModalOptions`

| Option name             |                                                                      Type                                                                       |              Required              | Description                                                                                                                                                                                                                                                                                                                                                                           |
| :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| container               |                                                                    `string`                                                                     |            **required**            | Your container's selector                                                                                                                                                                                                                                                                                                                                                             |
| purchaseAmount          |                                                                    `number`                                                                     |            **required**            | The purchase amount (in euro cents)                                                                                                                                                                                                                                                                                                                                                   |
| plans                   |                                                  `Plan[]` [more info below](#plan-option-plan)                                                  |              optional              | An array of the plans you want to display. If not provided, the widget returns all your available payment plans.                                                                                                                                                                                                                                                                      |
| locale                  | `fr` or `es` or `it` or `de` or `nl` or `pt`, or `en` or local-country format (e.g `fr-FR`, `de-DE`, `it-IT`) [more info below](#locale-option) | optional (default value is `"en"`) | Defines the language displayed on the widgets                                                                                                                                                                                                                                                                                                                                         |
| clickableSelector       |                                                                    `string`                                                                     | optional (default value is `null`) | If provided, the modal will open when the element matching this query selector is clicked.                                                                                                                                                                                                                                                                                            |
| customerBillingCountry  |                     `string` (e.g `fr` or `es` or `it` or `de` or `nl` or `pt`, or `en`) [more info below](#locale-option)                      |              optional              | Allow to display fee plans specific for a country. Example: you're selling in France and Germany, the credit options are only available in France, so you can specify this option to 'fr' to show credits on the widget for french customers.Both options offer the same result, they allow to simplify the integration if there is no information about customer's shipping address. |
| customerShippingCountry |                     `string` (e.g `fr` or `es` or `it` or `de` or `nl` or `pt`, or `en`) [more info below](#locale-option)                      |              optional              | Allow to display fee plans specific for a country. Example: you're selling in France and Germany, the credit options are only available in France, so you can specify this option to 'fr' to show credits on the widget for french customers.Both options offer the same result, they allow to simplify the integration if there is no information about customer's shipping address. |
| cards                   |                                   `cb` and/or `visa` and/or `amex` and/or `mastercard` as an array of strings                                   |              optional              | Display card logos in the modal                                                                                                                                                                                                                                                                                                                                                       |
| onClose                 |                                                                 (event) => void                                                                 |              optional              | Call back that will be called when the modal is closed                                                                                                                                                                                                                                                                                                                                |

## Plan option: `Plan`

You can customize the displayed plans with this parameter. You can hide a plan that would be displayed otherwise by adding the other plans with this information:

| Option name       |   Type   |   Required   | Description                                                               |
| :---------------- | :------: | :----------: | :------------------------------------------------------------------------ |
| installmentsCount | `number` | **required** | The number of installment in the plan                                     |
| minAmount         | `number` | **required** | The minimum purchase amount required to activate the plan (in euro cents) |
| maxAmount         | `number` | **required** | The maximum purchase amount required to activate the plan (in euro cents) |
| deferredDays      | `number` |   optional   | The number of days by which the first payment will be deferred            |
| deferredMonths    | `number` |   optional   | The number of months by which the first payment will be deferred          |

By default, the widget will display all your available payment plans.

## Customize CSS

If you want to customize the look of the widget, you can edit all classes that start with `alma-`

You can see the list by inspecting the element with your dev tools. Don't use the classes that have an unpronounceable name, they will change at each new version of the widget.

## Locale option

The locales supported by the widgets are :

- `en` - Generic English - This is the locale set by default.
- `fr` - Generic French
- `fr-FR` - French from France
- `de` - Generic German
- `de-DE` - German from Germany
- `it` - Generic Italian
- `it-IT` - Italian from Italy
- `es` - Generic Spanish
- `es-ES` - Spanish from Spain
- `pt` - Generic Portuguese
- `pt-PT` - Portuguese from Portugal
- `nl` - Generic Dutch
- `nl-NL` Dutch from The Netherlands
- `nl-BE` Dutch from Belgium

If the specific locale for the country you target is available, we suggest to use it instead of the generic locale.

The locale is used in the Widgets to display all wordings in the correct language but also to format numbers, dates, currencies into the standard format.

For example, for a pricing, the locale `pt` will format as `€ 100,00` while the locale `pt-PT` will format as `100,00 €`.
