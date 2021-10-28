# Alma Widgets

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# Quickstart

### Add the widget to your page

###### CSS

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@alma/widgets@1.x/dist/alma-widgets.min.css"
/>
```

###### JS

```html
<script src="https://cdn.jsdelivr.net/npm/@alma/widgets@1.x/dist/alma-widgets.umd.js"></script>
```

### create the container

```html
<div id="alma-widget"></div>
```

### Initialise the widget

```html
<script>
  ;(function () {
    var widgets = Alma.Widgets.initialize('<YOUR MERCHANT ID>', Alma.ApiMode.TEST)
    widgets.add(Alma.Widgets.PaymentPlans, {
      container: '#alma-widget',
      purchaseAmount: 45000,
    })
  })()
</script>
```

##Going further

> read the full [documentation](./documentation.md)
# Contributing

Arriving soon
