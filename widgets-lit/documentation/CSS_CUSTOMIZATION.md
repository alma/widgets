# 🎨 CSS Customization Guide

## Overview

The Alma Widgets use **CSS Custom Properties (CSS Variables)** that can be overridden from external stylesheets to fully customize the widget's appearance without modifying the widget code.

Despite using Shadow DOM for style isolation, CSS Custom Properties **inherit through the Shadow boundary**, allowing external customization.

---

## 🚀 Quick Start

### Basic Example

```html
<style>
  /* Target the widget with a CSS selector */
  alma-payment-plans {
    --alma-primary-color: #10b981;
    --alma-border-radius: 16px;
  }
</style>

<alma-payment-plans
  purchase-amount="45000"
  locale="fr"
></alma-payment-plans>
```

### Class-Based Customization

```html
<style>
  .my-custom-widget {
    --alma-primary-color: #ec4899;
    --alma-button-padding: 16px 28px;
  }
</style>

<alma-payment-plans
  class="my-custom-widget"
  purchase-amount="45000"
></alma-payment-plans>
```

---

## 📋 Available CSS Variables

### 🎨 Colors

| Variable | Default | Description |
|----------|---------|-------------|
| `--alma-primary-color` | `#fa5022` | Primary brand color (buttons, logo, active states) |
| `--alma-secondary-color` | `#130a07` | Secondary text and UI elements |
| `--alma-background` | `#fefefe` | Main background color |
| `--alma-background-secondary` | `#f7f7f7` | Secondary background (cards, sections) |

**Example - Brand Colors:**
```css
alma-payment-plans {
  --alma-primary-color: #your-brand-color;
  --alma-secondary-color: #your-text-color;
}
```

---

### 🔲 Borders & Shapes

| Variable | Default | Description |
|----------|---------|-------------|
| `--alma-border-radius` | `12px` | Global border radius |
| `--alma-border-color` | `#ececec` | Border color for all elements |
| `--alma-border-width` | `1px` | Border thickness |
| `--alma-button-border-radius` | inherits from `--alma-border-radius` | Specific button border radius |

**Example - Rounded Design:**
```css
alma-payment-plans {
  --alma-border-radius: 24px;
  --alma-button-border-radius: 50px; /* Pill-shaped buttons */
}
```

**Example - Square/Minimal:**
```css
alma-payment-plans {
  --alma-border-radius: 0;
  --alma-border-width: 2px;
  --alma-border-color: #000;
}
```

---

### 📝 Typography

| Variable | Default | Description |
|----------|---------|-------------|
| `--alma-font-family` | `'Inter', sans-serif` | Widget font family |
| `--alma-font-size-base` | `14px` | Base font size |
| `--alma-font-weight-normal` | `400` | Normal text weight |
| `--alma-font-weight-bold` | `600` | Bold text weight |
| `--alma-button-font-size` | `14px` | Button text size |

**Example - Custom Font:**
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

alma-payment-plans {
  --alma-font-family: 'Poppins', sans-serif;
  --alma-font-size-base: 16px;
}
```

---

### 📏 Spacing & Layout

| Variable | Default | Description |
|----------|---------|-------------|
| `--alma-spacing-base` | `16px` | Base spacing unit |
| `--alma-button-padding` | `14px 20px` | Button internal padding |

**Example - Compact Layout:**
```css
alma-payment-plans {
  --alma-spacing-base: 8px;
  --alma-button-padding: 8px 16px;
  --alma-button-font-size: 12px;
}
```

---

## 🎯 Common Use Cases

### 1. Match Brand Colors

```css
alma-payment-plans {
  --alma-primary-color: #your-brand-primary;
  --alma-secondary-color: #your-brand-secondary;
}
```

### 2. Dark Mode

```css
alma-payment-plans {
  --alma-primary-color: #fbbf24; /* Yellow accent */
  --alma-secondary-color: #f9fafb; /* Light text */
  --alma-background: #1f2937; /* Dark bg */
  --alma-background-secondary: #111827;
  --alma-border-color: #374151;
}
```

### 3. Minimal Black & White

```css
alma-payment-plans {
  --alma-primary-color: #000;
  --alma-border-radius: 0;
  --alma-border-width: 2px;
  --alma-border-color: #000;
}
```

### 4. Playful & Rounded

```css
alma-payment-plans {
  --alma-primary-color: #ec4899; /* Pink */
  --alma-border-radius: 24px;
  --alma-button-border-radius: 50px;
  --alma-button-padding: 16px 28px;
}
```

### 5. Ultra-Compact

```css
alma-payment-plans {
  --alma-spacing-base: 6px;
  --alma-button-padding: 6px 12px;
  --alma-button-font-size: 11px;
  --alma-border-radius: 4px;
}
```

---

## 🧪 Testing Your Customizations

### Live Preview

Visit the [CSS Customization Example page](./css-customization.html) to see 6 live examples with code snippets.

### Browser DevTools

1. Open DevTools (F12)
2. Inspect the `<alma-payment-plans>` element
3. Add CSS variables in the "Styles" panel
4. Changes apply instantly

**Example in DevTools Console:**
```javascript
const widget = document.querySelector('alma-payment-plans')
widget.style.setProperty('--alma-primary-color', '#10b981')
```

---

## ⚠️ Limitations & Notes

### What Can Be Customized

✅ **Colors** - All color variables  
✅ **Spacing** - Padding, margins, gaps  
✅ **Typography** - Fonts, sizes, weights  
✅ **Borders** - Radius, width, color  
✅ **Layout** - Sizing via spacing variables  

### What Cannot Be Customized via CSS Variables

❌ **Layout Structure** - DOM structure is fixed  
❌ **Internal Logic** - JavaScript behavior  
❌ **Animation Timing** - Use `transition-delay` attribute instead  
❌ **Shadow DOM Styles** - Cannot use external classes/IDs to style internal elements  

For these, use the JavaScript configuration options:
- `compactMode` - Reduced size variant
- `planStyle` - 'buttons' or 'tabs' layout
- `hideBorder` - Remove outer border
- `monochrome` - Black & white mode

---

## 🔧 Advanced Techniques

### Per-Instance Customization

```html
<alma-payment-plans
  class="product-page-widget"
  purchase-amount="45000"
></alma-payment-plans>

<alma-payment-plans
  class="checkout-widget"
  purchase-amount="45000"
></alma-payment-plans>

<style>
  .product-page-widget {
    --alma-primary-color: #10b981;
  }
  
  .checkout-widget {
    --alma-primary-color: #3b82f6;
  }
</style>
```

### Responsive Customization

```css
alma-payment-plans {
  --alma-button-padding: 14px 20px;
}

@media (max-width: 768px) {
  alma-payment-plans {
    --alma-button-padding: 10px 16px;
    --alma-button-font-size: 12px;
    --alma-spacing-base: 12px;
  }
}
```

### CSS Variables in JavaScript

```javascript
const widget = document.querySelector('alma-payment-plans')

// Get current value
const currentColor = getComputedStyle(widget)
  .getPropertyValue('--alma-primary-color')

// Set dynamically
widget.style.setProperty('--alma-primary-color', '#10b981')

// Remove override (back to default)
widget.style.removeProperty('--alma-primary-color')
```

### Theming System

```css
/* Define themes */
:root {
  --theme-primary: #fa5022;
  --theme-secondary: #130a07;
}

[data-theme="dark"] {
  --theme-primary: #fbbf24;
  --theme-secondary: #f9fafb;
}

[data-theme="green"] {
  --theme-primary: #10b981;
  --theme-secondary: #065f46;
}

/* Apply to widgets */
alma-payment-plans {
  --alma-primary-color: var(--theme-primary);
  --alma-secondary-color: var(--theme-secondary);
}
```

---

## 📚 Reference

### Complete Variable List

See the full list of available variables in:
- [`src/components/styles/design-tokens.styles.ts`](../src/components/styles/design-tokens.styles.ts)

### Examples

- [CSS Customization Demo](./css-customization.html) - 6 live examples
- [Playground](./playground.html) - Interactive widget tester

### Related Documentation

- [README.md](../README.md) - Main documentation
- [FEATURE_PARITY.md](../docs/FEATURE_PARITY.md) - Feature comparison
- [IMPLEMENTATION.md](../docs/IMPLEMENTATION.md) - Technical details

---

## 💡 Tips & Best Practices

1. **Start with color overrides** - Most impactful customization
2. **Test in your brand context** - Ensure accessibility (contrast ratios)
3. **Use browser DevTools** - Experiment before committing to code
4. **Keep defaults** - Only override what you need
5. **Document your overrides** - Comment your custom CSS for maintainability
6. **Test responsiveness** - Ensure customizations work on mobile
7. **Check accessibility** - Maintain WCAG AA contrast ratios

### WCAG Contrast Requirements

For text on colored backgrounds:
- **Normal text:** 4.5:1 minimum
- **Large text:** 3:1 minimum
- **UI components:** 3:1 minimum

Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to validate.

---

## 🤝 Support

If you need customization options not covered by CSS variables, please:
1. Check the JavaScript configuration options first
2. Open an issue on GitHub with your use case
3. Consider if a new JavaScript option would benefit other users

**We're continuously expanding customization options based on merchant feedback!**

