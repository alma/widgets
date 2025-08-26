# Accessibility Testing Guide

## Overview

This document provides comprehensive guidance for testing accessibility in the Alma Widgets project. It covers automated testing strategies, manual testing procedures, and compliance verification methods.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Automated Testing](#automated-testing)
3. [Manual Testing](#manual-testing)
4. [RGAA Compliance Testing](#rgaa-compliance-testing)
5. [Testing Tools](#testing-tools)
6. [Continuous Integration](#continuous-integration)

## Testing Strategy

### Multi-layered Approach
- **Automated testing**: jest-axe integration for WCAG compliance
- **Manual testing**: Keyboard navigation, screen reader testing
- **User testing**: Real users with disabilities
- **Compliance auditing**: RGAA 4.1 standards verification

### Testing Pyramid
```
        Manual User Testing
       /                   \
    Manual Testing      Compliance Audits
   /                                      \
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

#### Basic Accessibility Test
```typescript
import { axe } from 'jest-axe'
import { render } from '@testing-library/react'

test('should not have accessibility violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

#### Component-Specific Tests

##### Modal Accessibility Tests
```typescript
// src/components/Modal/__tests__/Accessibility.test.tsx
describe('Modal Accessibility Tests', () => {
  it('should not have accessibility violations when closed', async () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal content</div>
      </Modal>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper aria attributes when open', async () => {
    render(
      <Modal isOpen onClose={() => {}}>
        <div>
          <h2>Modal Title</h2>
          <p>Some modal content</p>
        </div>
      </Modal>
    )
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})
```

##### Payment Plans Accessibility Tests
```typescript
// src/Widgets/PaymentPlans/__tests__/Accessibility.test.tsx
describe('PaymentPlan Accessibility Tests', () => {
  it('should have proper keyboard navigation', async () => {
    render(<PaymentPlanWidget {...defaultProps} />)
    
    const widget = await screen.findByTestId('widget-button')
    expect(widget).toHaveAttribute('tabindex', '0')
    expect(widget).toHaveAttribute('role', 'button')
    
    // Test keyboard interaction
    fireEvent.keyDown(widget, { key: 'Enter' })
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('should have proper radiogroup implementation', async () => {
    render(<PaymentPlanWidget {...defaultProps} />)
    
    const radiogroup = screen.getByRole('radiogroup')
    expect(radiogroup).toHaveAttribute('aria-label')
    
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons).toHaveLength(3)
    
    radioButtons.forEach((button) => {
      expect(button).toHaveAttribute('aria-checked')
      expect(button).toHaveAttribute('aria-describedby')
    })
  })
})
```

### Custom Accessibility Matchers

#### Screen Reader Compatibility
```typescript
// Custom matcher for screen reader content
expect.extend({
  toBeAccessibleToScreenReaders(received) {
    const hasAriaLabel = received.hasAttribute('aria-label')
    const hasAriaLabelledBy = received.hasAttribute('aria-labelledby')
    const hasTextContent = received.textContent.trim().length > 0
    
    const pass = hasAriaLabel || hasAriaLabelledBy || hasTextContent
    
    return {
      message: () => `Expected element to be accessible to screen readers`,
      pass,
    }
  },
})
```

#### Keyboard Navigation Testing
```typescript
// Helper function for keyboard navigation testing
const testKeyboardNavigation = async (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  for (let i = 0; i < focusableElements.length; i++) {
    const element = focusableElements[i] as HTMLElement
    element.focus()
    expect(document.activeElement).toBe(element)
  }
}
```

## Manual Testing

### Keyboard Navigation Checklist

#### Basic Navigation
- [ ] **Tab key**: Moves focus forward through interactive elements
- [ ] **Shift+Tab**: Moves focus backward through interactive elements
- [ ] **Enter/Space**: Activates buttons and links
- [ ] **Escape**: Closes modals and overlays
- [ ] **Arrow keys**: Navigate within grouped elements (radio buttons)

#### Focus Management
- [ ] **Visible focus indicators**: All focused elements have clear visual indication
- [ ] **Logical tab order**: Focus moves in a predictable sequence
- [ ] **No focus traps**: Users can always navigate away (except in modals)
- [ ] **Focus restoration**: Focus returns to trigger element when closing modals

#### Modal Behavior
- [ ] **Focus trapping**: Focus stays within modal when open
- [ ] **Initial focus**: First interactive element receives focus on open
- [ ] **Close mechanisms**: Can be closed via Escape key or close button
- [ ] **Background interaction**: Background content is inert when modal is open

### Screen Reader Testing

#### NVDA (Windows)
```
1. Open NVDA screen reader
2. Navigate to the widget
3. Verify announcements:
   - Component purpose is clear
   - Current state is announced
   - Instructions are provided
   - Changes are announced
```

#### VoiceOver (macOS)
```
1. Enable VoiceOver (Cmd+F5)
2. Use VO+Arrow keys to navigate
3. Verify:
   - Landmark navigation works
   - Headings are properly announced
   - Form controls have labels
   - Lists are properly structured
```

#### JAWS (Windows)
```
1. Start JAWS screen reader
2. Use virtual cursor mode
3. Test:
   - Page structure navigation
   - Form mode functionality
   - Quick navigation keys
   - Application mode for widgets
```

### Browser Testing

#### Chrome DevTools Accessibility
```
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Run Accessibility audit
4. Check Accessibility tree in Elements panel
5. Verify color contrast in Styles panel
```

#### Firefox Accessibility Inspector
```
1. Open Developer Tools (F12)
2. Enable Accessibility tab
3. Check accessibility tree
4. Verify keyboard navigation
5. Test with screen reader simulation
```

## RGAA Compliance Testing

### Criteria Verification

#### 1.1 - Images (Alternative Text)
```typescript
test('images have proper alternative text', () => {
  render(<Component />)
  
  // Informative images should have alt text
  const informativeImages = screen.getAllByRole('img')
  informativeImages.forEach(img => {
    expect(img).toHaveAttribute('alt')
    expect(img.getAttribute('alt')).not.toBe('')
  })
  
  // Decorative images should be hidden from screen readers
  const decorativeImages = container.querySelectorAll('[aria-hidden="true"]')
  decorativeImages.forEach(img => {
    expect(img).toHaveAttribute('aria-hidden', 'true')
  })
})
```

#### 1.3 - Information and Relationships
```typescript
test('semantic structure is maintained', () => {
  render(<Component />)
  
  // Lists should use proper markup
  const lists = screen.getAllByRole('list')
  lists.forEach(list => {
    const listItems = within(list).getAllByRole('listitem')
    expect(listItems.length).toBeGreaterThan(0)
  })
  
  // Form controls should be properly labeled
  const formControls = screen.getAllByRole('button')
  formControls.forEach(control => {
    expect(control).toBeAccessibleToScreenReaders()
  })
})
```

#### 2.1 - Keyboard Accessible
```typescript
test('all functionality is keyboard accessible', async () => {
  render(<Component />)
  
  const interactiveElements = screen.getAllByRole('button')
  
  for (const element of interactiveElements) {
    // Should be focusable
    element.focus()
    expect(document.activeElement).toBe(element)
    
    // Should respond to keyboard activation
    fireEvent.keyDown(element, { key: 'Enter' })
    // Verify expected behavior occurs
  }
})
```

#### 4.1 - Compatible (Robust)
```typescript
test('markup is valid and accessible', async () => {
  const { container } = render(<Component />)
  
  // No duplicate IDs
  const elementsWithIds = container.querySelectorAll('[id]')
  const ids = Array.from(elementsWithIds).map(el => el.id)
  const uniqueIds = [...new Set(ids)]
  expect(ids).toEqual(uniqueIds)
  
  // ARIA attributes are valid
  const results = await axe(container, {
    rules: {
      'aria-valid-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
    },
  })
  expect(results).toHaveNoViolations()
})
```

## Testing Tools

### Development Tools

#### Browser Extensions
- **axe DevTools**: Real-time accessibility scanning
- **WAVE**: Web accessibility evaluation
- **Lighthouse**: Automated accessibility auditing
- **Color Contrast Analyzer**: Contrast ratio verification

#### Desktop Applications
- **NVDA**: Free Windows screen reader
- **JAWS**: Commercial Windows screen reader
- **VoiceOver**: Built-in macOS screen reader
- **Colour Contrast Analyser**: Standalone contrast checking

### CI/CD Integration

#### GitHub Actions Workflow
```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:accessibility
      - run: npm run lint:accessibility
```

#### Custom npm Scripts
```json
{
  "scripts": {
    "test:accessibility": "jest --testPathPattern=Accessibility",
    "test:a11y": "npm run test:accessibility",
    "lint:accessibility": "eslint --ext .tsx,.ts src/ --rule 'jsx-a11y/*: error'"
  }
}
```

### Automated Reporting

#### Accessibility Dashboard
```typescript
// Generate accessibility report
const generateA11yReport = async () => {
  const components = ['Modal', 'PaymentPlans', 'SkipLinks']
  const results = {}
  
  for (const component of components) {
    const { container } = render(createElement(component))
    const axeResults = await axe(container)
    results[component] = {
      violations: axeResults.violations,
      passes: axeResults.passes.length,
      timestamp: new Date().toISOString(),
    }
  }
  
  return results
}
```

## Continuous Integration

### Pre-commit Hooks
```javascript
// .husky/pre-commit
#!/bin/sh
npx lint-staged

# Run accessibility tests
npm run test:accessibility
```

### Pull Request Checks
```yaml
# Required status checks
- Accessibility Tests (jest-axe)
- ESLint A11y Rules
- Manual Testing Checklist
```

### Performance Monitoring
```typescript
// Monitor accessibility performance
const a11yMetrics = {
  axeRuntime: measureTime(() => axe(container)),
  violationCount: results.violations.length,
  passCount: results.passes.length,
}
```

## Best Practices

### Test Organization
```
__tests__/
├── Accessibility.test.tsx    # Automated a11y tests
├── Keyboard.test.tsx        # Keyboard navigation tests
├── ScreenReader.test.tsx    # Screen reader compatibility
└── RGAA.test.tsx           # RGAA compliance tests
```

### Test Documentation
```typescript
/**
 * Tests keyboard navigation for payment plan selection
 * RGAA Criteria: 2.1.1 - Keyboard accessible
 * WCAG Criteria: 2.1.1 - Keyboard (Level A)
 */
test('payment plans are keyboard navigable', () => {
  // Test implementation
})
```

### Regression Prevention
```typescript
// Accessibility regression tests
describe('Accessibility Regression Tests', () => {
  test('no new violations introduced', async () => {
    const { container } = render(<Component />)
    const results = await axe(container)
    
    // Compare against baseline
    expect(results.violations).toHaveLength(0)
  })
})
```

## Conclusion

This comprehensive testing strategy ensures that accessibility is maintained throughout the development lifecycle. Regular automated testing catches issues early, while manual testing provides real-world validation of the user experience for people with disabilities.

The combination of automated tools, manual procedures, and compliance verification creates a robust foundation for delivering accessible web experiences that meet international standards and French RGAA requirements.
