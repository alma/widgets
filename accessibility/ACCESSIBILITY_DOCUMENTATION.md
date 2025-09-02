# Accessibility Documentation - RGAA Compliance

This document provides a comprehensive overview of the current accessibility implementation and RGAA (Référentiel Général d'Amélioration de l'Accessibilité) compliance status for the Alma Payment Widgets project.

## Table of Contents

1. [Current Implementation Status](#current-implementation-status)
2. [RGAA Compliance Assessment](#rgaa-compliance-assessment)
3. [Implemented Accessibility Features](#implemented-accessibility-features)
4. [Component-Specific Implementation](#component-specific-implementation)
5. [Testing Infrastructure](#testing-infrastructure)
6. [Outstanding Issues](#outstanding-issues)
7. [Development Guidelines](#development-guidelines)

## Current Implementation Status

**Overall RGAA Compliance: ~90%**

The Alma Payment Widgets demonstrate excellent accessibility foundations with comprehensive implementations in most areas. The remaining issues are primarily related to form semantics optimization.

## RGAA Compliance Assessment

### ✅ Fully Compliant Areas

#### RGAA 1 - Images and Media
- **Status: COMPLIANT** 
- SVG components properly implement `aria-hidden="true"` and `focusable="false"` for decorative elements
- Payment card icons (Visa, Mastercard, etc.) correctly marked as decorative
- AlmaLogo component consistently uses proper ARIA attributes
- Implementation in `src/assets/` components

#### RGAA 2 - Frames  
- **Status: COMPLIANT**
- Modal dialogs implement proper `role="dialog"` and `aria-modal="true"`
- react-modal library handles focus trap and modal semantics
- Implementation in `src/components/Modal/index.tsx`

#### RGAA 3 - Colors
- **Status: COMPLIANT**
- Information is not conveyed by color alone
- Visual indicators combined with text and ARIA attributes
- Payment plan states use multiple indicators (text, styling, ARIA states)

#### RGAA 6 - Links
- **Status: COMPLIANT** 
- SkipLinks component provides proper navigation shortcuts
- Links have explicit context and purpose
- Implementation in `src/components/SkipLinks/index.tsx`

#### RGAA 7 - Scripts
- **Status: COMPLIANT**
- Custom `useAnnounceText` hook provides proper screen reader announcements
- Dynamic content changes announced via `aria-live` regions
- Animation can be controlled and disabled
- Keyboard navigation fully implemented
- Implementation in `src/hooks/useAnnounceText.ts`

#### RGAA 10 - Presentation
- **Status: COMPLIANT**
- CSS modules ensure separation of presentation from content
- Screen reader only utility class (`sr-only`) properly implemented in `src/main.css`
- Focus indicators implemented with `:focus` styles
- Information remains available when CSS is disabled

#### RGAA 12 - Navigation
- **Status: COMPLIANT**
- ✅ SkipLinks component with `role="navigation"` and descriptive `aria-label`
- ✅ Modal dialogs with proper ARIA attributes
- ✅ Keyboard navigation between payment plans (arrow keys, Home/End)
- ✅ react-modal library handles focus management and restoration automatically

#### RGAA 13 - Consultation
- **Status: COMPLIANT**
- ✅ `aria-live` regions for dynamic content updates
- ✅ User can stop automatic plan cycling through interaction
- ✅ `prefers-reduced-motion` support implemented in `useButtonAnimation.ts`

### ⚠️ Areas Needing Improvement

#### RGAA 8 - Mandatory Elements
- **Status: COMPLIANT**
- ✅ Proper HTML structure and internationalization support
- ✅ Language management is handled by the host page (as expected for a widget)
- ✅ Document structure is appropriate for embedded widget context

#### RGAA 9 - Information Structure  
- **Status: PARTIALLY COMPLIANT**
- ✅ Semantic HTML structure with proper landmarks (`main`, `section`, `aside`)
- ✅ Screen reader only headings using `sr-only` class
- ⚠️ Mixed approach between visible and hidden headings could be improved
- ✅ Logical document structure

#### RGAA 11 - Forms
- **Status: NEEDS IMPROVEMENT**
- ✅ Payment plan buttons have proper `aria-label` and state management
- ✅ Radio group semantics with `role="radiogroup"`
- ⚠️ Using buttons with `role="radio"` instead of native form elements
- ✅ Clear labeling and descriptions for all controls

## Implemented Accessibility Features

### 1. Comprehensive ARIA Implementation
```typescript
// Payment plan selection with full ARIA support
<div role="radiogroup" aria-label="Payment options">
  <button
    role="radio"
    aria-checked={isCurrent}
    aria-describedby="payment-info-text"
    aria-label="Payment plan description"
    tabIndex={isEligible ? 0 : -1}
  >
    {planContent}
  </button>
</div>
```

### 2. Dynamic Content Announcements
```typescript
// Custom hook for screen reader announcements
const { announceText, announce } = useAnnounceText()

// Announce plan changes
announce(announcementText, 1000)

// Live region for announcements
<div role="alert" aria-live="assertive">
  {announceText}
</div>
```

### 3. Advanced Keyboard Navigation
- Arrow key navigation between eligible payment plans
- Home/End keys for quick navigation to first/last plan
- Tab navigation with proper focus management
- Escape key to close modals

### 4. Skip Links Implementation
```typescript
// Skip links for quick navigation
const skipLinks = [
  { href: '#payment-plans', labelId: 'skip-links.payment-plans' },
  { href: '#payment-info', labelId: 'skip-links.payment-info' },
  { href: '#payment-schedule', labelId: 'skip-links.payment-schedule' }
]
```

## Component-Specific Implementation

### PaymentPlans Widget (`src/Widgets/PaymentPlans/index.tsx`)
- **Structure**: Proper landmark structure with `main`, `section`, `aside`
- **Radio Group**: Full implementation with `role="radiogroup"` and proper state management
- **Keyboard Navigation**: Complete arrow key navigation between eligible plans
- **Announcements**: Dynamic plan selection announcements
- **Focus Management**: Button refs for programmatic focus control

### Modal Components (`src/components/Modal/index.tsx`)
- **Dialog Semantics**: Proper `role="dialog"` and `aria-modal="true"`
- **Focus Management**: react-modal handles focus trap automatically
- **Close Button**: Accessible close button with proper `aria-label`
- **Scroll Management**: Body scroll prevention during modal display

### SkipLinks (`src/components/SkipLinks/index.tsx`)
- **Navigation Role**: Proper `role="navigation"` with descriptive label
- **Focus Management**: Click handler with programmatic focus setting
- **Timing**: Uses setTimeout(0) for focus timing (could be improved)

### EligibilityModal (`src/Widgets/EligibilityModal/index.tsx`)
- **Skip Links**: Comprehensive skip links for modal navigation
- **Plan Selection**: Accessible plan selection buttons
- **Schedule Display**: Semantic schedule structure with proper landmarks

## Testing Infrastructure

### Automated Testing
- **jest-axe**: Comprehensive accessibility testing with axe-core
- **@testing-library/jest-dom**: DOM testing utilities
- **eslint-plugin-jsx-a11y**: Development-time accessibility linting
- **Dedicated test files**: `**/Accessibility.test.tsx` for each major component

### Test Coverage
- All interactive components have accessibility tests
- ARIA attributes validation
- Keyboard navigation testing
- Screen reader announcement testing
- Modal focus management testing

### Current Test Status
- ✅ Most components pass axe-core validation
- ✅ Specific tests for `nested-interactive` rule with explicit validation
- ✅ Comprehensive keyboard navigation tests
- ✅ Screen reader announcement validation

## Outstanding Issues

### Priority 1 - Form Structure (RGAA 11)
**Issue**: Payment plan selection uses buttons with `role="radio"` instead of native form elements
**Impact**: Low - functionality works perfectly, semantics could be optimized
**Recommendation**: Consider migration to native radio inputs if styling requirements allow

### Priority 2 - Heading Structure Optimization (RGAA 9)
**Issue**: Mixed approach between visible and hidden headings
**Impact**: Low - structure is logical but could be more consistent
**Recommendation**: Consider standardizing heading approach across components

## Reduced Motion Implementation

The widget properly implements `prefers-reduced-motion` support in `src/hooks/useButtonAnimation.ts`:

```typescript
// Respect user's motion preferences with fallback for tests
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Disable animation if user prefers reduced motion or delay is -1
if (cappedTransitionDelay === -1 || prefersReducedMotion) {
  return
}
```

## Focus Management

react-modal automatically handles focus management including:
- Focus trap within the modal
- Focus restoration to the triggering element on close
- Keyboard navigation (Escape to close)
- Proper ARIA attributes (`role="dialog"`, `aria-modal="true"`)

No additional focus management implementation is needed as react-modal provides complete accessibility support.

## Development Guidelines

### Accessibility-First Approach
1. **Semantic HTML First**: Use proper HTML elements before adding ARIA
2. **Progressive Enhancement**: Ensure functionality without JavaScript
3. **Screen Reader Testing**: Test with actual assistive technologies
4. **Keyboard Navigation**: Ensure all functionality is keyboard accessible

### ARIA Guidelines
- Use ARIA to enhance, not replace, semantic HTML
- Provide meaningful labels and descriptions
- Implement proper state management with `aria-checked`, `aria-current`
- Use live regions sparingly and purposefully

### Testing Requirements
- All new components must include accessibility tests
- Manual keyboard navigation testing required
- Screen reader compatibility validation for complex interactions
- Axe-core tests must pass without rule exceptions

### Code Review Checklist
- [ ] Semantic HTML structure implemented
- [ ] ARIA attributes properly used
- [ ] Keyboard navigation functional
- [ ] Focus management appropriate
- [ ] Screen reader announcements tested
- [ ] Color contrast meets WCAG AA standards

## Maintenance and Monitoring

### Regular Audits
- Monthly automated accessibility testing
- Quarterly manual testing with assistive technologies
- Annual comprehensive RGAA compliance review

### Tooling Updates
- Keep jest-axe and testing libraries updated
- Monitor eslint-plugin-jsx-a11y for new rules
- Update accessibility documentation with changes

### Team Training
- Regular accessibility training for developers
- Screen reader usage training
- RGAA compliance guidelines review

---

**Last Updated**: September 2025  
**Compliance Level**: RGAA 2.1 AA (~90% compliant)  
**Next Review**: Quarterly
