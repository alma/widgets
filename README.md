# Alma Widgets

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Setup

### Add the widget to your page

##### CSS

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@alma/widgets@2.x/dist/widgets.min.css" />
```

##### JS

```html
<script src="https://cdn.jsdelivr.net/npm/@alma/widgets@2.x/dist/widgets.umd.js"></script>
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
      locale: 'fr',
      hideIfNotEligible: false,
      plans: [
        {
          installmentsCount: 1,
          deferredDays: 30,
          minAmount: 5000,
          maxAmount: 50000,
        },
        {
          installmentsCount: 3,
          minAmount: 5000,
          maxAmount: 50000,
        },
      ],
    })
  })()
</script>
```

## Going further

> read the full [documentation](./documentation.md)
