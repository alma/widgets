# Alma Widgets - Lit Edition

**Production-ready payment widgets built with Lit Web Components for third-party merchant integrations.**

Ultra-lightweight, zero-dependency widgets with complete CSS isolation, reactive property updates, and automatic API deduplication. Works in any website via CDN—no framework required.

---

## Features at a Glance

| Feature | Description |
|---------|-------------|
| **🎯 Single Script Integration** | One UMD bundle deploys all widgets; no build step needed |
| **🔒 CSS Isolation** | Shadow DOM prevents CSS conflicts with host website |
| **⚡ Reactive Updates** | Change properties dynamically without re-mounting |
| **🌍 13+ Languages** | FR, EN, DE, ES, IT, PT, NL + regional variants (en-US, fr-FR, etc.) |
| **⏱️ Session Cache** | Smart caching + in-flight deduplication = 75% fewer API calls |
| **♿ Accessibility** | WCAG 2.1 AA (partial) - Skip links + focus trap + arrow navigation; Home/End keys missing |
| **📱 Responsive** | Desktop modal, mobile drawer, tablet layouts |
| **🎨 Customizable** | Monochrome mode, custom card logos, suggested plans |
| **📦 Lightweight** | ~37 KB gzipped (20% smaller than Preact version) |
| **🔄 Zero Config** | Drop-in CDN script; auto-detects merchant & API mode |

---

## Quick Start

### Option 1: CDN (Recommended for Most Sites)

Add a single script tag to your HTML. No build tools required.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Your E-commerce Site</title>
</head>
<body>
  <!-- Your existing content -->
  <div class="product">
    <h1>Product Name</h1>
    <p>Price: €450.00</p>
    
    <!-- Container for payment plans widget -->
    <div id="alma-widget"></div>
  </div>

  <!-- Load Alma widgets from CDN -->
  <script src="https://cdn.almapay.com/widgets/alma-widgets.umd.js"></script>

  <script>
    // Initialize with your merchant credentials
    const widgets = Alma.Widgets.initialize(
      'merchant_YOUR_ID_HERE',  // Get from Alma dashboard
      Alma.ApiMode.TEST          // Use TEST for development
    )

    // Add payment plans display
    widgets.add(Alma.Widgets.PaymentPlans, {
      container: '#alma-widget',
      purchaseAmount: 45000,  // €450.00 in cents
      locale: 'fr',           // French language
    })
  </script>
</body>
</html>
```

**That's it!** The widget will:
- ✅ Fetch available payment plans from Alma API
- ✅ Display them with automatic cycling animation
- ✅ Open a modal when user clicks a plan
- ✅ Handle all interactions automatically

### Option 2: ES Module (Modern JavaScript)

For build tools (Webpack, Vite, etc.):

```javascript
import Alma from 'https://cdn.almapay.com/widgets/alma-widgets.js'

const widgets = Alma.Widgets.initialize('merchant_xxx', Alma.ApiMode.TEST)

widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#alma-widget',
  purchaseAmount: 45000,
  locale: 'en',
})
```

### Option 3: NPM (For Development / Contributing)

Clone this repository and install:

```bash
git clone https://github.com/alma/widgets-lit.git
cd widgets-lit
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm test         # Run test suite
```

---

## Widgets in Detail

### Payment Plans Widget (`<alma-payment-plans>`)

Displays a compact widget showing available payment options with automatic cycling animation.

#### What It Shows

- **Payment Plan Buttons**: 3x, 4x, 10x, J+15, J+30, etc. (based on eligibility)
- **Animated Cycling**: Plans rotate automatically every 5.5s (configurable)
- **Fee Information**: Shows any applicable fees or "No fees" message
- **Alma Logo**: Branding in the bottom corner
- **Card Logos**: Accepted payment methods (Visa, Mastercard, CB, Amex)

#### User Interactions

- **Click a plan button**: Opens detailed modal with payment schedule
- **Hover**: Pauses animation and shows plan info
- **Keyboard Navigation**: 
  - `Tab` / `Shift+Tab`: Move focus between eligible plans
  - `ArrowLeft` / `ArrowRight`: Navigate between eligible plans (skips ineligible)
  - `Enter` / `Space`: Select focused plan and open modal
  - `Escape`: Close associated modal
- **Focus behavior**: Focused plan becomes active and displays info (same as hover)

#### Configuration

```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  // === REQUIRED ===
  container: '#alma-widget',           // CSS selector for mount point
  purchaseAmount: 45000,               // Amount in cents (EUR 450.00)

  // === DISPLAY ===
  locale: 'fr',                        // Language code
  monochrome: false,                   // Orange (false) or black/white (true)
  colorScheme: 'orange',               // Color theme: 'orange', 'dark-gray', 'gray', 
                                       // 'light-gray', 'black', 'white' (or 'off-white')
  compactMode: false,                  // Smaller buttons + compact logo, hides info text
  inlineCompact: false,                // Shrinks width to fit visible plans only
  planStyle: 'buttons',                // 'buttons' (default) or 'tabs'
  hideBorder: false,                   // Hide container border
  hideIfNotEligible: false,            // Hide entire widget if no plans

  // === ANIMATION ===
  transitionDelay: 5500,               // Milliseconds between plan changes
                                       // Use -1 to disable animation
  suggestedPaymentPlan: 3,             // Highlight this plan (3x, 4x, etc.)
                                       // Or array: [3, 4] (fallback order)

  // === PLAN FILTERING ===
  plans: [                             // Restrict to specific plans
    { installmentsCount: 3, minAmount: 10000, maxAmount: 200000 },
    { installmentsCount: 4, minAmount: 10000, maxAmount: 200000 },
    { installmentsCount: 1, deferredDays: 15, minAmount: 100, maxAmount: 200000 },
  ],
  // Note: If not specified, API determines all eligible plans

  // === PAYMENT METHODS ===
  cards: ['visa', 'mastercard', 'cb', 'amex'],  // Show logos for these cards

  // === FEES & RULES ===
  merchantCoversAllFees: false,        // If true, merchant pays all fees
  customerBillingCountry: 'FR',        // For eligibility calculation
  customerShippingCountry: 'FR',       // For eligibility calculation

  // === MODAL WIRING ===
  modalSelector: '#my-modal alma-modal',  // Manual: connect to this modal
  // If not specified, modal is auto-created
})
```

### Modal Widget (`<alma-modal>`)

Detailed payment schedule and financing details displayed in a modal.

#### What It Shows

- **Payment Schedule Calendar**: Installment dates and amounts
- **Plan Selection Buttons**: Switch between available plans
- **Total & Fees Breakdown**: Complete cost breakdown
- **Card Logos**: Accepted payment methods
- **Legal Text**: Credit information and disclaimers
- **Alma Branding**: Logo in footer

#### Responsive Behavior

- **Desktop (≥800px)**: Centered modal dialog
- **Mobile (<800px)**: Full-screen drawer from bottom

#### Configuration

```javascript
widgets.add(Alma.Widgets.Modal, {
  // === REQUIRED ===
  container: '#alma-modal',            // CSS selector for mount point
  purchaseAmount: 45000,               // Amount in cents

  // === DISPLAY ===
  locale: 'fr',                        // Language code
  cards: ['visa', 'mastercard'],       // Card logos to display
  planStyle: 'buttons',                // 'buttons' (default) or 'tabs'

  // === LAYOUT VARIANTS ===
  panelMode: false,                    // Right-side slide panel (width: 480px)
  bottomSheet: false,                  // Bottom sheet on desktop (full height)

  // === FEES & RULES ===
  merchantCoversAllFees: false,        // Affects fee display
  customerBillingCountry: 'FR',
  customerShippingCountry: 'FR',

  // === PLAN FILTERING ===
  plans: [                             // Restrict to specific plans
    { installmentsCount: 3, minAmount: 10000, maxAmount: 200000 },
    { installmentsCount: 4, minAmount: 10000, maxAmount: 200000 },
  ],
  // Note: Modal will only show eligible plans

  // === EXTERNAL TRIGGER ===
  clickableSelector: '#pay-with-alma-btn',  // Click this element to open
  // OR manually call open() from the return value

  // === CALLBACKS ===
  onOpen: () => console.log('Modal opening'),
  onClose: () => console.log('Modal closed'),
})
```

### Schedule Widget (`<alma-schedule>`)

Displays a standalone payment schedule summary for a specific payment plan.

#### What It Shows

- **Installment Timeline**: Visual calendar with dates and amounts
- **Timeline Dots**: Orange dots marking payment dates (first dot = today)
- **Vertical Line**: Connects installments visually
- **Total & Fees Block**: Complete breakdown with credit information
- **Legal Text**: For credit plans (>4 installments), includes mandatory disclosure
- **Plan Selector (optional)**: Plan buttons when `installmentsCount` is 0
- **Light Mode (optional)**: Minimal UI without dots/line and a simplified total

#### When to Use

- **Checkout Page**: Show schedule for the selected payment plan
- **Payment Selection**: Display multiple schedules side-by-side for comparison
- **Product Page**: Illustrate payment schedule before cart
- **Order Confirmation**: Show finalized payment schedule

#### Configuration

```javascript
widgets.add(Alma.Widgets.Schedule, {
  // === REQUIRED ===
  container: '#alma-schedule',         // CSS selector for mount point
  purchaseAmount: 60000,               // Amount in cents (EUR 600.00)

  // === PLAN TARGETING ===
  installmentsCount: 3,                // Number of installments (3, 4, 10, etc.)
  // If installmentsCount is 0, the widget enters "selector mode"
  // and shows plan buttons based on the `plans` config.

  // === DEFERRED PAYMENT ===
  deferredDays: 0,                     // Days to defer (e.g., 15 for J+15)
  deferredMonths: 0,                   // Months to defer (e.g., 1 for M+1)
  // Note: For P1X (pay now), use installmentsCount: 1, deferredDays: 0

  // === PLAN SELECTOR (OPTIONAL) ===
  plans: [                             // Required when installmentsCount = 0
    { installmentsCount: 3, minAmount: 0, maxAmount: 0 },
    { installmentsCount: 4, minAmount: 0, maxAmount: 0 },
    { installmentsCount: 1, deferredDays: 15, minAmount: 0, maxAmount: 0 },
  ],

  // === DISPLAY ===
  locale: 'fr',                        // Language code
  small: false,                        // 80% size (for compact layouts)
  monochrome: false,                   // Black/gray dots instead of orange
  hideBorder: false,                   // Remove outer border
  light: false,                        // Minimal UI (no dots/line, simplified total)

  // === FEES & RULES ===
  merchantCoversAllFees: false,        // Affects fee display
  customerBillingCountry: 'FR',        // For eligibility calculation
  customerShippingCountry: 'FR',       // For eligibility calculation
})
```

#### Examples

**Basic 3x Schedule:**
```javascript
widgets.add(Alma.Widgets.Schedule, {
  container: '#schedule-3x',
  purchaseAmount: 60000,  // €600.00
  installmentsCount: 3,
  locale: 'fr',
})
```

**Plan selector (lightweight modal-like schedule):**
```javascript
widgets.add(Alma.Widgets.Schedule, {
  container: '#schedule-selector',
  purchaseAmount: 60000,
  installmentsCount: 0,
  plans: [
    { installmentsCount: 1, deferredDays: 0, minAmount: 0, maxAmount: 0 },
    { installmentsCount: 1, deferredDays: 15, minAmount: 0, maxAmount: 0 },
    { installmentsCount: 3, minAmount: 0, maxAmount: 0 },
    { installmentsCount: 4, minAmount: 0, maxAmount: 0 },
  ],
  light: true,
  locale: 'fr',
})
```

**Compact Monochrome (for sidebars):**
```javascript
widgets.add(Alma.Widgets.Schedule, {
  container: '#schedule-sidebar',
  purchaseAmount: 45000,
  installmentsCount: 4,
  small: true,           // 80% size
  monochrome: true,      // Black/gray theme
  hideBorder: true,      // No border
  locale: 'en',
})
```

#### Visual Variants

| Variant | Use Case |
|---------|----------|
| **Default** | Standard schedule display |
| **`small: true`** | Compact version (80% size) for tight layouts |
| **`monochrome: true`** | Black/gray theme for neutral designs |
| **`hideBorder: true`** | Borderless for seamless integration |
| **`light: true`** | Minimal schedule without dots/line + simplified total |
| **All combined** | Ultra-compact, neutral, borderless schedule |

#### Responsive Behavior

- Automatically adjusts to container width
- Mobile-optimized padding and spacing
- Font sizes scale with `small` variant
- Works in any container (cards, sidebars, modals)

---

## Usage Patterns & Examples

### Pattern 1: Dynamic Price Updates

Update purchase amount without re-mounting the widget—perfect for quantity selectors or cart updates.

```html
<div class="product">
  <select id="quantity" onchange="updatePrice()">
    <option value="1">Quantity 1 (€450)</option>
    <option value="2">Quantity 2 (€900)</option>
    <option value="5">Quantity 5 (€2,250)</option>
  </select>

  <div id="alma-widget"></div>
</div>

<script src="https://cdn.almapay.com/widgets/alma-widgets.umd.js"></script>
<script>
  const widgets = Alma.Widgets.initialize('merchant_xxx', Alma.ApiMode.TEST)
  
  widgets.add(Alma.Widgets.PaymentPlans, {
    container: '#alma-widget',
    purchaseAmount: 45000,  // €450.00
    locale: 'fr',
  })

  function updatePrice() {
    const quantity = document.getElementById('quantity').value
    const priceInCents = quantity * 45000
    
    // Reactive update—no re-mount needed!
    document.querySelector('alma-payment-plans').purchaseAmount = priceInCents
  }
</script>
```

**Why this works:** Lit tracks property changes and re-fetches eligibility automatically. Cache deduplication ensures no duplicate API calls.

### Pattern 2: Auto-Modal (Default, Simplest)

Payment Plans widget automatically creates and opens a modal when user clicks a plan.

```javascript
// Just add PaymentPlans—Modal is auto-created
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#widget-left',
  purchaseAmount: 45000,
  locale: 'fr',
  // No modalSelector = auto-modal
})

// Modal opens automatically when user clicks any plan button
```

**Pros:** Minimal code, works out-of-the-box  
**Cons:** Modal container is auto-generated (harder to customize exact position)

### Pattern 3: Manual Modal (Advanced Control)

Wire Payment Plans to a specific Modal in a specific location.

```html
<div id="plans-container"></div>
<div id="payment-modal-container"></div>

<script src="https://cdn.almapay.com/widgets/alma-widgets.umd.js"></script>
<script>
  const widgets = Alma.Widgets.initialize('merchant_xxx', Alma.ApiMode.TEST)

  // Create modal in specific container
  widgets.add(Alma.Widgets.Modal, {
    container: '#payment-modal-container',
    purchaseAmount: 45000,
    locale: 'fr',
  })

  // Wire payment plans to that modal
  widgets.add(Alma.Widgets.PaymentPlans, {
    container: '#plans-container',
    purchaseAmount: 45000,
    locale: 'fr',
    modalSelector: '#payment-modal-container alma-modal',  // Link to modal
  })
</script>
```

**Pros:** Full control over modal placement and styling  
**Cons:** Requires CSS selector syntax

### Pattern 4: External Trigger Button

Open modal from custom button outside the widgets.

```html
<button id="custom-pay-btn" class="my-custom-button">Pay with Alma</button>
<div id="alma-modal"></div>

<script src="https://cdn.almapay.com/widgets/alma-widgets.umd.js"></script>
<script>
  const widgets = Alma.Widgets.initialize('merchant_xxx', Alma.ApiMode.TEST)

  // Connect modal to external button
  const { open, close } = widgets.add(Alma.Widgets.Modal, {
    container: '#alma-modal',
    purchaseAmount: 45000,
    locale: 'fr',
    clickableSelector: '#custom-pay-btn',  // Auto-wired
  })

  // Or trigger manually
  document.getElementById('another-button').addEventListener('click', () => {
    open()  // Programmatically open modal
  })

  // Close from custom code
  function handlePaymentComplete() {
    close()
  }
</script>
```

### Pattern 5: Show 1x "Pay Now" Plan

By default, the immediate payment (1x) plan is hidden to avoid confusion with standard checkout.

**To show it, explicitly add it to `plans`:**

```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#alma-widget',
  purchaseAmount: 45000,
  plans: [
    { installmentsCount: 1, minAmount: 100, maxAmount: 200000 },  // Show 1x
    { installmentsCount: 3, minAmount: 100, maxAmount: 200000 },  // 3x
    { installmentsCount: 4, minAmount: 100, maxAmount: 200000 },  // 4x
  ],
})
```

**Note:** If `plans` is not specified, Alma API determines all eligible plans (excluding 1x).

### Pattern 6: Multi-Widget (Multiple Products on Page)

Add payment widgets to multiple products on the same page.

```html
<div class="product">
  <h3>Product A - €100</h3>
  <div class="alma-widget" data-amount="10000"></div>
</div>

<div class="product">
  <h3>Product B - €250</h3>
  <div class="alma-widget" data-amount="25000"></div>
</div>

<script src="https://cdn.almapay.com/widgets/alma-widgets.umd.js"></script>
<script>
  const widgets = Alma.Widgets.initialize('merchant_xxx', Alma.ApiMode.TEST)

  // Initialize widgets for each product
  document.querySelectorAll('.alma-widget').forEach((el, index) => {
    const amount = parseInt(el.getAttribute('data-amount'))
    
    widgets.add(Alma.Widgets.PaymentPlans, {
      container: el,  // Can pass element directly
      purchaseAmount: amount,
      locale: 'fr',
    })
  })
</script>
```

### Pattern 7: Language Switcher

Change widget language dynamically.

```javascript
const plansEl = document.querySelector('alma-payment-plans')
const modalEl = document.querySelector('alma-modal')

document.getElementById('lang-selector').addEventListener('change', (e) => {
  const newLocale = e.target.value
  
  // Update both widgets
  plansEl.locale = newLocale
  modalEl.locale = newLocale
  // Widgets re-render automatically
})
```

---

## Localization & Languages

The widgets are available in 13+ language codes. Automatic regional variants handle language + region combinations.

### Supported Locales

| Locale | Language | Region |
|--------|----------|--------|
| `en` or `en-US` | English | United States |
| `fr` or `fr-FR` | Français | France |
| `de` or `de-DE` | Deutsch | Germany |
| `es` or `es-ES` | Español | Spain |
| `it` or `it-IT` | Italiano | Italy |
| `pt` or `pt-PT` | Português | Portugal |
| `nl` or `nl-NL` | Nederlands | Netherlands |
| `nl-BE` | Nederlands | Belgium |

### Setting Locale

Set per-widget or globally:

```javascript
// Per-widget (recommended)
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#plans',
  purchaseAmount: 45000,
  locale: 'de',  // German
})

widgets.add(Alma.Widgets.Modal, {
  container: '#modal',
  purchaseAmount: 45000,
  locale: 'it',  // Italian
})

// Or update existing widget
document.querySelector('alma-payment-plans').locale = 'es'
```

### Default Locale

If not specified, defaults to browser language (`navigator.language`). Falls back to `'en'` if not available.

### Translation Strings

All wording is managed via i18n JSON files in `src/i18n/messages/`. Examples:

- "3 times without fees" → "3 fois sans frais"
- "Pay now" → "Payer maintenant"
- "Fee information" → "Informations sur les frais"

See [docs/I18N.md](docs/I18N.md) for adding custom translations or Crowdin integration.

---

## Performance Optimization

### Bundle Size

| Format | Uncompressed | Gzipped |
|--------|-------------|---------|
| UMD | ~148 KB | ~37 KB |
| ES Module | ~203 KB | ~49 KB |

> Sizes from actual build output. Load time: Typically <2s via CDN (before API call).

### Session Caching

Automatically caches eligibility results in browser `sessionStorage`:

- **Same parameters** → instant (cache hit)
- **Different amount** → API call (new cache entry)
- **Page refresh** → cache persists (same session)
- **Cache expires** → 1 hour TTL

**Example:** 3 page refreshes with same cart = **1 API call** (vs 3 without cache).

### In-Flight Deduplication

If two widgets load simultaneously with identical parameters:
- First widget makes API call
- Second widget reuses first widget's promise
- Result: **1 API call** instead of 2

Example: PaymentPlans + Modal on same page with same amount = deduped!

### Minimizing API Calls

1. ✅ **Cache enabled by default** (session storage)
2. ✅ **Dedup enabled by default** (in-flight promises)
3. ✅ **Batch parameters** if possible (same purchase amount = cache hit)
4. ✅ **Avoid unnecessary updates** (only change amount if needed)

---

## Accessibility

The widgets aim for **WCAG 2.1 AA**, with a few remaining gaps for the Lit implementation.

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus next element |
| `Shift + Tab` | Focus previous element |
| `Enter` or `Space` | Activate button / open modal |
| `Escape` | Close modal |
| `Arrow Keys` | Navigate payment plans (not yet implemented) |
| `Home` / `End` | Jump to first / last plan (not yet implemented) |

### Screen Readers

- ✅ ARIA labels on all buttons and interactive elements
- ✅ Modal announces loading state (`role="status"`, `aria-live`)
- ✅ Plan selection announced (`aria-live="polite"`)
- ✅ Skip links for quick navigation
- ✅ Proper heading hierarchy (no h1/h2 in widget—uses role instead to avoid host disruption)

### Focus Management

- ✅ Focus trap inside modal (Tab/Shift+Tab cycles within modal)
- ✅ Focus restored to triggering button after modal closes
- ✅ Initial focus moves to close button when modal opens

### Reduced Motion

Respects `prefers-reduced-motion` CSS preference:
- Animation disabled automatically
- No flickering
- Smooth transitions replaced with instant display

### Known a11y Gaps

- Arrow/Home/End keyboard navigation in PaymentPlans
- Animation instructions not announced to screen readers

See `docs/ACCESSIBILITY.md` for the audit checklist and status.

---

## Styling & Customization

### CSS Isolation (Shadow DOM)

Widgets use **Shadow DOM** for complete CSS isolation:

```
Host Page CSS  →  [Widget Shadow Boundary]  ← Widget CSS
(no affect)                                      (isolated)
```

**Benefits:**
- ✅ Host CSS doesn't affect widget styling
- ✅ Widget CSS doesn't leak to host page
- ✅ Safe to add widgets to any existing site

**Limitation:** Custom CSS cannot be injected into the widget from host page.

### Available CSS Variables (Host)

Limited customization via CSS variables on the host page:

```css
:root {
  --alma-primary-color: #fa5022;      /* Orange branding */
  --alma-text-color: #1a1a1a;         /* Text */
  --alma-border-color: #e0e0e0;       /* Borders */
  --alma-bg-color: #ffffff;           /* Backgrounds */
}
```

**Note:** These are read by the widget but full customization would require shadow DOM piercing (not recommended).

### Font Customization

Fonts are loaded from Alma CDN:
- **Argent** (headings): ~60 KB
- **Inter** (body): ~80 KB

Cannot be customized—fonts are fixed for brand consistency.

### Color Modes

#### Orange Mode (Default)
```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#widget',
  purchaseAmount: 45000,
  monochrome: false,  // Orange branding
  colorScheme: 'orange',
})
```

#### Monochrome Mode (Black & White)
```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#widget',
  purchaseAmount: 45000,
  monochrome: true,  // No colors
})
```

#### Themed Color Scheme
```javascript
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#widget',
  purchaseAmount: 45000,
  colorScheme: 'dark-gray',
})
```

---

## Working Examples

Complete, working example files are in `examples/`:

### basic.html
Minimal integration—payment plans + modal on a product page.

```bash
npm run serve:examples
# Open http://localhost:3000/examples/basic.html
```

### multiple.html
Multiple payment widgets on the same page (different products, different amounts).

### customized.html
Custom styling, monochrome mode, custom buttons, external triggers.

### playground.html
**Interactive configuration tool** to test all widget options in real-time:
- Adjust purchase amount
- Try different languages
- Toggle monochrome, border, etc.
- See generated integration code
- Copy-paste ready code

**Launch:**
```bash
npm run dev      # or: npm run build:watch + npm run serve
# Open http://localhost:3000/examples/playground.html
```

---

## Troubleshooting

### "No payment plans available"

**Possible Causes:**

1. **Purchase amount too low or too high**
   - Alma has min/max eligibility thresholds
   - Test with €300–€3,000 range
   - Check merchant dashboard for configured amounts

2. **Merchant not configured**
   - Merchant ID might not have payment plans enabled
   - Contact Alma support to enable Alma Pay feature

3. **Wrong API credentials**
   - Verify merchant ID in browser DevTools Network tab
   - Check TEST vs LIVE mode matches your merchant account

4. **Network error**
   - Open browser DevTools → Network tab
   - Look for POST to `/v2/payments/eligibility`
   - Check response: is it 200, 403, 404, or 500?
   - If 403: Auth header might be malformed

### Widget not appearing at all

**Checklist:**

1. **Container exists?**
   ```javascript
   console.log(document.querySelector('#alma-widget'))  // Should not be null
   ```

2. **Script loaded?**
   ```javascript
   console.log(window.Alma)  // Should show object with Widgets, ApiMode
   ```

3. **No JavaScript errors?**
   - Open DevTools Console
   - Look for red errors
   - Check Network tab for failed requests

4. **Correct container selector?**
   ```javascript
   // BAD (id selector wrong)
   widgets.add(Alma.Widgets.PaymentPlans, {
     container: '.alma-widget',  // ❌ Dot = class, not id
   })

   // GOOD
   widgets.add(Alma.Widgets.PaymentPlans, {
     container: '#alma-widget',  // ✅ Hash = id
   })
   ```

5. **Purchase amount > 0?**
   ```javascript
   // If you pass 0 or negative, widget won't load
   purchaseAmount: 45000,  // ✅ Must be > 0
   ```

### Modal not opening when clicking plan

**Possible Causes:**

1. **Auto-modal not created**
   - Check browser console for errors during initialization
   - Check Network tab: is API call successful?

2. **Manual modal but wrong CSS selector**
   ```javascript
   // Wrong selector = no connection
   modalSelector: '#modal alma-modal',  // ✅ Correct
   modalSelector: 'alma-modal',         // ❌ Missing scope
   ```

3. **Modal container doesn't exist**
   ```javascript
   // Widget added but container not found
   widgets.add(Alma.Widgets.Modal, {
     container: '#this-container-does-not-exist',  // ❌
   })
   ```

### Widget loading very slowly

**Optimization:**

1. **Cache not being used**
   - Check browser → DevTools → Application → Session Storage
   - Should see `alma_eligibility_*` entries after first load
   - If empty, cache might be disabled or expired

2. **Multiple identical API calls**
   - Check Network tab: if you see 2+ identical `/eligibility` POST calls, dedup isn't working
   - Might indicate widgets added with different `merchantId` or `apiMode`

3. **Large network latency**
   - API calls go to Alma servers in production
   - Normal latency: 200–500ms
   - If >2s: might be network issue or server load

### "CORS" or "unauthorized" errors

**Cause:** Merchant ID or API credentials invalid.

**Fix:**
1. Verify merchant ID in browser DevTools Network tab request headers
2. Check if using TEST vs LIVE correctly
3. Contact Alma support if credentials are correct

### Widget styles looking weird

**Causes:**

1. **Host CSS affecting widget** (shouldn't happen with Shadow DOM)
   - Try in incognito mode
   - If still broken, it's a widget bug (report it)

2. **Font not loading**
   - Check Network tab for requests to `cdn.almapay.com/fonts/`
   - If 404: fonts service down (contact support)
   - If blocked: check browser extensions (ad blockers, etc.)

3. **Very old browser**
   - Widgets require CSS Grid + Shadow DOM
   - Minimum: Chrome 90, Firefox 88, Safari 14, Edge 90

---

## Browser Compatibility

| Browser | Min Version | Status |
|---------|------------|--------|
| Chrome / Chromium | 90+ | ✅ Fully supported |
| Firefox | 88+ | ✅ Fully supported |
| Safari | 14+ | ✅ Fully supported |
| Edge | 90+ | ✅ Fully supported |
| IE 11 | - | ❌ Not supported (no Shadow DOM) |

**Requirements:**
- CSS Grid
- Shadow DOM
- ES2015 (ES6) JavaScript
- Fetch API

No polyfills available—requires modern browser.

---

## API Reference

### Initialization

#### `Alma.Widgets.initialize(merchantId, apiMode)`

Create a new widget manager instance.

**Parameters:**
- `merchantId` (string, required): Your Alma merchant identifier (e.g., `'merchant_xxx'`)
- `apiMode` (ApiMode, required): `Alma.ApiMode.TEST` or `Alma.ApiMode.LIVE`

**Returns:** Widget manager object with `.add()` method

```javascript
const widgets = Alma.Widgets.initialize('merchant_xxx', Alma.ApiMode.TEST)
```

### Adding Widgets

#### `widgets.add(widgetType, options)`

Add a PaymentPlans or Modal widget to the page.

**Parameters:**
- `widgetType` (Constant): `Alma.Widgets.PaymentPlans` or `Alma.Widgets.Modal`
- `options` (Object): Configuration (see widget sections for all options)

**Returns:**
- PaymentPlans: `undefined`
- Modal: `{ open: Function, close: Function }`

```javascript
// PaymentPlans (no return value)
widgets.add(Alma.Widgets.PaymentPlans, { ... })

// Modal (returns control functions)
const { open, close } = widgets.add(Alma.Widgets.Modal, { ... })
```

### Reactive Properties

All mounted widgets expose reactive properties that can be updated:

```javascript
const widget = document.querySelector('alma-payment-plans')

// Update purchase amount (triggers API call)
widget.purchaseAmount = 90000

// Update language (re-renders UI)
widget.locale = 'en'

// Update styling
widget.monochrome = true

// Update plan suggestions
widget.suggestedPaymentPlan = 4
```

**Changes trigger:**
1. Property validation
2. UI re-render (for display changes like locale)
3. API call (for data-dependent changes like purchaseAmount)

### Modal Control

Modal widgets return control methods:

```javascript
const { open, close } = widgets.add(Alma.Widgets.Modal, {
  container: '#modal',
  purchaseAmount: 45000,
})

// Programmatically open
open()

// Programmatically close
close()
```

---

## Development & Contributing

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/alma/widgets-lit.git
cd widgets-lit

# Install dependencies
npm install

# Start development mode (watch + serve)
npm run dev:watch

# In another terminal:
npm run serve

# Open http://localhost:3000/examples/basic.html
```

### Project Structure

```
widgets-lit/
├── src/
│   ├── components/
│   │   ├── payment-plans.ts          # PaymentPlans Web Component
│   │   ├── modal.ts                  # Modal Web Component
│   │   ├── styles/
│   │   │   ├── payment-plans.css     # Payment plans styling
│   │   │   ├── modal.css             # Modal styling
│   │   │   └── fonts.ts              # Font definitions
│   │   └── __tests__/
│   │       ├── payment-plans.test.ts
│   │       └── modal.test.ts
│   ├── utils/
│   │   ├── fetch-eligibility.ts      # API communication + caching
│   │   ├── shared-fetch.ts           # In-flight deduplication
│   │   ├── filter-eligible-plans.ts  # Plan filtering logic
│   │   ├── format-price.ts           # Currency formatting
│   │   ├── storage-hash.ts           # Cache key hashing
│   │   ├── logger.ts                 # Logging utility
│   │   └── a11y/
│   │       ├── focus-trap.ts         # Focus management
│   │       └── inert-background.ts   # Inert attribute handling
│   ├── i18n/
│   │   ├── messages.ts               # Translation strings
│   │   └── utils.ts                  # i18n helper functions
│   ├── index.ts                      # Entry point (exports Alma global)
│   ├── constants.ts                  # Configuration constants
│   └── types.ts                      # TypeScript definitions
├── examples/
│   ├── basic.html
│   ├── multiple.html
│   ├── customized.html
│   ├── modal-only.html
│   ├── playground.html
│   └── serve.js                      # Development server
├── docs/
│   ├── FEATURE_PARITY.md             # Lit vs Preact comparison
│   ├── ACCESSIBILITY.md              # A11y audit & status
│   ├── I18N.md                       # Localization guide
│   ├── MIGRATION.md                  # Preact → Lit migration
│   ├── KNOWN_GAPS.md                 # TODO & roadmap
│   ├── DEPLOYMENT.md                 # Standalone build + publish guide for the Lit widget
│   └── STRATEGY.md                   # POC rationale, naming, and rollout strategy
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Build configuration
└── README.md                         # This file
```

### NPM Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev:watch` | Watch mode (rebuild on file change) |
| `npm run serve` | Start dev server for examples |
| `npm run build` | Production build (UMD + ESM) |
| `npm test` | Run test suite |
| `npm test -- --coverage` | Test coverage report |
| `npm run lint` | Lint TypeScript files |

### Code Guidelines

- **Language:** TypeScript (strict mode)
- **Components:** Lit Web Components (LitElement)
- **CSS:** Shadow DOM with internal CSS (no external dependencies)
- **Accessibility:** WCAG 2.1 AA compliance
- **i18n:** Translation keys in src/i18n/messages.ts
- **Comments:** English only (code comments + documentation)

### Testing

Tests use **Web Test Runner** + **Chai** + **Sinon**:

```bash
# Run once
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
# Report available at: coverage/lcov-report/index.html
```

**Coverage target:** >80%

### Building

Production builds create both UMD and ESM variants:

```bash
npm run build

# Output in dist/:
# - alma-widgets.umd.js      (~95 KB uncompressed, ~27 KB gzipped)
# - alma-widgets.js          (~133 KB uncompressed, ~35 KB gzipped)
```

### Adding a New Feature

1. Create component or utility in appropriate folder
2. Add TypeScript types to `src/types.ts`
3. Add tests in `__tests__` folder
4. Update `src/i18n/messages.ts` if UI text added
5. Update relevant documentation in `docs/`
6. Run `npm test` to ensure no regressions

---

## Migrating from Preact Widget

**The API is 100% compatible**—migrations typically require **zero code changes**.

See [docs/MIGRATION.md](docs/MIGRATION.md) for detailed guide.

**Quick migration:**

```javascript
// Before (Preact) - same code works with Lit!
const widgets = Alma.Widgets.initialize('merchant_xxx', Alma.ApiMode.TEST)
widgets.add(Alma.Widgets.PaymentPlans, {
  container: '#alma-widget',
  purchaseAmount: 45000,
})

// After (Lit) - no changes needed!
// Same API, same behavior, same integration
```

**Improvements you get:**
- ✅ 20% smaller bundle (37 KB gzipped vs 46 KB)
- ✅ No re-mount needed for property updates
- ✅ CSS fully isolated (Shadow DOM)
- ✅ Faster cache hits (75% fewer API calls)

---

## Documentation

Full documentation available in `docs/`:

- **[FEATURE_PARITY.md](docs/FEATURE_PARITY.md)** – Lit vs Preact feature comparison
- **[ACCESSIBILITY.md](docs/ACCESSIBILITY.md)** – WCAG 2.1 compliance audit
- **[I18N.md](docs/I18N.md)** – Localization & translation guide
- **[MIGRATION.md](docs/MIGRATION.md)** – Preact to Lit migration guide
- **[KNOWN_GAPS.md](docs/KNOWN_GAPS.md)** – Roadmap & future work
- **[SESSION_CACHE_HASHING.md](docs/SESSION_CACHE_HASHING.md)** – Cache implementation details
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** – Standalone build + publish guide for the Lit widget
- **[STRATEGY.md](docs/STRATEGY.md)** – POC rationale, naming, and rollout strategy

---

## Support & Feedback

- **Alma Documentation:** https://docs.almapay.com
- **Bug Reports:** GitHub Issues
- **Support:** support@almapay.com
- **Feature Requests:** GitHub Discussions

---

## License

MIT – See [LICENSE](LICENSE) file

---

**Last updated:** February 25, 2026  
**Alma Widgets Version:** 1.0+  
**Lit Version:** 3.0+

## Global API (Constants)

The Lit bundle exposes the same global API surface as the Preact widget. This is available on `window.Alma` when using the UMD build.

```js
Alma.Widgets.PaymentPlans
Alma.Widgets.Modal
Alma.ApiMode.TEST
Alma.ApiMode.LIVE
Alma.Utils.priceToCents(12.34)
Alma.Utils.priceFromCents(1234)
Alma.Utils.formatCents(1234, 'fr')
```

The `examples/playground.html` page shows these values live in the **Global API (Constants)** panel.
