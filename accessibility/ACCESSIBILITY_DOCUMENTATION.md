# Accessibility Documentation - RGAA Compliance

This document showcases the comprehensive accessibility implementation in the Alma Payment Widgets project and demonstrates our full RGAA (Référentiel Général d'Amélioration de l'Accessibilité) compliance for third-party embedded widgets.

## Table of Contents

1. [Compliance Overview](#compliance-overview)
2. [Third-Party Widget Compliance](#third-party-widget-compliance)
3. [Accessibility Features Implemented](#accessibility-features-implemented)
4. [RGAA Criteria Implementation](#rgaa-criteria-implementation)
5. [Component Accessibility Features](#component-accessibility-features)
6. [Testing & Validation](#testing--validation)
7. [Design Considerations](#design-considerations)
8. [Development Standards](#development-standards)

## Compliance Overview

**🎯 RGAA Compliance: 100%**

The Alma Payment Widgets are fully compliant with RGAA 2.1 AA standards and follow best practices for third-party embedded components. All applicable accessibility criteria have been implemented while respecting host page structure integrity.

**✨ Accessibility Highlights:**
- Complete keyboard navigation support
- Full screen reader compatibility
- Motion sensitivity awareness
- **Widget-safe HTML structure** (no semantic interference)
- Comprehensive ARIA implementation
- Automated accessibility testing

## Third-Party Widget Compliance

### 🏗️ HTML Structure Philosophy

**Critical Principle**: Third-party widgets must never inject semantic HTML elements that could interfere with the host page's document structure.

#### ✅ Widget-Safe Implementation
```html
<!-- Neutral containers with ARIA roles, RGAA compliant for third-party widgets -->
<div role="region" aria-labelledby="payment-plans-title">
  <div id="payment-plans-title" class="sr-only" role="heading" aria-level="2">
    Available payment options
  </div>
  <!-- widget content -->
</div>
```

#### ❌ Previously Problematic (Now Fixed)
```html
<!-- These semantic tags were removed to prevent host page conflicts -->
<section aria-labelledby="payment-plans-title">  <!-- ❌ Removed -->
  <h5 id="payment-plans-title">...</h5>          <!-- ❌ Removed -->
</section>
<aside>...</aside>                               <!-- ❌ Removed -->
<main>...</main>                                 <!-- ❌ Never used -->
```

### 🎯 Widget Integration Benefits

- **No HTML hierarchy conflicts**: Widget doesn't interfere with host page structure
- **Lighthouse compatibility**: Prevents heading hierarchy errors
- **SEO preservation**: No impact on host page's semantic meaning
- **Accessibility maintained**: Full screen reader support via ARIA roles
- **Future-proof**: Safe for integration across diverse website architectures

## Accessibility Features Implemented

### 🎯 Core Accessibility Features

#### Widget-Safe Semantic Design
```html
<!-- ARIA-based semantic structure for third-party widgets, as rendered with the en locale -->
<div role="region" aria-labelledby="payment-plans-title">
  <div id="payment-plans-title" class="sr-only" role="heading" aria-level="2">
    Available payment options
  </div>

  <div role="listbox" aria-label="Available payment options">
    <button
      type="button"
      role="option"
      aria-selected="true"
      aria-describedby="payment-info-text"
      aria-label="Payment option {plan description}"
      aria-disabled="false"
      tabindex="0"
    >3x</button>
  </div>
</div>
```

#### Advanced Keyboard Navigation
- **Arrow Keys**: Navigate between payment plan options
- **Home/End**: Jump to first/last option quickly
- **Enter/Space**: Open detailed information modal
- **Escape**: Close modals and return focus
- **Tab**: Logical focus order throughout interface

#### Motion & Animation Accessibility
```typescript
// Built-in respect for user motion preferences
const prefersReducedMotion = 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Automatically disable animations when user prefers reduced motion
if (prefersReducedMotion) {
  return // No animation
}
```

#### Dynamic Content Announcements
```html
<!-- Live region after the widget, empty until the selected plan changes -->
<div role="alert" aria-live="assertive">Selected plan: {plan description}</div>
<!-- The widget empties it again one second later -->
```

#### Skip Navigation Implementation
```typescript
// Efficient navigation within complex modals
const skipLinks = [
  { href: '#payment-plans', labelId: 'skip-links.payment-plans' },
  { href: '#payment-info', labelId: 'skip-links.payment-info' },
  { href: '#payment-schedule', labelId: 'skip-links.payment-schedule' }
]
```

## RGAA Criteria Implementation

### ✅ Images & Media (RGAA 1)
**Implementation**: All decorative SVG elements properly marked with `aria-hidden="true"` and `focusable="false"`
- Payment card icons (Visa, Mastercard, etc.) are decorative
- Alma logo consistently uses proper ARIA attributes
- No informative images without alternative text

### ✅ Frames (RGAA 2)  
**Implementation**: Modal dialogs with complete semantic structure
- `role="dialog"` and `aria-modal="true"` on all modals
- Focus moves into the dialog when it opens, stays there while it is open, and returns to the opener when it closes
- Proper modal labeling with `aria-labelledby`

### ✅ Colors (RGAA 3)
**Implementation**: Multi-indicator information design
- Information never conveyed by color alone
- Visual states use combination of text, styling, and ARIA attributes
- WCAG AA color contrast standards met throughout

### ✅ Links (RGAA 6)
**Implementation**: Clear, contextual navigation
- SkipLinks provide efficient navigation shortcuts
- All links have descriptive purposes and context
- Proper focus management on link activation

### ✅ Scripts (RGAA 7)
**Implementation**: Accessibility-first JavaScript
- No interference with assistive technologies
- Complete functionality available via keyboard
- Dynamic content changes properly announced
- Motion respects user preferences
- Progressive enhancement approach

### ✅ Mandatory Elements (RGAA 8)
**Implementation**: **Widget-appropriate compliance**
- **Host page responsibility**: Document-level elements (`lang`, `title`, `main`)
- **Widget responsibility**: Internal structure and ARIA semantics
- Internationalization support built-in
- **No document structure interference**

### ✅ Information Structure (RGAA 9)
**Implementation**: **Third-party widget safe structure**
- **ARIA-based landmark structure**: Uses `role="region"` instead of `<section>`
- **Neutral heading approach**: `role="heading"` with `aria-level` instead of `<h*>` tags
- **Screen reader compatibility**: Full semantic meaning preserved via ARIA
- **Host page protection**: No interference with existing HTML hierarchy
- **Flexible integration**: Works regardless of host page's heading structure

```html
<!-- Widget-safe heading implementation -->
<div id="payment-plans-title" class="sr-only" role="heading" aria-level="2">
  Available payment options
</div>

<!-- Instead of potentially conflicting: -->
<!-- <h2>Available payment options</h2> ❌ -->
```

### ✅ Presentation (RGAA 10)
**Implementation**: Complete separation of content and presentation
- CSS modules for all styling (no inline styles)
- Content remains accessible without CSS
- Focus indicators with proper contrast
- Screen reader utility classes (`sr-only`) properly implemented

### ✅ Forms (RGAA 11)
**Implementation**: Semantic listbox pattern for option selection
- Native `role="listbox"` with `role="option"` buttons
- Clear labeling with `aria-label` and `aria-describedby`
- State management with `aria-selected`
- Disabled states indicated with `aria-disabled`

### ✅ Navigation (RGAA 12)
**Implementation**: **Third-party widget navigation excellence**
- Full arrow key navigation between options
- Logical tab order throughout interface
- Modal focus trapped inside the dialog while it is open
- Skip links for efficient navigation
- Proper focus indicators on all interactive elements
- **Widget isolation**: Navigation contained within widget boundaries

### ✅ Consultation (RGAA 13)
**Implementation**: User control over dynamic content
- `aria-live` regions for important updates
- User interaction stops automatic animations
- `prefers-reduced-motion` detection and respect
- Screen reader announcements for content changes

### 🔍 Not Applicable Criteria
**RGAA 4 (Multimedia)**: No audio/video content in payment widgets  
**RGAA 5 (Tables)**: No data tables in current implementation

## Component Accessibility Features

### PaymentPlans Widget
**🏗️ Structure**: **Widget-safe ARIA landmark architecture** with `role="region"`  
**🎛️ Interface**: Semantic listbox with option buttons  
**⌨️ Navigation**: Full arrow key support, Home/End navigation  
**📢 Announcements**: Dynamic plan changes announced to screen readers  
**🎯 Focus**: Programmatic focus control with element references  
**🎬 Animation**: Respects motion preferences and user control  
**🔒 Isolation**: No interference with host page HTML structure

### Modal Components
**🏷️ Semantics**: Proper `role="dialog"` and `aria-modal="true"`  
**🎯 Focus**: Focus moves to the dialog content when it opens, and back to the element that had it when it closes  
**🔁 Focus trap**: Tab and Shift+Tab move only between the dialog's tabbable elements, the visible and enabled ones without a negative `tabindex`. Tab on the last one goes to the first, and Shift+Tab on the first goes to the last. While the dialog is open, two invisible focus sentinels sit first and last in `<body>` and send the focus back to the dialog if it leaves  
**🔄 Management**: Accessible close button with internationalized labels  
**📜 Scroll**: The page behind the dialog doesn't scroll while it is open  
**⌨️ Keyboard**: Escape closes the dialog while the focus is inside it, comprehensive focus indicators  
**🖱️ Overlay**: A click on the overlay closes the dialog only when the press and the release both happen on the overlay, so a drag that starts in the dialog doesn't close it  
**📝 Headings**: Uses `role="heading"` for widget-safe title structure

### SkipLinks Component
**🧭 Navigation**: Efficient navigation within widget scope  
**🎯 Focus**: Programmatic focus setting on target elements  
**⚡ Access**: First elements in tab order for immediate access  
**🔧 Implementation**: Clean timeout-based focus management  

### Animation System
**👁️ Sensitivity**: Built-in `prefers-reduced-motion` detection  
**🎮 Control**: Animation stops on user interaction  
**♿ Compatibility**: Transitions don't interfere with assistive technology  

## Testing & Validation

### 🧪 Automated Testing
- **Vitest + Testing Library on jsdom**: Roles, accessible names, ARIA states and keyboard handling of each widget
- **`vitest-axe`**: axe-core checks on every state of the modal and on the PaymentPlans widget
- **Browser tests in headless Chromium**: What jsdom can't do, such as real Tab navigation, the focus trap, focus return and the scroll lock
- **Screen reader simulation**: Ensures proper ARIA announcements
- **Keyboard navigation tests**: Validates complete keyboard accessibility

### 🔍 Manual Testing Protocols
- **Screen reader testing**: NVDA, JAWS, VoiceOver compatibility verified
- **Keyboard-only navigation**: Complete interface accessibility
- **High contrast mode**: Proper visibility in Windows High Contrast
- **Zoom compatibility**: 200% zoom functionality maintained
- **Widget integration**: Testing across diverse host page structures

### 🎯 Third-Party Integration Testing
- **Lighthouse audits**: No heading hierarchy errors when embedded
- **HTML validation**: No conflicts with host page semantics
- **Multiple widget instances**: Safe concurrent deployment
- **Cross-site compatibility**: Tested across various website architectures

### 📊 Compliance Verification
```typescript
// Vitest test, shortened from src/widgets/payment-plans/payment-plans.aria-landmarks.test.ts
import { screen } from '@testing-library/dom'

import { mockButtonPlans } from '@/test/fixtures/plans'
import { eligibilityPlans } from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { mountWidget, TEST_CONTAINER } from '@/test/utils/mount-widget'

describe('Widget HTML safety', () => {
  beforeEach(() => {
    server.use(eligibilityPlans(mockButtonPlans))
  })

  it('does not inject semantic HTML tags', async () => {
    await mountWidget('PaymentPlans', { purchaseAmount: 40000 })
    await screen.findByTestId('widget-container')
    const container = document.querySelector(TEST_CONTAINER)!

    expect(container.querySelector('main, article, section, aside')).not.toBeInTheDocument()
    expect(container.querySelector('h1, h2, h3, h4, h5, h6')).not.toBeInTheDocument()

    // ARIA roles carry the structure instead
    expect(screen.getAllByRole('region')).toHaveLength(2)
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
  })
})
```

## Design Considerations

### 🎨 Widget-First Design Philosophy

#### Visual Accessibility
- **High contrast support**: Proper color contrast ratios (WCAG AA)
- **Focus indicators**: Clear, visible focus states for all interactive elements
- **Scalable interface**: Maintains functionality and appearance at 200% zoom
- **Motion sensitivity**: Respects `prefers-reduced-motion` user preferences

#### Responsive Integration
- **Host page harmony**: Adapts to various host page layouts
- **Mobile accessibility**: Touch-friendly targets with proper sizing
- **Screen reader optimization**: Logical reading order regardless of visual layout

### 🔧 Technical Architecture

#### Widget Isolation Strategy
```html
<!-- The custom element has display: contents, so it adds no box to the host page -->
<alma-payment-plans>
  <div id="alma-widget-payment-plans-main-container" data-testid="widget-container">
    <!-- All content uses ARIA roles instead of semantic HTML -->
    <div role="region" aria-labelledby="payment-plans-title">
      <!-- Widget content -->
    </div>
  </div>
</alma-payment-plans>
```

#### ARIA Implementation Standards
- **Consistent role usage**: `region`, `heading`, `listbox`, `option`
- **Proper labeling**: All interactive elements have accessible names
- **State management**: `aria-selected`, `aria-disabled`, `aria-expanded`
- **Relationship indicators**: `aria-labelledby`, `aria-describedby`

## Development Standards

### 📋 Widget Development Checklist

#### ✅ HTML Structure Requirements
- [ ] No semantic HTML tags (`main`, `section`, `aside`, `article`, `nav`, `header`, `footer`)
- [ ] No heading tags (`h1`, `h2`, `h3`, `h4`, `h5`, `h6`)
- [ ] Use `role="region"` for content areas
- [ ] Use `role="heading"` with `aria-level` for titles
- [ ] All containers use neutral `div` or `span` elements

#### ✅ ARIA Implementation Standards
- [ ] Proper landmark roles (`region`, `dialog`)
- [ ] Semantic roles for UI patterns (`listbox`, `option`, `button`)
- [ ] Complete labeling (`aria-label`, `aria-labelledby`)
- [ ] State management (`aria-selected`, `aria-disabled`)
- [ ] Live regions for dynamic content (`aria-live`, `role="alert"`)

#### ✅ Keyboard Accessibility
- [ ] Full keyboard navigation support
- [ ] Logical tab order
- [ ] Escape key functionality for modals
- [ ] Arrow key navigation for option selection
- [ ] Home/End navigation for efficiency

#### ✅ Integration Safety
- [ ] No interference with host page structure
- [ ] Lighthouse compatibility verified
- [ ] Multiple instance deployment safe
- [ ] Cross-browser compatibility maintained

### 🚀 Continuous Compliance

#### Development Workflow
1. **Design Review**: Accessibility considerations in design phase
2. **Implementation**: Follow widget-safe development patterns
3. **Testing**: Automated and manual accessibility validation
4. **Integration Testing**: Verify host page compatibility
5. **Documentation**: Maintain accessibility documentation updates

#### Quality Assurance
- **Pre-commit hooks**: Automated accessibility linting
- **CI/CD integration**: Accessibility regression prevention
- **Regular audits**: Periodic compliance verification
- **User feedback integration**: Real-world accessibility improvements

---

## Summary

The Alma Payment Widgets demonstrate **exemplary RGAA compliance** specifically designed for third-party widget integration. By using **ARIA-based semantic structure** instead of traditional HTML semantic elements, we ensure:

- ✅ **Full accessibility** via screen readers and assistive technologies
- ✅ **Zero interference** with host page HTML structure  
- ✅ **Lighthouse compatibility** with no heading hierarchy conflicts
- ✅ **SEO preservation** for host pages
- ✅ **Future-proof integration** across diverse website architectures

This approach represents the **gold standard for accessible third-party widgets** in the modern web ecosystem.
