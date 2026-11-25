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
| merchantCoversAllFees    |                                                                    `boolean`                                                                    |               optional               | If set to true, the widget will display plans as if the merchant covers all fees. The value should be the same as the one used in the payment creation request. Default value is false.                                                                                                                                                                                                                                                                                                                                                                                   |
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
| merchantCoversAllFees    |                                                                    `boolean`                                                                     |              optional               | If set to true, the widget will display plans as if the merchant covers all fees. The value should be the same as the one used in the payment creation request. Default value is false.                                                                                                                                                                                               |
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

Each widget renders inside a custom element that it adds to your container. PaymentPlans uses `alma-payment-plans` and Modal uses `alma-eligibility-modal`. That element has `display: contents`, so it draws no box and doesn't change the layout. It is still one more level in the DOM, so a child selector from your container, such as `#alma-widget > div`, no longer matches the widget. Use a descendant selector such as `#alma-widget div`, or an `alma-` class.

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

## Browser support

The widgets run in these browsers and their later versions:

- Chrome 80
- Firefox 74
- Safari 13.1
- Safari on iOS 13.4

The files use ES2019 syntax, so bundlers such as webpack 4 can build `widgets.js` without transpiling it. Older browsers don't display the widgets. To skip the call in those browsers, check `Alma.Widgets` first:

```html
<script>
  ;(function () {
    if (window.Alma && window.Alma.Widgets) {
      var widgets = Alma.Widgets.initialize('<YOUR MERCHANT ID>', Alma.ApiMode.LIVE)
      widgets.add(Alma.Widgets.PaymentPlans, {
        container: '#alma-widget',
        purchaseAmount: 45000,
      })
    }
  })()
</script>
```

## Content Security Policy

The widgets use Lit. When the script loads, Lit creates a [Trusted Types](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) policy named `lit-html`.

If your page's Content Security Policy lists the allowed policy names in a `trusted-types` directive, add `lit-html` to it, or the script throws when it loads:

```
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types lit-html
```

If your page also loads another copy of Lit, that copy creates a policy with the same name, so add `'allow-duplicates'` too:

```
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types lit-html 'allow-duplicates'
```

The widgets add no `<style>` element to your page. Their styles come from `widgets.css`, so they need no style nonce, and you don't need to set `window.litNonce`.

## Files

The package's `dist` folder, also served by jsDelivr, holds these files:

| File                | Use                                                                                       |
|:--------------------|:------------------------------------------------------------------------------------------|
| `widgets.umd.js`    | Load it with a `<script>` tag. It sets `window.Alma`.                                     |
| `widgets.js`        | ES module, the package's `main` entry, for bundlers.                                      |
| `widgets.css`       | The widgets' styles.                                                                      |
| `widgets.min.css`   | The same styles, minified.                                                                |
| `widgets-wc.umd.js` | Identical to `widgets.umd.js`. It stays in the package so existing integrations keep working. |
| `types/index.d.ts`  | The TypeScript declarations of `widgets.js`. TypeScript finds them on its own.            |

With a bundler, import the package itself. `import { ApiMode, Widgets } from '@alma/widgets'` loads `widgets.js` and its types. Import the styles as `@alma/widgets/dist/widgets.css` or `@alma/widgets/dist/widgets.min.css`.

`widgets.umd.js` and `widgets-wc.umd.js` are for `<script>` tags only. The package doesn't export them, so a bundler that imports them by package path stops with an error.

# To go further

### What `initialize()` returns

`Alma.Widgets.initialize(merchantId, domain)` returns an object with one method, `add(widget, options)`. It adds the widget to the element that `options.container` selects.

- With `Alma.Widgets.PaymentPlans`, `add()` returns nothing.
- With `Alma.Widgets.Modal`, `add()` returns an object with an `open()` and a `close()` method. If no element matches `options.container`, both methods do nothing.

A second `add()` on the same container replaces the previous widget, so a container holds one widget at a time.

### Known Limitation:
A widget doesn't follow later changes to `purchaseAmount`, or to any other option you passed to `add()`. To show new values, call `add()` again, as the steps below describe.

### How to Implement the Widget for Variable `purchaseAmount`:
To handle a variable `purchaseAmount`, you can follow these steps:

1. **Track Changes to `purchaseAmount`**

   Use an event listener or a state management solution (e.g., React state or a global variable) to detect changes to the `purchaseAmount`.
    
    For example `var purchaseAmount = document.getElementById('quantity').value`

2. **Re-render the Widget**

   Call the `add` method again on the same container with the updated `purchaseAmount`. The new widget replaces the previous one.

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
