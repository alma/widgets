# Accessibility Testing Guide

## Overview

This document provides comprehensive guidance for testing accessibility in the Alma Widgets project. It covers automated testing strategies, manual testing procedures, and compliance verification methods for the enhanced implementation with improved keyboard navigation and announcement systems.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Automated Testing](#automated-testing)
3. [Manual Testing](#manual-testing)
4. [Custom Hook Testing](#custom-hook-testing)
5. [Keyboard Navigation Testing](#keyboard-navigation-testing)
6. [Screen Reader Testing](#screen-reader-testing)
7. [RGAA Compliance Testing](#rgaa-compliance-testing)
8. [Testing Tools](#testing-tools)
9. [Continuous Integration](#continuous-integration)

## Testing Strategy

### Multi-layered Approach
- **Automated testing**: jest-axe integration for WCAG compliance + custom hook testing
- **Manual testing**: Enhanced keyboard navigation, screen reader testing
- **User testing**: Real users with disabilities
- **Compliance auditing**: RGAA 4.1 standards verification
- **Focus management testing**: Programmatic focus behavior verification

### Testing Pyramid
```
        Manual User Testing
       /                   \
    Manual Testing      Compliance Audits
   /                 |                    \
Custom Hook Tests | Enhanced Navigation Testing
   \               |                    /
    Automated Testing (jest-axe, axe-core)
```

## Automated Testing

### Jest-Axe Integration

#### Setup
```typescript
// setupTests.ts
import { toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)
```

#### PaymentPlans Widget Tests
```typescript
import { axe } from 'jest-axe'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PaymentPlansWidget from 'Widgets/PaymentPlans'

describe('PaymentPlans Accessibility Tests', () => {
  const defaultProps = {
    purchaseAmount: 100,
    apiData: { /* mock api config */ },
    eligibilityPlans: [
      { installments_count: 1, eligible: true },
      { installments_count: 3, eligible: true },
      { installments_count: 4, eligible: false }
    ]
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should not have accessibility violations', async () => {
    const { container } = render(<PaymentPlansWidget {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should implement proper radiogroup pattern', async () => {
    render(<PaymentPlansWidget {...defaultProps} />)
    
    const radiogroup = screen.getByRole('radiogroup')
    expect(radiogroup).toHaveAttribute('aria-label', 'Available payment options')
    
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons).toHaveLength(3)
    
    radioButtons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-checked')
      expect(button).toHaveAttribute('aria-describedby', 'payment-info-text')
      expect(button).toHaveAttribute('aria-label')
      
      // Check disabled state handling
      if (!defaultProps.eligibilityPlans[index].eligible) {
        expect(button).toHaveAttribute('aria-disabled', 'true')
        expect(button).toHaveAttribute('tabindex', '-1')
      } else {
        expect(button).toHaveAttribute('tabindex', '0')
      }
    })
  })

  it('should announce plan changes using useAnnounceText hook', async () => {
    render(<PaymentPlansWidget {...defaultProps} />)
    
    const liveRegion = screen.getByRole('alert')
    expect(liveRegion).toHaveAttribute('aria-live', 'assertive')
    
    // Simulate plan change and verify announcement
    const firstPlan = screen.getAllByRole('radio')[0]
    fireEvent.mouseEnter(firstPlan)
    
    await waitFor(() => {
      expect(liveRegion).toHaveTextContent('Selected plan: 1x')
    })
    
    // Verify announcement clears after delay
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(liveRegion).toHaveTextContent('')
    })
  })

  it('should handle keyboard navigation with focus management', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<PaymentPlansWidget {...defaultProps} />)
    
    const radioButtons = screen.getAllByRole('radio')
    const eligibleButtons = radioButtons.filter(button => 
      button.getAttribute('aria-disabled') !== 'true'
    )
    
    // Focus first eligible button
    eligibleButtons[0].focus()
    expect(document.activeElement).toBe(eligibleButtons[0])
    
    // Test arrow key navigation
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(eligibleButtons[1])
    
    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(eligibleButtons[0])
    
    // Test Home/End navigation
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(eligibleButtons[eligibleButtons.length - 1])
    
    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(eligibleButtons[0])
  })

  it('should skip non-eligible plans during keyboard navigation', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<PaymentPlansWidget {...defaultProps} />)
    
    const radioButtons = screen.getAllByRole('radio')
    const eligibleButtons = radioButtons.filter(button => 
      button.getAttribute('aria-disabled') !== 'true'
    )
    
    // Navigate through only eligible plans
    eligibleButtons[0].focus()
    await user.keyboard('{ArrowRight}')
    
    // Should skip disabled plan and go to next eligible
    expect(document.activeElement).toBe(eligibleButtons[1])
    expect(document.activeElement).not.toBe(radioButtons[2]) // Disabled plan
  })
})
```

#### EligibilityModal Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EligibilityPlansButtons from 'Widgets/EligibilityModal/components/EligibilityPlansButtons'

describe('EligibilityModal Accessibility Tests', () => {
  const defaultProps = {
    eligibilityPlans: [
      { installments_count: 1, eligible: true },
      { installments_count: 3, eligible: true },
      { installments_count: 4, eligible: true }
    ],
    currentPlanIndex: 0,
    setCurrentPlanIndex: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle keyboard navigation with automatic focus', async () => {
    const user = userEvent.setup()
    render(<EligibilityPlansButtons {...defaultProps} />)
    
    const buttons = screen.getAllByRole('button')
    
    // Focus first button
    buttons[0].focus()
    expect(document.activeElement).toBe(buttons[0])
    
    // Test navigation
    await user.keyboard('{ArrowRight}')
    expect(defaultProps.setCurrentPlanIndex).toHaveBeenCalledWith(1)
    
    await user.keyboard('{Home}')
    expect(defaultProps.setCurrentPlanIndex).toHaveBeenCalledWith(0)
    
    await user.keyboard('{End}')
    expect(defaultProps.setCurrentPlanIndex).toHaveBeenCalledWith(2)
  })

  it('should have proper ARIA attributes', () => {
    render(<EligibilityPlansButtons {...defaultProps} />)
    
    const group = screen.getByRole('group')
    expect(group).toHaveAttribute('aria-labelledby', 'payment-plans-title')
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-pressed')
      expect(button).toHaveAttribute('aria-describedby', 'payment-info')
      expect(button).toHaveAttribute('aria-label')
      
      if (index === defaultProps.currentPlanIndex) {
        expect(button).toHaveAttribute('aria-current', 'true')
      }
    })
  })
})
```

## Custom Hook Testing

### useAnnounceText Hook Tests
```typescript
import { renderHook, act } from '@testing-library/react'
import { useAnnounceText } from 'hooks/useAnnounceText'

describe('useAnnounceText Hook Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should initialize with empty announcement text', () => {
    const { result } = renderHook(() => useAnnounceText())
    expect(result.current.announceText).toBe('')
  })

  it('should announce text and clear after default delay', () => {
    const { result } = renderHook(() => useAnnounceText())
    
    act(() => {
      result.current.announce('Test announcement')
    })
    
    expect(result.current.announceText).toBe('Test announcement')
    
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    expect(result.current.announceText).toBe('')
  })

  it('should support custom delay timing', () => {
    const { result } = renderHook(() => useAnnounceText())
    
    act(() => {
      result.current.announce('Custom delay test', 2500)
    })
    
    expect(result.current.announceText).toBe('Custom delay test')
    
    // Should still be present before custom delay
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(result.current.announceText).toBe('Custom delay test')
    
    // Should be cleared after custom delay
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current.announceText).toBe('')
  })

  it('should handle multiple consecutive announcements', () => {
    const { result } = renderHook(() => useAnnounceText())
    
    act(() => {
      result.current.announce('First announcement')
    })
    expect(result.current.announceText).toBe('First announcement')
    
    act(() => {
      result.current.announce('Second announcement')
    })
    expect(result.current.announceText).toBe('Second announcement')
  })

  it('should clear announcement immediately when requested', () => {
    const { result } = renderHook(() => useAnnounceText())
    
    act(() => {
      result.current.announce('Test announcement')
    })
    expect(result.current.announceText).toBe('Test announcement')
    
    act(() => {
      result.current.clearAnnouncement()
    })
    expect(result.current.announceText).toBe('')
  })

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => useAnnounceText())
    
    const firstAnnounce = result.current.announce
    const firstClear = result.current.clearAnnouncement
    
    rerender()
    
    expect(result.current.announce).toBe(firstAnnounce)
    expect(result.current.clearAnnouncement).toBe(firstClear)
  })
})
```

## Manual Testing

### Keyboard Navigation Testing

#### PaymentPlans Widget Navigation
**Test Steps:**
1. **Tab Navigation**
   - [ ] Tab to widget button
   - [ ] Focus is clearly visible
   - [ ] Tab moves to next eligible plan button
   - [ ] Tab skips disabled/ineligible plans

2. **Arrow Key Navigation**
   - [ ] Arrow Left: Navigate to previous eligible plan
   - [ ] Arrow Right: Navigate to next eligible plan
   - [ ] Navigation stops at boundaries (no wrapping)
   - [ ] Focus follows selection visually
   - [ ] Only eligible plans receive focus

3. **Home/End Navigation**
   - [ ] Home: Jump to first eligible plan
   - [ ] End: Jump to last eligible plan
   - [ ] Focus moves correctly

4. **Enter/Space Activation**
   - [ ] Enter opens modal from main widget
   - [ ] Space opens modal from main widget
   - [ ] Modal focus is properly trapped

#### EligibilityModal Navigation
**Test Steps:**
1. **Plan Selection Navigation**
   - [ ] Arrow keys navigate between all plans
   - [ ] Home/End jump to first/last plan
   - [ ] Focus follows navigation automatically
   - [ ] Visual selection updates with keyboard

2. **Modal Controls**
   - [ ] ESC key closes modal
   - [ ] Focus returns to trigger element
   - [ ] Background scrolling is prevented

### Screen Reader Compatibility

#### NVDA Testing (Windows)
**Test Steps:**
1. **Plan Navigation**
   - [ ] Plans announced as "radio button"
   - [ ] Current selection state announced
   - [ ] Plan descriptions read correctly
   - [ ] Group role announced as "radiogroup"

2. **Live Announcements**
   - [ ] Plan changes announced automatically
   - [ ] Announcements don't overlap
   - [ ] Clear, contextual messaging

#### VoiceOver Testing (macOS)
**Test Steps:**
1. **Rotor Navigation**
   - [ ] Plans appear in Form Controls rotor
   - [ ] Landmarks properly identified
   - [ ] Headings navigate correctly

2. **Interaction**
   - [ ] VO + Space activates buttons
   - [ ] Arrow keys work with VO navigation
   - [ ] Status changes announced

#### JAWS Testing (Windows)
**Test Steps:**
1. **Virtual Cursor**
   - [ ] All content accessible with virtual cursor
   - [ ] Interactive elements properly identified
   - [ ] ARIA attributes read correctly

2. **Forms Mode**
   - [ ] Automatic forms mode activation
   - [ ] Proper navigation within radiogroup
   - [ ] Modal dialog announced correctly

## Keyboard Navigation Testing

### Enhanced Testing Checklist

#### Focus Management
- [ ] **Visible Focus**: All focusable elements have clear focus indicators
- [ ] **Focus Order**: Logical tab sequence through all interactive elements
- [ ] **Focus Trapping**: Modal properly traps focus within dialog
- [ ] **Focus Restoration**: Focus returns to trigger after modal closes
- [ ] **Programmatic Focus**: Arrow navigation moves both selection and focus

#### Navigation Patterns
- [ ] **Radiogroup Pattern**: Proper ARIA radiogroup implementation
- [ ] **Arrow Navigation**: Left/Right arrows navigate between options
- [ ] **Boundary Handling**: Navigation stops at first/last items
- [ ] **Disabled Items**: Keyboard navigation skips disabled options
- [ ] **Home/End Keys**: Quick navigation to first/last items

#### Advanced Interactions
- [ ] **Multiple Modalities**: Mouse, touch, and keyboard all work
- [ ] **State Synchronization**: Visual state matches programmatic state
- [ ] **Error Handling**: Graceful handling of edge cases
- [ ] **Performance**: Smooth navigation without delays

## Screen Reader Testing

### Comprehensive Screen Reader Testing

#### Content Structure
- [ ] **Headings**: Proper heading hierarchy and navigation
- [ ] **Landmarks**: Main, navigation, and dialog landmarks
- [ ] **Lists**: Payment options properly structured
- [ ] **Tables**: Any tabular data properly marked up

#### Interactive Elements
- [ ] **Buttons**: Purpose and state clearly communicated
- [ ] **Form Controls**: Labels, instructions, and validation
- [ ] **Links**: Descriptive link text and context
- [ ] **Custom Controls**: ARIA implementation working correctly

#### Dynamic Content
- [ ] **Live Regions**: Plan changes announced appropriately
- [ ] **State Changes**: Selection changes communicated
- [ ] **Error Messages**: Errors announced when they occur
- [ ] **Loading States**: Loading/busy states communicated

## RGAA Compliance Testing

### Critical RGAA Criteria

#### Criterion 7.3 - Focus Management
- [ ] **7.3.1**: Focus visible for all interactive elements
- [ ] **7.3.2**: Focus doesn't disappear during interactions
- [ ] **7.3.3**: Focus order is logical and predictable

#### Criterion 7.4 - Status Messages
- [ ] **7.4.1**: Status messages announced to assistive technologies
- [ ] **7.4.2**: Status changes communicated appropriately
- [ ] **7.4.3**: Live regions properly implemented

#### Criterion 12.8 - Tab Order
- [ ] **12.8.1**: Tab order follows visual order
- [ ] **12.8.2**: Tab order is logical within components
- [ ] **12.8.3**: Tab order handles dynamic content correctly

### RGAA Testing Tools

#### Automated Validation
```bash
# Install RGAA testing tools
npm install --save-dev @axe-core/react axe-core

# Run RGAA-specific tests
npm run test:a11y:rgaa
```

#### Manual Validation Checklist
- [ ] **Navigation**: All content accessible via keyboard
- [ ] **Information**: No information conveyed by color alone
- [ ] **Structure**: Proper heading and landmark structure
- [ ] **Forms**: All form elements properly labeled
- [ ] **Scripts**: All script functionality accessible

## Testing Tools

### Automated Testing Tools
- **jest-axe**: WCAG compliance testing in Jest
- **@testing-library/react**: Component testing with accessibility in mind
- **@testing-library/user-event**: Realistic user interaction simulation
- **axe-core**: Core accessibility testing engine

### Manual Testing Tools
- **NVDA**: Free Windows screen reader
- **VoiceOver**: Built-in macOS screen reader
- **JAWS**: Professional Windows screen reader
- **Dragon**: Voice recognition software testing
- **Keyboard only**: No mouse testing
- **High contrast mode**: Windows high contrast testing
- **Zoom testing**: 200% zoom level verification

### Browser Extensions
- **axe DevTools**: Browser extension for quick accessibility checks
- **Lighthouse**: Built-in Chrome accessibility auditing
- **WAVE**: Web accessibility evaluation tool
- **Color Contrast Analyser**: Color contrast verification

## Continuous Integration

### Automated Testing Pipeline
```yaml
# .github/workflows/accessibility.yml
name: Accessibility Testing
on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run accessibility tests
        run: npm run test:a11y
      
      - name: Run custom hook tests
        run: npm test -- --testPathPattern=useAnnounceText
      
      - name: Build and test
        run: npm run build
```

### Testing Scripts
```json
{
  "scripts": {
    "test:a11y": "jest --testNamePattern='Accessibility'",
    "test:hooks": "jest --testPathPattern='hooks/'",
    "test:keyboard": "jest --testNamePattern='keyboard'",
    "test:screen-reader": "jest --testNamePattern='screen reader'"
  }
}
```

### Quality Gates
- [ ] **Zero accessibility violations**: All axe-core tests pass
- [ ] **Keyboard navigation**: Manual keyboard testing completed
- [ ] **Screen reader testing**: At least one screen reader tested
- [ ] **RGAA compliance**: Critical criteria verified
- [ ] **Custom hook testing**: All accessibility hooks tested

---

**Last Updated**: August 2025  
**Version**: 3.1.1  
**Testing Framework**: Jest + React Testing Library  
**Accessibility Engine**: axe-core 4.x
