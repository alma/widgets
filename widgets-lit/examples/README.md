# Examples

This folder contains example pages that simulate third-party e-commerce sites integrating Alma Widgets.

## 🚀 Quick Start

```bash
# Terminal 1: Watch & rebuild
npm run dev

# Terminal 2: Serve examples (in another terminal)
npm run serve
```

Then open: http://localhost:3000

## Dev Workflow

### Single Command (Recommended)

```bash
npm run dev
```

This runs the build in watch mode. In another terminal:

```bash
npm run serve
```

This opens examples at http://localhost:3000 with auto-reload.

### Manual Setup

Terminal 1 (rebuild on file changes):
```bash
npm run build:watch
```

Terminal 2 (serve examples):
```bash
npm run serve
```

If port 3000 is in use:
```bash
PORT=3001 npm run serve
```

## Examples

### 📄 basic.html
**Single product checkout**
- Product display with quantity selector
- Reactive `purchaseAmount` updates (no widget re-mount)
- Payment plans + modal integrated
- Shows Alma widgets integration in a typical e-commerce flow

### 🏪 multiple.html
**Multi-product catalog**
- Grid of products with different prices
- Each product has its own Alma widget instance
- Shows how to scale widget integration
- Demonstrates isolated payment flows per product

### 🎨 customized.html
**Widget styling variations**
- Monochrome mode (black & white)
- Standard colored mode
- No-border variant
- Great for understanding widget customization options

### 💬 modal-only.html
**Modal as standalone component**
- Modal triggered from external button
- No payment plans widget
- Perfect for merchants who want full control
- Shows external trigger integration (`clickableSelector`)

### 🎮 playground.html
**Interactive testing environment** ⭐
- Real-time parameter configuration
- Live widget preview
- Auto vs manual modal integration
- External trigger simulation
- Generated code snippets (copy/paste ready)
- Perfect for testing all widget capabilities

## Development vs Production

### Development Mode

The dev server includes:
- Auto-reload when bundle changes
- Full source maps for debugging
- Unminified code

```bash
npm run dev           # watch & rebuild
npm run serve         # serve examples
```

### Production (Real CDN)

In production, merchants load the bundle once:

```html
<script src="https://cdn.almapay.com/widgets/v2/alma-widgets.umd.js"></script>
```

Behavior:
- Bundle loaded once at page load
- Standard browser caching applies
- No polling or auto-reload

## Features Demonstrated

### 1. Basic Integration
See `basic.html`:
- Initialize: `Alma.Widgets.initialize(merchantId, apiMode)`
- Add widget: `widgets.add(Alma.Widgets.PaymentPlans, {...})`
- Modal auto-integration (opens when clicking payment plan)

### 2. Reactive Updates
See `basic.html` quantity selector:
```javascript
// Update without re-mounting the widget
document.querySelector('alma-payment-plans').purchaseAmount = newAmount
```

### 3. CSS Isolation
All widgets use Shadow DOM for style isolation:
- Styles don't leak in or out
- Safe integration in any website
- No CSS conflicts

### 4. Multiple Configurations
See `playground.html`:
- Payment plans configuration (which plans to show)
- Appearance: monochrome, borders, hide if not eligible
- Animation settings
- Card acceptance configuration
- Country settings for fraud detection



### customized.html
CSS isolation demonstration (Shadow DOM)
