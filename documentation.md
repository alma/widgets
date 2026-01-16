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

| Option name              |                                                                      Type                                                                       |               Required               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|:-------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------:|:------------------------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| container                |                                                                    `string`                                                                     |             **required**             | Your container's selector                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| purchaseAmount           |                                                                    `number`                                                                     |             **required**             | The purchase amount (in euro cents)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| merchant_covers_all_fees |                                                                    `boolean`                                                                    |               optional               | If set to true, the widget will display plans as if the merchant covers all fees. The value should be the same as the one used in the payment creation request. Default value is false.                                                                                                                                                                                                                                                                                                                                                                                   |
| plans                    |                                                 `Plan[]`   [more info below](#plan-option-plan)                                                 |               optional               | An array of the plans you want to display. If not provided, the widget returns all your available payment plans.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| transitionDelay          |                                                                    `number`                                                                     |  optional (default value is `5500`)  | The amount of time in between button animations in ms. If value is set to -1, then there is no loop.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| locale                   | `fr` or `es` or  `it` or `de` or `nl` or `pt`, or `en` or local-country format (e.g `fr-FR`, `de-DE`, `it-IT`)[more info below](#locale-option) | optional (default value is  `"en"`)  | Defines the language displayed on the widgets                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| hideIfNotEligible        |                                                                    `boolean`                                                                    | optional (default value is `false`)  | Totally hides the widget if set to true and no plan matches the purchase amount.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| monochrome               |                                                                    `boolean`                                                                    |  optional (default value is `true`)  | If set to `false`, Alma's logo and the active payments plan will be orange (#FA5022).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| suggestedPaymentPlan     |                                         `number`                                     or      `number[]`                                         |               optional               | Allow to choose which payment plan's tab will be displayed by default. It will have effect only if the selected plan is eligible. If an array is provided, it will select the first eligible plan from this array.<br /> ex: `suggestedPaymentPlan: [10, 4]` In this example, the 10 installments plan will be selected. If it's not eligible, the 4 installments plan will be selected. If the 4 installments plan is not eligible, it will select the first tab. When `suggestedPaymentPlan` is used, the transition is disable. Unless `transitionDelay` is specified. |
| customerBillingCountry   |                    `string` (e.g `fr` or `es` or  `it` or `de` or `nl` or `pt`, or `en`)  [more info below](#locale-option)                     |               optional               | Allow to display fee plans specific for a country. Example: you're selling in France and Germany, the credit options are only available in France, so you can specify this option to 'fr' to show credits on the widget for french customers.Both options offer the same result, they allow to simplify the integration if there is no information about customer's shipping address.                                                                                                                                                                                     |
| customerShippingCountry  |                  `string` (e.g `fr` or `es` or  `it` or `de` or `nl` or `pt`, or `en`)      [more info below](#locale-option)                   |               optional               | Allow to display fee plans specific for a country. Example: you're selling in France and Germany, the credit options are only available in France, so you can specify this option to 'fr' to show credits on the widget for french customers.Both options offer the same result, they allow to simplify the integration if there is no information about customer's shipping address.                                                                                                                                                                                     |
| hideBorder               |                                                                    `boolean`                                                                    | optional  (default value is `false`) | Hide the border if set to true, set to false as default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| cards                    |                                   `cb` and/or `visa` and/or `amex` and/or `mastercard` as an array of strings                                   |               optional               | Display card logos in the modal                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| onModalClose             |                                                                 (event) => void                                                                 |               optional               | Call back that will be called when the modal is closed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |


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

| Option name              |                                                                       Type                                                                       |              Required               | Description                                                                                                                                                                                                                                                                                                                                                                           |
|:-------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------:|:-----------------------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| container                |                                                                     `string`                                                                     |            **required**             | Your container's selector                                                                                                                                                                                                                                                                                                                                                             |
| purchaseAmount           |                                                                     `number`                                                                     |            **required**             | The purchase amount (in euro cents)                                                                                                                                                                                                                                                                                                                                                   |
| merchant_covers_all_fees |                                                                    `boolean`                                                                     |              optional               | If set to true, the widget will display plans as if the merchant covers all fees. The value should be the same as the one used in the payment creation request. Default value is false.                                                                                                                                                                                               |
| plans                    |                                                 `Plan[]`   [more info below](#plan-option-plan)                                                  |              optional               | An array of the plans you want to display. If not provided, the widget returns all your available payment plans.                                                                                                                                                                                                                                                                      |
| locale                   | `fr` or `es` or  `it` or `de` or `nl` or `pt`, or `en` or local-country format (e.g `fr-FR`, `de-DE`, `it-IT`) [more info below](#locale-option) | optional (default value is  `"en"`) | Defines the language displayed on the widgets                                                                                                                                                                                                                                                                                                                                         |
| clickableSelector        |                                                                     `string`                                                                     | optional (default value is `null`)  | If provided, the modal will open when the element matching this query selector is clicked.                                                                                                                                                                                                                                                                                            |
| customerBillingCountry   |                    `string` (e.g `fr` or `es` or  `it` or `de` or `nl` or `pt`, or `en`)   [more info below](#locale-option)                     |              optional               | Allow to display fee plans specific for a country. Example: you're selling in France and Germany, the credit options are only available in France, so you can specify this option to 'fr' to show credits on the widget for french customers.Both options offer the same result, they allow to simplify the integration if there is no information about customer's shipping address. |
| customerShippingCountry  |                     `string` (e.g `fr` or `es` or  `it` or `de` or `nl` or `pt`, or `en`)  [more info below](#locale-option)                     |              optional               | Allow to display fee plans specific for a country. Example: you're selling in France and Germany, the credit options are only available in France, so you can specify this option to 'fr' to show credits on the widget for french customers.Both options offer the same result, they allow to simplify the integration if there is no information about customer's shipping address. |
| cards                    |                                   `cb` and/or `visa` and/or `amex` and/or `mastercard` as an array of strings                                    |              optional               | Display card logos in the modal                                                                                                                                                                                                                                                                                                                                                       |
| onClose                  |                                                                 (event) => void                                                                  |              optional               | Call back that will be called when the modal is closed                                                                                                                                                                                                                                                                                                                                |


## Plan option: `Plan`

You can customize the displayed plans with this parameter. You can hide a plan that would be displayed otherwise by adding the other plans with this information:

| Option name       |   Type   |   Required   | Description                                                               |
|:------------------|:--------:|:------------:|:--------------------------------------------------------------------------|
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

*   `en` - Generic English - This is the locale set by default.
*   `fr` - Generic French
*   `fr-FR` - French from France
*   `de` - Generic German
*   `de-DE` - German from Germany
*   `it` - Generic Italian
*   `it-IT` - Italian from Italy
*   `es` - Generic Spanish
*   `es-ES` - Spanish from Spain
*   `pt` - Generic Portuguese
*   `pt-PT` - Portuguese from Portugal
*   `nl` - Generic Dutch
*   `nl-NL` Dutch from The Netherlands
*   `nl-BE` Dutch from Belgium

If the specific locale for the country you target is available, we suggest to use it instead of the generic locale.

The locale is used in the Widgets to display all wordings in the correct language but also to format numbers, dates, currencies into the standard format.

For example, for a pricing, the locale `pt` will format as `€ 100,00` while the locale `pt-PT` will format as `100,00 €`.

# To go further

### WidgetsController

The `WidgetsController` function is responsible for managing Alma widgets. It provides a method to dynamically add widgets to the DOM based on the provided configuration.

#### Parameters:  

| Parameter          |               Type               |     Required      | Description                                                                                                                                                                                                 |
|:-------------------|:--------------------------------:|:-----------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| apiData            |            `ApiData`             |   **required**    | An object containing the following properties : domain,     merchantId                                                                                                                                      |
| apiData.domain     | `ApiMode.TEST` OR `ApiMode.LIVE` | **required** | The domains LIVE & TEST are preconfigured when using the provided values from "Alma.ApiMode.[TEST or LIVE]. It represents the domain's url to be used for API calls (ex: "https://api.getalma.eu" for LIVE) |
| apiData.merchantId |           `string`     |   **required**    | The merchant's unique identifier provided by Alma (starting with `merchant_`)                                                                                                                 |


#### Returns:
An object with the following method:
- `add(widget: WidgetNames, options: WidgetOptions): AddReturnType`
  - Adds a widget to the DOM based on the specified widget type and options.

The `WidgetsController` is configured when implementing the method `initialize(merchantId: string, domain: Alma.ApiMode.TEST | Alma.ApiMode.LIVE)`

### Known Limitation:
The current implementation of the `addWidget` function does not automatically update the widget when the `purchaseAmount` changes dynamically. 
Once a widget is rendered, any subsequent changes to the `purchaseAmount` will not be reflected unless the widget is manually re-rendered.
This is also the case for any other parameters passed to the widget.
The following approach can be used to handle other variables changes in the widget.

### How to Implement the Widget for Variable `purchaseAmount`:
To handle a variable `purchaseAmount`, you can follow these steps:

1. **Track Changes to `purchaseAmount`**

   Use an event listener or a state management solution (e.g., React state or a global variable) to detect changes to the `purchaseAmount`.
    
    For example `var purchaseAmount = document.getElementById('quantity').value`

2. **Re-render the Widget**

   Call the `add` method again with the updated `purchaseAmount` to re-render the widget.

  Note that Calling the `add` method multiple times will **unmount the previous widget** before rendering a new one. This behavior is implemented in the `addWidget` function (lines 37–41). Specifically:
  - It checks if a `Root` instance already exists for the specified container (`rootMap.get(containerDiv)`).
  - If a `Root` exists, it calls `unmount()` to remove the previous widget and deletes the reference from the `rootMap`.  
  - A new widget is then rendered in the same container.

  This ensures that only one widget is active in the specified container at any given time

3. **Example Implementation**

   Below is an example of how to implement a widget with a variable `purchaseAmount`:

   ```typescript
   let currentPurchaseAmount = 450 * 100; // Initial purchase amount in cents
   // Initialize the Alma widgets Controller
   const widgets = Alma.Widgets.initialize('11gKoO333vEXacMNMUMUSc4c4g68g2Les4', Alma.ApiMode.TEST)

   function updateWidget() {
     const quantity = parseInt(document.getElementById('quantity')?.value || '1', 10);
     currentPurchaseAmount = 450 * 100 * quantity;

     widgets.add(Alma.Widgets.PaymentPlans, {
       container: '#alma-widget-payment-plans',
       locale: 'fr',
       purchaseAmount: currentPurchaseAmount,
     });
   }

   // Initial render
   updateWidget();

   // Add event listener to update the widget dynamically
   document.getElementById('quantity')?.addEventListener('change', updateWidget);
   ```

By following this approach, you can dynamically update the widget whenever the `purchaseAmount` changes.
