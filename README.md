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

## Going further

> read the full [documentation](./documentation.md)
