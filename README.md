# Alma Widgets

## Changelog 

View all [Changelog](https://github.com/alma/widgets/releases)

## Setup

### Add the widget to your page
##### CSS

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@alma/widgets@4.x/dist/widgets.min.css" />
```

##### JS

```html
<script src="https://cdn.jsdelivr.net/npm/@alma/widgets@4.x/dist/widgets.umd.js"></script>
```

### Create the container

```html
<div id="alma-widget"></div>
```

### Initialize the widget

```html
<script>
  ;(function () {
    var widgets = Alma.Widgets.initialize('<YOUR MERCHANT ID>', Alma.ApiMode.LIVE)
    widgets.add(Alma.Widgets.PaymentPlans, {
      container: '#alma-widget',
      purchaseAmount: 45000,
    })
  })()
</script>
```

### With a bundler

If you bundle your JavaScript, install the package instead of loading the script from jsDelivr:

```bash
npm install @alma/widgets
```

```ts
import '@alma/widgets/dist/widgets.min.css'
import * as Alma from '@alma/widgets'

const widgets = Alma.Widgets.initialize('<YOUR MERCHANT ID>', Alma.ApiMode.LIVE)
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#alma-widget',
  purchaseAmount: 45000,
})
```

The CSS import needs a CSS loader in your bundler. Without one, keep the `<link>` tag above.
If your TypeScript config turns on `noUncheckedSideEffectImports`, add `declare module '*.css'` to a `.d.ts` file. Vite projects can reference `vite/client` instead.

The package includes its TypeScript declarations. Import `@alma/widgets`, not `@alma/widgets/dist/widgets.umd.js`. The UMD file is for `<script>` tags only, and the package doesn't export it, so a bundler that imports it stops with an error.

## Browser support

The widgets run in Chrome 80, Firefox 74, Safari 13.1, Safari on iOS 13.4 and their later versions. See [Browser support](./documentation.md#browser-support), [Content Security Policy](./documentation.md#content-security-policy) if your page enforces Trusted Types, and [Files](./documentation.md#files) for the files the package ships.

## Going further

> read the full [documentation](./documentation.md)
