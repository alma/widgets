# 🎨 CSS Customization & Styling

## Overview

The Alma Widgets use **Shadow DOM** for complete CSS isolation. This means:

✅ **Benefits:**
- Host website CSS doesn't affect widgets
- Widget CSS doesn't leak to host website
- Safe integration into any existing site

⚠️ **Limitation:**
- External CSS cannot directly style internal widget elements
- CSS Variables cannot be injected from the host page (Shadow DOM boundary blocks inheritance)

**For customization, use JavaScript configuration options instead.**

---

## Customization via JavaScript Configuration

All styling customization is done through the widget configuration passed to `widgets.add()`.

### Payment Plans Widget Options

```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  // === COLOR SCHEME ===
  monochrome: false,                   // true = black/gray, false = orange (default)
  colorScheme: 'orange',               // Supported: 'orange', 'dark-gray', 'gray',
                                       // 'light-gray', 'black', 'white', 'off-white'

  // === SIZE & LAYOUT ===
  compactMode: false,                  // true = smaller buttons + compact logo + no info text
  inlineCompact: false,                // true = width shrinks to fit visible plans only
  
  // === STYLE VARIANT ===
  planStyle: 'buttons',                // 'buttons' (default) or 'tabs'
  
  // === BORDERS ===
  hideBorder: false,                   // true = remove outer border
  
  // === VISIBILITY ===
  hideIfNotEligible: false,            // true = hide widget if no eligible plans
})
```

### Modal Widget Options

```javascript
widgets.add(Alma.Widgets.Modal, {
  // === LAYOUT VARIANT ===
  panelMode: false,                    // true = right-side slide panel (480px width)
  bottomSheet: false,                  // true = bottom sheet drawer (full height)
  
  // === STYLE VARIANT ===
  planStyle: 'buttons',                // 'buttons' (default) or 'tabs'
})
```

### Schedule Widget Options

```javascript
widgets.add(Alma.Widgets.Schedule, {
  // === SIZE ===
  small: false,                        // true = 80% scale (for compact layouts)
  
  // === COLOR SCHEME ===
  monochrome: false,                   // true = black/gray dots, false = orange (default)
  
  // === DISPLAY ===
  light: false,                        // true = minimal UI (no dots/line, simplified total)
  
  // === BORDERS ===
  hideBorder: false,                   // true = remove outer border
})
```

---

## Color Scheme Options

The `colorScheme` property on PaymentPlans offers different background colors:

| Value | Description | Use Case |
|-------|-------------|----------|
| `'orange'` | Orange background (default Alma branding) | Standard Alma integration |
| `'dark-gray'` | Dark gray (#6c6c6c) | Professional, subtle styling |
| `'gray'` | Medium gray (#cacaca) | Neutral, balanced appearance |
| `'light-gray'` | Light gray (#f0f0f0) | Subtle, minimal impact |
| `'black'` | Pure black background | High contrast, premium feel |
| `'white'` | White background | Transparent effect (depends on page) |
| `'off-white'` | Off-white (#f9f9f9) | Soft white alternative |

### Example: Different Color Schemes

```javascript
// Orange (default Alma branding)
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#plans',
  purchaseAmount: 45000,
  colorScheme: 'orange',
})

// Dark professional
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#plans-dark',
  purchaseAmount: 45000,
  colorScheme: 'dark-gray',
})

// Minimal white
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#plans-minimal',
  purchaseAmount: 45000,
  colorScheme: 'white',
})
```

---

## Layout Variants

### Compact Mode

`compactMode: true` shrinks the entire widget:
- Smaller buttons (80% size)
- Compact Alma logo (16x16px)
- Info text hidden
- Perfect for sidebars or tight spaces

```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#sidebar',
  purchaseAmount: 45000,
  compactMode: true,
})
```

### Inline Compact

`inlineCompact: true` makes the widget width fit only the visible plan buttons:
- Useful when you have only 2-3 plans
- Widget shrinks to minimal width
- Still maintains normal button size

```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#inline-plans',
  purchaseAmount: 45000,
  inlineCompact: true,
})
```

### Tab-Style Plans

`planStyle: 'tabs'` renders plans as tabs instead of buttons:
- Cleaner look for multiple plans
- Plan name appears as tab header
- Active plan underlined

```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#plans-tabs',
  purchaseAmount: 45000,
  planStyle: 'tabs',
})
```

### Modal Variants

**Panel Mode** - Right-side slide panel (480px width):
```javascript
widgets.add(Alma.Widgets.Modal, {
  container: '#modal',
  purchaseAmount: 45000,
  panelMode: true,
})
```

**Bottom Sheet** - Full-height drawer from bottom:
```javascript
widgets.add(Alma.Widgets.Modal, {
  container: '#modal',
  purchaseAmount: 45000,
  bottomSheet: true,
})
```

---

## Schedule Widget Variants

### Small/Compact Schedule

```javascript
widgets.add(Alma.Widgets.Schedule, {
  container: '#schedule',
  purchaseAmount: 45000,
  installmentsCount: 3,
  small: true,  // 80% size
})
```

### Monochrome Schedule

```javascript
widgets.add(Alma.Widgets.Schedule, {
  container: '#schedule',
  purchaseAmount: 45000,
  installmentsCount: 3,
  monochrome: true,  // Black/gray dots instead of orange
})
```

### Light/Minimal Schedule

```javascript
widgets.add(Alma.Widgets.Schedule, {
  container: '#schedule',
  purchaseAmount: 45000,
  installmentsCount: 3,
  light: true,  // No dots/line, simplified total display
})
```

---

## Common Customization Patterns

### Dark E-commerce Site with Orange Widgets

```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#plans',
  purchaseAmount: 45000,
  monochrome: false,  // Keep orange (default)
})

// Optional: Host page provides dark background to make orange pop
// In your host CSS:
// #plans { background: #1a1a1a; }
```

### Luxury Brand Integration

```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#plans',
  purchaseAmount: 45000,
  colorScheme: 'black',
  planStyle: 'tabs',  // Modern tabs appearance
})
```

### Minimal Checkout

```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#plans',
  purchaseAmount: 45000,
  colorScheme: 'white',
  hideBorder: true,
  compactMode: true,
})
```

### Sidebar Integration

```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#sidebar-plans',
  purchaseAmount: 45000,
  compactMode: true,
  colorScheme: 'light-gray',
})
```

---

## Shadow DOM & CSS Isolation

### Why Shadow DOM?

The widgets use Shadow DOM for **complete isolation**:

```
Host Page CSS  ───→  [Shadow DOM Boundary]  ←─  Widget CSS
(no influence)                                   (protected)
```

This ensures:
- ✅ Your site's CSS never breaks the widget
- ✅ The widget's CSS never affects your site
- ✅ Safe to add widgets to any existing website

### Accessing Widget Elements

Since widgets use Shadow DOM, you **cannot** access internal elements from the host page:

```javascript
// ❌ This won't work (Shadow DOM blocks access)
document.querySelector('alma-payment-plans .plan-button')  // null

// ✅ Instead, use the configuration options
widgets.add(Alma.Widgets.PaymentPlans, {
  planStyle: 'tabs',  // Change appearance via config
})
```

### Animation & Visibility Control

You can control widget visibility from the host page:

```html
<style>
  alma-payment-plans.hidden {
    display: none;
  }
</style>

<alma-payment-plans id="plans"></alma-payment-plans>

<script>
  // Toggle visibility
  document.getElementById('plans').classList.add('hidden')
  document.getElementById('plans').classList.remove('hidden')
</script>
```

---

## Host Page CSS Influence (Limited)

Because of Shadow DOM isolation, **most internal styles cannot be overridden** from the host page. However, you can control the **outer element**:

| What | Can Override | How |
|------|--------------|-----|
| Widget container size | ✅ Yes | Set `width`, `height`, `max-width` on the element |
| Widget visibility | ✅ Yes | Use `display: none` or `visibility: hidden` |
| Widget positioning | ✅ Yes | Set `position`, `top`, `left`, etc. on the element |
| Margins around widget | ✅ Yes | Set `margin` on the element |
| Z-index stacking | ✅ Yes | Set `z-index` for layering with other content |
| **Internal element styles** | ❌ No | Shadow DOM prevents CSS from crossing the boundary |
| **Font family/color inside** | ❌ No | Widget uses its own fonts + Shadow DOM protects styles |

### Example: Responsive Widget Sizing

```html
<style>
  alma-payment-plans {
    width: 100%;
    max-width: 400px;
    margin: 20px 0;
  }
  
  @media (max-width: 768px) {
    alma-payment-plans {
      width: 100%;
      max-width: 100%;
    }
  }
</style>
```

### What You CANNOT Do (Shadow DOM Boundary)

```css
/* ❌ These will NOT work due to Shadow DOM isolation */

alma-payment-plans .plan-button {
  background: red !important;  /* Won't apply */
}

alma-payment-plans::part(plan-button) {
  /* Won't work unless widget explicitly exports ::part() */
}

alma-payment-plans {
  --custom-button-color: red;  /* CSS variables don't cross Shadow DOM */
}
```

The Shadow DOM boundary is **intentional** — it protects the widget from accidental style conflicts with your site's CSS.

---

## Testing & Previewing Customizations

### Playground

Use the [interactive Playground](../examples/playground.html) to:
1. Adjust all configuration options in real-time
2. See how the widget looks with different settings
3. Copy generated integration code

```bash
npm run serve
# Open http://localhost:3000/examples/playground.html
```

### Browser DevTools

1. Open DevTools (F12) on any page with a widget
2. Inspect the `<alma-payment-plans>` element
3. Note: You cannot directly modify Shadow DOM styles, but you can see the element's HTML attributes
4. To test changes, update JavaScript properties:

```javascript
// In DevTools Console:
const widget = document.querySelector('alma-payment-plans')
widget.colorScheme = 'black'
widget.compactMode = true
widget.planStyle = 'tabs'
```

---

## Font Customization

Fonts are **loaded from Alma CDN and cannot be overridden**:
- **Argent** (headings): Alma brand font
- **Inter** (body): Standard UI font

This ensures consistent brand presentation across all integrations.

### Font Loading

Fonts are injected into the document head during widget initialization. They're shared across all widget instances on the page.

---

## Performance Implications

All configuration options are **performance-conscious**:
- No extra API calls
- No additional bundle size
- Changes apply instantly (mostly visual updates)
- Layout changes (like `compactMode`) are purely CSS

---

## Support & Limitations

### What's Supported ✅

- All JavaScript configuration options documented above
- Dynamic property updates (no re-mount required)
- Multiple widget instances with different customizations
- Responsive behavior based on viewport

### What's Not Supported ❌

- **Injecting external CSS into Shadow DOM** ← This is by design; Shadow DOM prevents it for security/isolation
- **Modifying internal widget elements from host page** ← JS can't pierce the Shadow DOM boundary
- **CSS custom properties (--variables) across Shadow DOM boundary** ← Variables don't inherit through Shadow DOM
- **Overriding internal fonts** ← Argent and Inter are loaded in the widget, not inherited
- **Completely custom themes** ← Limited to provided options (colorScheme, planStyle, etc.)
- **Using `::part()` pseudo-elements** ← Not exposed by these widgets

### Need More Customization?

If you need customization options not covered here:
1. Check if an existing JavaScript option meets your needs
2. Review the [examples/playground.html](../examples/playground.html) for all available options
3. Consider if your use case would benefit from a new configuration option
4. Open an issue on GitHub to request new customization options

---

## Migration from Preact Widget

The Preact widget also used Shadow DOM, so CSS customization works the same way:

**✅ Same:**
- Configuration options (monochrome, compactMode, etc.)
- No external CSS injection
- Widget isolation

**Improved in Lit:**
- More granular styling options (colorScheme variants)
- Better responsive layouts (planStyle, panelMode)
- Additional variants (bottomSheet, light mode)

---

## Examples

Complete customization examples are available:
- [examples/basic.html](../examples/basic.html) - Default styling
- [examples/customized.html](../examples/customized.html) - Multiple customization examples
- [examples/playground.html](../examples/playground.html) - Interactive customization tool

