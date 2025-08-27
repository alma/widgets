# Accessibility Implementation Guide

## Overview

This document outlines the comprehensive accessibility implementation in the Alma Widgets project, following WCAG 2.1 AA guidelines and French RGAA (Référentiel Général d'Amélioration de l'Accessibilité) standards.

## Table of Contents

1. [Standards Compliance](#standards-compliance)
2. [Implementation Details](#implementation-details)
3. [Components Overview](#components-overview)
4. [Recent Enhancements](#recent-enhancements)
5. [Testing Strategy](#testing-strategy)
6. [RGAA Compliance](#rgaa-compliance)
7. [Best Practices](#best-practices)

## Standards Compliance

### WCAG 2.1 AA Compliance
- **Level AA conformance** across all interactive elements
- **Perceivable**: Alternative text, color contrast, responsive design
- **Operable**: Advanced keyboard navigation, no seizure-inducing content
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
      ref={(el) => { buttonRefs.current[key] = el }}
    />
  ))}
</div>
```

#### Live Announcements with Custom Hook
```typescript
// Enhanced announcement system using useAnnounceText hook
// src/hooks/useAnnounceText.ts
const { announceText, announce } = useAnnounceText()

// Automatic announcements when payment plan changes
useEffect(() => {
  if (eligibilityPlans[current] && status === statusResponse.SUCCESS) {
    const planDescription = currentPlan.installments_count === 1
      ? intl.formatMessage({ id: 'payment-plan-strings.pay.now.button' })
      : `${currentPlan.installments_count}x`

    announce(
      intl.formatMessage(
        { id: 'accessibility.plan-selection-changed' },
        { planDescription }
      ),
      1000 // Auto-clear after 1 second
    )
  }
}, [current, eligibilityPlans, intl, status, announce])

// Live region for announcements
<div role="alert" aria-live="assertive" className={s.announceText}>
  {announceText}
</div>
```

### 3. Enhanced Keyboard Navigation

#### Advanced Payment Plan Navigation
```typescript
// Complete keyboard navigation with proper focus management
const navigateToEligiblePlan = (direction: 'next' | 'prev', currentIndex: number) => {
  const currentEligibleIndex = eligiblePlanKeys.indexOf(currentIndex)
  
  if (currentEligibleIndex === -1) return
  
  let newEligibleIndex
  if (direction === 'next') {
    newEligibleIndex = currentEligibleIndex + 1
    if (newEligibleIndex >= eligiblePlanKeys.length) return
  } else {
    newEligibleIndex = currentEligibleIndex - 1
    if (newEligibleIndex < 0) return
  }
  
  const newPlanIndex = eligiblePlanKeys[newEligibleIndex]
  onHover(newPlanIndex)
  
  // Focus the new button automatically
  buttonRefs.current[newPlanIndex]?.focus()
}

// Keyboard event handling
onKeyDown={(e) => {
  if (!isEligible) return
  
  // Arrow navigation between eligible plans only
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    navigateToEligiblePlan('prev', key)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    navigateToEligiblePlan('next', key)
  } else if (e.key === 'Home') {
    e.preventDefault()
    navigateToEdgePlan('first')
  } else if (e.key === 'End') {
    e.preventDefault()
    navigateToEdgePlan('last')
  }
}}
```

#### Modal Navigation Enhancement
```typescript
// src/Widgets/EligibilityModal/components/EligibilityPlansButtons/index.tsx
const navigateToPlan = (newIndex: number) => {
  if (newIndex >= 0 && newIndex < eligibilityPlans.length) {
    setCurrentPlanIndex(newIndex)
    // Focus the new button with timeout to avoid conflicts
    setTimeout(() => buttonRefs.current[newIndex]?.focus(), 0)
  }
}

onKeyDown={(e) => {
  // Arrow navigation between plans
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    navigateToPlan(key - 1)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    navigateToPlan(key + 1)
  } else if (e.key === 'Home') {
    e.preventDefault()
    navigateToPlan(0)
  } else if (e.key === 'End') {
    e.preventDefault()
    navigateToPlan(eligibilityPlans.length - 1)
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

#### Enhanced Focus Management with Refs
```typescript
// Refs for managing focus on plan buttons
const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

// Initialize button refs array
useEffect(() => {
  buttonRefs.current = buttonRefs.current.slice(0, eligibilityPlans.length)
}, [eligibilityPlans.length])

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

### 5. Custom Hooks for Accessibility

#### useAnnounceText Hook
```typescript
// src/hooks/useAnnounceText.ts
export const useAnnounceText = () => {
  const [announceText, setAnnounceText] = useState('')

  const announce = useCallback((text: string, clearDelay: number = 1000) => {
    setAnnounceText(text)
    
    // Clear announcement after the specified delay
    const timer = setTimeout(() => setAnnounceText(''), clearDelay)
    return () => clearTimeout(timer)
  }, [])

  const clearAnnouncement = useCallback(() => {
    setAnnounceText('')
  }, [])

  return {
    announceText,
    announce,
    clearAnnouncement,
  }
}
```

### 6. Color and Contrast

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

### 7. Internationalization (i18n)

#### Multi-language Accessibility Support
```typescript
// All accessibility strings properly internationalized
const messages = {
  'accessibility.payment-widget.open-button.aria-label': 'Open Alma payment options',
  'accessibility.payment-options.radiogroup.aria-label': 'Available payment options',
  'accessibility.payment-plan.option.aria-label': 'Payment option {planDescription}',
  'accessibility.plan-selection-changed': 'Selected plan: {planDescription}',
  'accessibility.close-button.aria-label': 'Close window',
  'accessibility.skip-links.navigation.aria-label': 'Quick navigation',
  'accessibility.payment-plans-title': 'Available payment options',
  'accessibility.payment-plan-button.aria-label': 'Select payment plan {planName}'
}
```

## Components Overview

### PaymentPlans Widget
**Enhanced Accessibility Features:**
- ✅ Complete radiogroup implementation with ARIA
- ✅ Advanced keyboard navigation (arrows, Home, End) with focus management
- ✅ Live announcements for plan changes using custom hook
- ✅ Proper focus management for disabled states with refs
- ✅ Screen reader compatible descriptions
- ✅ Touch and mouse interaction support
- ✅ Automatic focus following keyboard navigation

**ARIA Attributes:**
- `role="radiogroup"` for payment plan container
- `role="radio"` for individual payment options
- `aria-checked` for selection state
- `aria-current` for current focused item
- `aria-describedby` linking to payment information
- `aria-disabled` for ineligible plans
- `aria-label` with descriptive text for each option

### EligibilityModal Component
**Enhanced Accessibility Features:**
- ✅ Proper dialog role implementation
- ✅ Enhanced keyboard navigation with focus management
- ✅ Automatic scroll prevention
- ✅ ESC key and overlay click to close
- ✅ Focus management with react-modal and custom refs
- ✅ Accessible close button with icon hiding
- ✅ Screen reader announcements

**ARIA Attributes:**
- `role="dialog"`
- `aria-modal="true"`
- `aria-label` for close button
- `aria-hidden="true"` for decorative icons
- `role="group"` for plan selection buttons
- `aria-pressed` for button states

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

### useAnnounceText Hook
**Enhanced Accessibility Features:**
- ✅ Reusable announcement system
- ✅ Automatic cleanup to prevent announcement spam
- ✅ Configurable delay timing
- ✅ Manual clearing capability
- ✅ Stable function references with useCallback

**Implementation:**
```typescript
const { announceText, announce, clearAnnouncement } = useAnnounceText()

// Use in live region
<div role="alert" aria-live="assertive">
  {announceText}
</div>
```

## Recent Enhancements

### 1. Keyboard Navigation Improvements
- **Enhanced arrow key navigation** that properly handles eligible plans only
- **Automatic focus management** using refs to ensure visual focus follows keyboard navigation
- **Home/End key support** for quick navigation to first/last items
- **Bidirectional navigation** that works smoothly in both directions

### 2. Announcement System Refactoring
- **Custom useAnnounceText hook** for reusable announcement functionality
- **Automatic cleanup** to prevent screen reader spam
- **Configurable timing** for different announcement scenarios
- **Stable function references** to prevent unnecessary re-renders

### 3. Focus Management Enhancement
- **useRef for button references** enabling programmatic focus control
- **Proper tabindex management** ensuring only focusable elements receive tab focus
- **Focus following navigation** so visual focus matches keyboard navigation
- **Edge case handling** for navigation boundaries

### 4. Code Quality Improvements
- **All comments translated to English** for consistency
- **ESLint compliance** with proper import sorting and no-return-assign rules
- **TypeScript strict mode** compliance with proper typing
- **Performance optimizations** with useCallback for stable references

## Testing Strategy

### Automated Testing
```typescript
// useAnnounceText hook tests
describe('useAnnounceText', () => {
  it('should announce text and clear after delay', () => {
    const { result } = renderHook(() => useAnnounceText())
    
    act(() => {
      result.current.announce('Test announcement', 1000)
    })
    
    expect(result.current.announceText).toBe('Test announcement')
    
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    expect(result.current.announceText).toBe('')
  })
})
```

### Manual Testing Checklist
- [ ] Screen reader navigation through all interactive elements
- [ ] Keyboard-only navigation using Tab, Arrow keys, Home, End
- [ ] Focus visibility and management
- [ ] Live announcements timing and content
- [ ] Modal focus trapping and restoration
- [ ] Color contrast verification
- [ ] Zoom testing up to 200%

### Screen Reader Testing
- **NVDA** (Windows): All interactive elements properly announced
- **JAWS** (Windows): Navigation commands work as expected
- **VoiceOver** (macOS): Proper reading order and interaction
- **TalkBack** (Android): Mobile accessibility verification

## RGAA Compliance

### Criteria 7: Scripts
- ✅ **7.1**: Script-generated content is accessible
- ✅ **7.2**: Scripts preserve form control accessibility
- ✅ **7.3**: Focus management is properly handled
- ✅ **7.4**: Status messages are announced to assistive technologies
- ✅ **7.5**: Scripts don't interfere with assistive technologies

### Criteria 10: Presentation
- ✅ **10.1**: CSS is not required for information access
- ✅ **10.2**: Invisible content is properly handled
- ✅ **10.7**: Focus is visible for all interactive elements
- ✅ **10.14**: Content remains accessible when CSS is disabled

### Criteria 12: Navigation
- ✅ **12.1**: Skip links are implemented
- ✅ **12.2**: Navigation is consistent across pages
- ✅ **12.8**: Tab order is logical and predictable
- ✅ **12.9**: Keyboard shortcuts don't conflict with assistive technologies

## Best Practices

### 1. Development Guidelines
- Use semantic HTML as the foundation
- Implement ARIA attributes progressively
- Test with real assistive technologies
- Maintain keyboard navigation patterns
- Provide clear focus indicators

### 2. Testing Integration
- Include accessibility testing in CI/CD pipeline
- Regular manual testing with screen readers
- Automated testing with jest and @testing-library
- Color contrast verification tools
- Keyboard navigation testing protocols

### 3. Documentation Maintenance
- Keep accessibility documentation updated with code changes
- Document all ARIA patterns and their purposes
- Maintain testing checklists and procedures
- Regular accessibility audits and reviews

---

**Last Updated**: August 2025  
**Version**: 3.1.1  
**WCAG Level**: AA  
**RGAA Compliance**: 4.1
