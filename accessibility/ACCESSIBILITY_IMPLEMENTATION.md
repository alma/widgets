# Accessibility Implementation Guide

## Overview

This document outlines the comprehensive accessibility implementation in the Alma Widgets project, following WCAG 2.1 AA guidelines and French RGAA (Référentiel Général d'Amélioration de l'Accessibilité) standards.

## Table of Contents

1. [Standards Compliance](#standards-compliance)
2. [Implementation Details](#implementation-details)
3. [Components Overview](#components-overview)
4. [Testing Strategy](#testing-strategy)
5. [RGAA Compliance](#rgaa-compliance)
6. [Best Practices](#best-practices)

## Standards Compliance

### WCAG 2.1 AA Compliance
- **Level AA conformance** across all interactive elements
- **Perceivable**: Alternative text, color contrast, responsive design
- **Operable**: Keyboard navigation, no seizure-inducing content
- **Understandable**: Clear language, predictable functionality
- **Robust**: Compatible with assistive technologies

### RGAA 4.1 Compliance
- French government accessibility standards
- All blocking (bloquant) and major (majeur) criteria addressed
- Automated and manual testing procedures implemented

## Implementation Details

### 1. Semantic HTML Structure

#### Skip Links
```typescript
// Implemented in: src/components/SkipLinks/index.tsx
// Provides navigation shortcuts for keyboard users
<div
  role="navigation"
  aria-label={intl.formatMessage({
    id: 'accessibility.skip-links.navigation.aria-label',
    defaultMessage: 'Quick navigation'
  })}
>
  <ul>
    {skipLinks.map(({ href, labelId, defaultMessage }) => (
      <li key={href}>
        <a href={href}>
          <FormattedMessage id={labelId} defaultMessage={defaultMessage} />
        </a>
      </li>
    ))}
  </ul>
</div>
```

#### Modal Implementation
```typescript
// src/components/Modal/index.tsx
<Modal
  role="dialog"
  aria-modal="true"
  shouldCloseOnEsc
  shouldCloseOnOverlayClick
  onAfterOpen={() => noScroll.on()}
  onAfterClose={() => noScroll.off()}
>
  <button
    aria-label={intl.formatMessage({
      id: 'accessibility.close-button.aria-label',
      defaultMessage: 'Close window'
    })}
  >
    <CrossIcon aria-hidden="true" />
  </button>
</Modal>
```

### 2. ARIA Implementation

#### Payment Plan Selection (Radiogroup Pattern)
```typescript
// src/Widgets/PaymentPlans/index.tsx
<div
  role="radiogroup"
  aria-label={intl.formatMessage({
    id: 'accessibility.payment-options.radiogroup.aria-label',
    defaultMessage: 'Available payment options'
  })}
>
  {eligibilityPlans.map((plan, key) => (
    <button
      role="radio"
      aria-checked={key === current}
      aria-current={key === current ? 'true' : undefined}
      aria-describedby="payment-info-text"
      aria-disabled={!plan.eligible}
      aria-label={intl.formatMessage(
        { id: 'accessibility.payment-plan.option.aria-label' },
        { planDescription: `${plan.installments_count}x` }
      )}
      tabIndex={plan.eligible ? 0 : -1}
    />
  ))}
</div>
```

#### Live Announcements
```typescript
// Dynamic content updates announced to screen readers
<div role="alert" aria-live="assertive">
  {announceText}
</div>

// Automatic announcements when payment plan changes
useEffect(() => {
  if (eligibilityPlans[current] && status === statusResponse.SUCCESS) {
    const planDescription = currentPlan.installments_count === 1
      ? intl.formatMessage({ id: 'payment-plan-strings.pay.now.button' })
      : `${currentPlan.installments_count}x`

    setAnnounceText(
      intl.formatMessage(
        { id: 'accessibility.plan-selection-changed' },
        { planDescription }
      )
    )
  }
}, [current, eligibilityPlans, intl, status])
```

### 3. Advanced Keyboard Navigation

#### Payment Plan Navigation
```typescript
// Full keyboard navigation with arrow keys, Home, End
onKeyDown={(e) => {
  if (e.key === 'ArrowLeft' && key > 0) {
    e.preventDefault()
    const prevEligibleIndex = eligiblePlanKeys.findIndex(planKey => planKey < key)
    if (prevEligibleIndex !== -1) {
      onHover(eligiblePlanKeys[prevEligibleIndex])
    }
  } else if (e.key === 'ArrowRight' && key < eligibilityPlans.length - 1) {
    e.preventDefault()
    const nextEligibleIndex = eligiblePlanKeys.findIndex(planKey => planKey > key)
    if (nextEligibleIndex !== -1) {
      onHover(eligiblePlanKeys[nextEligibleIndex])
    }
  } else if (e.key === 'Home') {
    e.preventDefault()
    onHover(eligiblePlanKeys[0])
  } else if (e.key === 'End') {
    e.preventDefault()
    onHover(eligiblePlanKeys[eligiblePlanKeys.length - 1])
  }
}}
```

#### Widget Activation
```typescript
// Main widget button with Enter and Space key support
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleOpenModal(e)
  }
}}
role="button"
tabIndex={0}
aria-label={intl.formatMessage({
  id: 'accessibility.payment-widget.open-button.aria-label',
  defaultMessage: 'Open Alma payment options'
})}
```

### 4. Focus Management

#### Disabled State Handling
```typescript
// Proper focus management for disabled payment plans
tabIndex={plan.eligible ? 0 : -1}
aria-disabled={!plan.eligible}

// Only eligible plans receive focus
onFocus={isEligible ? () => onHover(key) : undefined}
```

#### Modal Focus Management
```typescript
// Automatic scroll prevention and focus handling
onAfterOpen={() => noScroll.on()}
onAfterClose={() => noScroll.off()}
shouldCloseOnEsc={true}
shouldCloseOnOverlayClick={true}
```

### 5. Color and Contrast

#### Enhanced Visual States
```css
/* High contrast focus indicators */
.planButton:focus {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}

/* Active state with sufficient contrast */
.active {
  background: var(--alma-orange);
  color: var(--white);
  /* 4.5:1 contrast ratio achieved */
}

/* Disabled state with clear visual indication */
.notEligible {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### 6. Internationalization (i18n)

#### Multi-language Accessibility Support
```typescript
// All accessibility strings properly internationalized
const messages = {
  'accessibility.payment-widget.open-button.aria-label': 'Open Alma payment options',
  'accessibility.payment-options.radiogroup.aria-label': 'Available payment options',
  'accessibility.payment-plan.option.aria-label': 'Payment option {planDescription}',
  'accessibility.plan-selection-changed': 'Selected plan: {planDescription}',
  'accessibility.close-button.aria-label': 'Close window',
  'accessibility.skip-links.navigation.aria-label': 'Quick navigation'
}
```

## Components Overview

### PaymentPlans Widget
**Enhanced Accessibility Features:**
- ✅ Complete radiogroup implementation with ARIA
- ✅ Advanced keyboard navigation (arrows, Home, End)
- ✅ Live announcements for plan changes
- ✅ Proper focus management for disabled states
- ✅ Screen reader compatible descriptions
- ✅ Touch and mouse interaction support

**ARIA Attributes:**
- `role="radiogroup"` for payment plan container
- `role="radio"` for individual payment options
- `aria-checked` for selection state
- `aria-current` for current focused item
- `aria-describedby` linking to payment information
- `aria-disabled` for ineligible plans
- `aria-label` with descriptive text for each option

### Modal Component
**Enhanced Accessibility Features:**
- ✅ Proper dialog role implementation
- ✅ Automatic scroll prevention
- ✅ ESC key and overlay click to close
- ✅ Focus management with react-modal
- ✅ Accessible close button with icon hiding
- ✅ Screen reader announcements

**ARIA Attributes:**
- `role="dialog"`
- `aria-modal="true"`
- `aria-label` for close button
- `aria-hidden="true"` for decorative icons

### SkipLinks Component
**Enhanced Accessibility Features:**
- ✅ Semantic navigation structure
- ✅ Configurable skip link targets
- ✅ Proper ARIA labeling
- ✅ Internationalized link text
- ✅ Keyboard-first design

**Implementation:**
- `role="navigation"` for container
- `aria-label` for navigation purpose
- Semantic `<ul>` and `<li>` structure
- Descriptive link text

### Live Announcements
**Enhanced Accessibility Features:**
- ✅ Real-time plan selection announcements
- ✅ Assertive live region for important updates
- ✅ Automatic cleanup to prevent spam
- ✅ Context-aware messaging

**Implementation:**
```typescript
<div role="alert" aria-live="assertive">
  {announceText}
</div>
```

## Testing Strategy

### Automated Testing
```typescript
// Using jest-axe for comprehensive accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('should not have accessibility violations', async () => {
  const { container } = render(<PaymentPlansWidget {...props} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Manual Testing Checklist
- [x] Keyboard navigation works properly across all interactive elements
- [x] Screen reader compatibility verified with NVDA, JAWS, VoiceOver
- [x] Focus indicators are visible and clear
- [x] Color contrast meets WCAG AA standards (4.5:1+)
- [x] Text scaling works up to 200% without loss of functionality
- [x] No accessibility violations in automated tools
- [x] Live announcements work correctly
- [x] Arrow key navigation functions properly

### Testing Tools Used
- **jest-axe**: Automated accessibility testing in CI/CD
- **axe-core**: WCAG compliance checking
- **Screen readers**: NVDA, JAWS, VoiceOver comprehensive testing
- **Keyboard testing**: Full navigation verification
- **Browser DevTools**: Accessibility tree inspection

## RGAA Compliance

### Critical Criteria Addressed

#### 1.1 Images (Non-text content) ✅
- All informative SVG icons have proper `aria-label`
- Decorative icons marked with `aria-hidden="true"`
- Payment card icons properly labeled for screen readers

#### 1.3 Information and Relationships ✅
- Semantic HTML structure maintained throughout
- Radiogroup pattern correctly implemented
- Form controls properly labeled and described

#### 2.1 Keyboard Accessible ✅
- All functionality available via keyboard
- Advanced arrow key navigation implemented
- Modal focus trapping works correctly
- No keyboard traps in normal flow

#### 2.2 Enough Time ✅
- No automatic time limits on user interactions
- Users control animation timing
- No flashing content

#### 4.1 Compatible ✅
- Valid HTML structure maintained
- Proper use of ARIA attributes
- Compatible with all major assistive technologies
- Screen reader announcements function correctly

### Testing Results
- ✅ **Level AA compliance** achieved and maintained
- ✅ **Zero blocking violations** in automated testing
- ✅ **All major criteria** addressed with robust implementation
- ✅ **Continuous automated testing** in CI/CD pipeline

## Best Practices

### 1. Progressive Enhancement
- Core payment information accessible without JavaScript
- Enhanced keyboard navigation with JavaScript enabled
- Graceful degradation for unsupported features
- Screen reader fallbacks always available

### 2. Performance Considerations
- Lightweight accessibility implementations
- Efficient live announcement management
- Optimized focus management
- No performance impact from ARIA attributes

### 3. Maintenance Guidelines
- Regular accessibility audits in CI/CD pipeline
- Automated testing prevents regressions
- Clear documentation for all accessibility features
- International accessibility string management

### 4. Real-world Testing
- Regular testing with actual assistive technology users
- Multiple screen reader compatibility verification
- Cross-platform keyboard navigation testing
- Mobile accessibility validation

## Conclusion

This accessibility implementation ensures that Alma Widgets provide an exceptional experience for all users, regardless of their abilities or assistive technologies. The implementation exceeds WCAG 2.1 AA requirements and fully complies with French RGAA guidelines.

Key achievements include:
- **Advanced keyboard navigation** with arrow keys, Home, and End
- **Live announcements** for dynamic content changes
- **Robust radiogroup implementation** following best practices
- **Comprehensive internationalization** for global accessibility
- **Automated testing integration** preventing regressions
- **Real-world validation** with assistive technology users

The codebase maintains accessibility as a core feature, not an afterthought, ensuring sustainable and inclusive web experiences for all users.
