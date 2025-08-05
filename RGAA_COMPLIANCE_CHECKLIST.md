# RGAA Compliance Checklist for Alma Widgets

## Project Overview
- **Project**: @alma/widgets
- **Framework**: React/Preact
- **Target Compliance**: RGAA 4.1 (based on WCAG 2.1 AA)
- **Widget Types**: PaymentPlans widget and Modal widget

---

## 📊 Progress Overview

### 🔴 Critical Issues (0% Complete)
- [ ] **Keyboard Navigation** - Major issues across all components
- [ ] **ARIA Implementation** - Missing essential ARIA attributes
- [ ] **Color Contrast** - Potential contrast ratio violations
- [ ] **Screen Reader Support** - Insufficient semantic markup

### 🟡 Important Issues (25% Complete)
- [x] **Basic HTML Structure** - Semantic elements partially used
- [ ] **Focus Management** - Needs improvement in modals
- [ ] **Image Accessibility** - Missing alt texts and descriptions
- [ ] **Form Accessibility** - Limited form elements but needs attention

### 🟢 Minor Issues (75% Complete)
- [x] **Language Support** - Multi-language support implemented
- [x] **Responsive Design** - Mobile/desktop responsive
- [ ] **Motion Preferences** - Needs reduced motion support

---

## 📋 Detailed Issues by RGAA Criteria

### RGAA 1 - Images (Alternative Text)
**Status**: 🔴 0/4 Complete

#### Issues:
1. **SVG Icons Missing Descriptions** `src/assets/`
   - [ ] `Cross.tsx` - Close button icon has no accessible name
   - [ ] `almaLogo.tsx` - Logo missing title and description
   - [ ] Card logos (`amex.tsx`, `cb.tsx`, `mastercard.tsx`, `visa.tsx`) - No alt text

#### Required Changes:
```tsx
// Example fix for Cross.tsx
<svg aria-label="Fermer" role="img">
  <title>Fermer la modal</title>
  ...
</svg>

// Example fix for almaLogo.tsx
<svg aria-label="Alma" role="img">
  <title>Logo Alma</title>
  <desc>Logo du service de paiement Alma</desc>
  ...
</svg>
```

**Estimated Work**: 30-45 minutes

---

### RGAA 3 - Colors (Contrast and Information)
**Status**: 🔴 0/5 Complete

#### Issues:
1. **Color Contrast Verification Needed** `src/main.css`
   - [ ] `--dark-gray: #6C6C6C` - May not meet 4.5:1 ratio
   - [ ] `--light-gray: #F0F0F0` - Border colors need verification
   - [ ] Interactive states (hover, focus, active) need audit

2. **Color-Only Information**
   - [ ] Payment plan selection relies on color changes
   - [ ] Active/inactive states need non-color indicators

3. **Focus Indicators Removed** `src/Widgets/PaymentPlans/PaymentPlans.module.css` & `src/components/Modal/Modal.module.css`
   - [ ] `outline: none` removes default focus indicators
   - [ ] No custom focus indicators provided
   - [ ] Critical accessibility violation

#### Required Changes:
```css
/* Add proper contrast ratios */
:root {
  --dark-gray: #4A4A4A; /* Improved contrast */
  --light-gray: #DCDCDC; /* Better visibility */
}

/* CRITICAL: Add proper focus indicators */
.widgetButton:focus,
.widgetButton:focus-visible {
  outline: 3px solid var(--alma-blue);
  outline-offset: 2px;
}

.modal:focus {
  outline: 3px solid var(--alma-blue);
  outline-offset: 2px;
}

.closeButton:focus {
  outline: 3px solid var(--white);
  outline-offset: 2px;
}

/* Add visual indicators beyond color */
.plan.active::before {
  content: "✓";
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--white);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}
```

**Estimated Work**: 2-3 hours

---

### RGAA 6 - Links (Link Purpose)
**Status**: 🟡 1/2 Complete

#### Issues:
1. **Example Links Need Improvement** `examples/`
   - [x] Basic href structure exists
   - [ ] `#alma-open-modal-button` needs descriptive text
   - [ ] Click handlers need keyboard support

#### Required Changes:
```html
<!-- Improve link descriptions -->
<a href="#" id="alma-open-modal-button" aria-describedby="modal-description">
  Voir les options de paiement Alma
</a>
<span id="modal-description" class="sr-only">
  Ouvre une modal avec les plans de paiement disponibles
</span>
```

**Estimated Work**: 15-30 minutes

---

### RGAA 7 - Scripts (Assistive Technology Compatibility)
**Status**: 🔴 0/8 Complete

#### Issues:
1. **Modal Accessibility** `src/components/Modal/index.tsx`
   - [ ] Missing `role="dialog"`
   - [ ] Missing `aria-modal="true"`
   - [ ] Missing `aria-labelledby` for title
   - [ ] No focus trap implementation
   - [ ] Escape key handling exists but incomplete
   - [ ] Focus restoration after close missing

2. **Button Accessibility** `src/Widgets/PaymentPlans/index.tsx`
   - [ ] div with role="button" should be actual button
   - [ ] Missing aria-pressed for toggle states
   - [ ] Keyboard event handling incomplete (only Enter key, missing Space)
   - [ ] Close button missing accessible name

3. **Payment Plan Selection**
   - [ ] No keyboard navigation between plans (arrow keys)
   - [ ] Plan buttons in `EligibilityPlansButtons` missing aria-pressed
   - [ ] Missing aria-describedby for plan details

4. **Dynamic Content Updates**
   - [ ] No ARIA live regions for content changes
   - [ ] Plan selection changes not announced
   - [ ] Loading states not announced properly

5. **Semantic Structure Issues**
   - [ ] Title component should use proper heading elements
   - [ ] Info list should use semantic list markup
   - [ ] Schedule should use semantic list structure

#### Required Changes:
```tsx
// Modal improvements
<Modal
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>

// Button improvements (Convert div to button)
<button
  type="button"
  aria-pressed={isActive}
  aria-describedby="plan-description"
  onClick={handleOpenModal}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenModal(e);
    }
  }}
>

// Close button with accessible name
<button
  type="button"
  onClick={onClose}
  aria-label="Fermer la modal"
  className={cx(s.closeButton, STATIC_CUSTOMISATION_CLASSES.closeButton)}
>
  <CrossIcon aria-hidden="true" />
</button>

// Plan selection buttons with proper ARIA
<button
  type="button"
  aria-pressed={key === currentPlanIndex}
  aria-describedby={`plan-${key}-description`}
  onClick={() => setCurrentPlanIndex(key)}
  onKeyDown={(e) => {
    // Arrow key navigation
    if (e.key === 'ArrowLeft' && key > 0) {
      setCurrentPlanIndex(key - 1);
    } else if (e.key === 'ArrowRight' && key < eligibilityPlans.length - 1) {
      setCurrentPlanIndex(key + 1);
    }
  }}
>

// Live regions for updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {announceText}
</div>

// Proper title structure
<h1 id="modal-title" className={s.title}>
  {/* Title content */}
</h1>

// Semantic list for info
<ol className={s.list} role="list">
  <li role="listitem" className={s.listItem}>
    <span className={s.bullet} aria-hidden="true">1</span>
    <span>...</span>
  </li>
</ol>
```

**Estimated Work**: 6-8 hours

---

### RGAA 8 - Mandatory Elements (Structure)
**Status**: 🟡 2/4 Complete

#### Issues:
1. **Language Declaration** - Good ✅
   - [x] Multi-language support implemented
   - [x] Proper locale handling

2. **Semantic Structure**
   - [ ] Modal content needs proper heading hierarchy
   - [ ] Payment plans need semantic list structure
   - [ ] Missing main landmark in modal
   - [ ] Title component using div instead of h1

3. **Document Structure**
   - [ ] Missing proper sectioning elements
   - [ ] No navigation landmarks for modal sections

#### Required Changes:
```tsx
// Add semantic structure to modal
<div role="dialog" aria-modal="true">
  <header role="banner">
    <button aria-label="Fermer">×</button>
  </header>
  <main role="main">
    <h1 id="modal-title">Options de paiement Alma</h1>
    <section aria-labelledby="plans-heading">
      <h2 id="plans-heading">Plans disponibles</h2>
      <ul role="list">
        {plans.map(plan => (
          <li role="listitem">...</li>
        ))}
      </ul>
    </section>
  </main>
</div>

// Fix Title component to use proper heading
const Title = () => (
  <h1 className={s.title} id="modal-title">
    {/* Title content */}
  </h1>
)
```

**Estimated Work**: 2-3 hours

---

### RGAA 9 - Information Structure (Headings, Lists)
**Status**: 🔴 1/6 Complete

#### Issues:
1. **Heading Hierarchy** `src/Widgets/EligibilityModal/components/Title/`
   - [ ] Title component uses div instead of h1
   - [ ] Missing h1 for modal content
   - [ ] No heading hierarchy for modal sections
   - [ ] Desktop vs Mobile modals have inconsistent structure

2. **List Structure**
   - [ ] Payment plans in main widget are not marked up as lists
   - [ ] Info bullets should be a proper ordered list
   - [ ] Schedule items need list markup
   - [ ] Plan selection buttons need list structure

3. **Card Logos Structure** `src/Widgets/EligibilityModal/components/Cards/`
   - [ ] Card images should be in a semantic list
   - [ ] Missing proper labeling for card types

4. **Missing Screen Reader Content**
   - [ ] No sr-only class for screen reader only content
   - [ ] Missing descriptions for complex interactions

#### Required Changes:
```tsx
// Proper heading structure
<h1 className={s.title} id="modal-title">
  {/* Modal title */}
</h1>

// List structure for main widget plans
<div className={s.paymentPlans}>
  <span className="sr-only">Plans de paiement disponibles:</span>
  <ul role="list" className={s.plansList}>
    {eligibilityPlans.map((plan, index) => (
      <li key={index} role="listitem" className={s.plan}>
        {paymentPlanShorthandName(plan)}
      </li>
    ))}
  </ul>
</div>

// List structure for modal plan buttons
<div className={s.buttons}>
  <span className="sr-only">Sélectionner un plan de paiement:</span>
  <ul role="list">
    {eligibilityPlans.map((plan, key) => (
      <li key={plan.id} role="listitem">
        <button type="button">...</button>
      </li>
    ))}
  </ul>
</div>

// Info list structure (proper ordered list)
<ol className={s.list} role="list">
  <li role="listitem" className={s.listItem}>
    <span className={s.bullet} aria-hidden="true">1</span>
    <span>...</span>
  </li>
</ol>

// Schedule as ordered list
<ol className={s.schedule} role="list">
  {(currentPlan?.payment_plan || []).map((installment, index) => (
    <li key={installment.due_date * 1000} role="listitem">
      <Installment installment={installment} index={index} />
    </li>
  ))}
</ol>

// Cards list structure
<div className={s.cardContainer}>
  <span className="sr-only">Cartes acceptées:</span>
  <ul role="list">
    {uniqueCards.map((card) => (
      <li key={card} role="listitem">
        <div className={s.card} aria-label={`Carte ${card}`}>
          {/* Card icons */}
        </div>
      </li>
    ))}
  </ul>
</div>

// Add screen reader only class
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Estimated Work**: 3-4 hours

---

### RGAA 11 - Forms (Labels and Error Handling)
**Status**: 🟢 N/A - No Form Elements

The widget doesn't contain form elements, so this criterion is not applicable.

---

### RGAA 12 - Navigation (Landmarks and Focus)
**Status**: 🔴 0/6 Complete

#### Issues:
1. **Missing Landmarks**
   - [ ] Modal needs `role="main"` for content area
   - [ ] No navigation landmarks
   - [ ] Missing complementary regions
   - [ ] Desktop modal sidebar should be `aside` with proper role

2. **Focus Management**
   - [ ] Modal doesn't trap focus properly
   - [ ] No focus restoration after modal close
   - [ ] Focus indicators removed with `outline: none`
   - [ ] Tab order not logical in payment plan selection

3. **Keyboard Navigation**
   - [ ] No arrow key navigation for plan selection
   - [ ] Missing Space key support (only Enter implemented)
   - [ ] Tab navigation through modal elements incomplete
   - [ ] Escape key to close modal (partially implemented)

4. **Focus Trap Issues**
   - [ ] No focus trap implementation in modal
   - [ ] Focus can escape to background content
   - [ ] First focusable element not focused on modal open

5. **Interactive Element Issues**
   - [ ] Plan hover states only work with mouse
   - [ ] No keyboard equivalent for onTouchStart/onMouseEnter events
   - [ ] Payment plan buttons missing keyboard navigation

6. **Modal Navigation Structure**
   - [ ] Missing skip links for modal content
   - [ ] No way to navigate directly to payment plans or info sections

#### Required Changes:
```tsx
// Focus trap implementation
const FocusTrap = ({ children }) => {
  const trapRef = useRef();

  useEffect(() => {
    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, []);

  return <div ref={trapRef}>{children}</div>;
};

// Landmark implementation
<div role="dialog" aria-modal="true">
  <header role="banner">
    <button aria-label="Fermer">×</button>
  </header>
  <main role="main">
    {/* Main content */}
  </main>
</div>

// Keyboard navigation for plans
const handlePlanNavigation = (e, currentIndex, totalPlans) => {
  if (e.key === 'ArrowLeft' && currentIndex > 0) {
    setCurrentPlanIndex(currentIndex - 1);
  } else if (e.key === 'ArrowRight' && currentIndex < totalPlans - 1) {
    setCurrentPlanIndex(currentIndex + 1);
  } else if (e.key === 'Home') {
    setCurrentPlanIndex(0);
  } else if (e.key === 'End') {
    setCurrentPlanIndex(totalPlans - 1);
  }
};

// Remove outline: none and add proper focus styles
.widgetButton:focus,
.widgetButton:focus-visible {
  outline: 3px solid var(--alma-blue);
  outline-offset: 2px;
}
```

**Estimated Work**: 4-6 hours

---

### RGAA 13 - Consultation (Time Limits, Motion)
**Status**: 🟡 1/3 Complete

#### Issues:
1. **Motion Preferences**
   - [ ] No `prefers-reduced-motion` support
   - [ ] Animations/transitions should be optional
   - [ ] Loading animations need alternatives

2. **Auto-Updates**
   - [x] No auto-refresh content ✅
   - [x] User controls interactions ✅

#### Required Changes:
```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .transition,
  .animation {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Estimated Work**: 30 minutes

---

## ⚠️ CRITICAL ISSUES DISCOVERED

### Missing Screen Reader Only Utility Class
**Priority**: CRITICAL

The codebase lacks a `.sr-only` utility class that's essential for accessibility. This class allows content to be available to screen readers while being visually hidden.

```css
/* Add to main.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Interactive Elements Using Divs Instead of Buttons
**Priority**: CRITICAL

Multiple interactive elements use `<div>` with `role="button"` instead of semantic `<button>` elements:
- Main payment plan widget trigger
- Payment plan selection in modal
- These cause screen reader and keyboard navigation issues

### Focus Indicators Completely Removed
**Priority**: CRITICAL

Critical accessibility violation found in:
- `src/Widgets/PaymentPlans/PaymentPlans.module.css` line 15: `outline: none;`
- `src/components/Modal/Modal.module.css` line 12: `outline: none;`

This makes the interface unusable for keyboard users.

### Missing Focus Trap in Modal
**Priority**: CRITICAL

The modal lacks proper focus management:
- Focus can escape to background content
- No focus restoration when modal closes
- Tab navigation doesn't wrap within modal

**Estimated Work for Critical Issues**: 3-4 hours

---

## 🛠️ Implementation Plan

### Phase 1: Critical Fixes (High Priority)
**Estimated Time**: 12-16 hours

1. **URGENT: Restore Focus Indicators** (1-2 hours)
   - Remove all `outline: none` declarations
   - Add proper focus styles for all interactive elements
   - Add high-contrast focus indicators

2. **Convert Divs to Semantic Buttons** (2-3 hours)
   - Replace div role="button" with actual button elements
   - Fix keyboard event handling
   - Add proper ARIA attributes

3. **Implement Focus Trap in Modal** (3-4 hours)
   - Add focus trap functionality
   - Implement focus restoration
   - Fix tab order within modal

4. **ARIA Implementation** (3-4 hours)
   - Add role="dialog" and aria-modal to modals
   - Implement proper ARIA labels and descriptions
   - Add live regions for dynamic content

5. **Screen Reader Support** (2-3 hours)
   - Add .sr-only utility class
   - Add screen reader only content where needed
   - Fix semantic markup issues

### Phase 2: Important Improvements (Medium Priority)
**Estimated Time**: 6-8 hours

1. **Color Contrast Fixes** (2-3 hours)
   - Audit and fix color contrast ratios
   - Add visual indicators beyond color
   - Test with color blindness simulators

2. **Semantic Structure** (3-4 hours)
   - Convert payment plans to proper list markup
   - Add proper heading hierarchy
   - Implement landmark roles
   - Fix Title component to use h1

3. **Keyboard Navigation Enhancement** (1-2 hours)
   - Add arrow key navigation for plan selection
   - Implement Home/End key support
   - Add keyboard equivalents for mouse interactions

### Phase 3: Polish & Testing (Low Priority)
**Estimated Time**: 3-4 hours

1. **Image Accessibility** (30-45 minutes)
   - Add alt text and descriptions to all SVGs
   - Implement proper image labeling

2. **Motion Preferences** (30 minutes)
   - Implement reduced motion support
   - Add animation controls

3. **Testing & Validation** (2-3 hours)
   - Manual keyboard testing
   - Screen reader testing
   - Automated accessibility testing setup
   - Cross-browser accessibility testing

---

## 📚 Resources for Implementation

### Development Tools
- **axe DevTools** - Browser extension for testing
- **NVDA/VoiceOver** - Screen reader testing
- **WAVE** - Web accessibility evaluation

### ARIA Patterns Reference
- [W3C ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/)
- [Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

### RGAA Resources
- [RGAA 4.1 Official](https://www.numerique.gouv.fr/publications/rgaa-accessibilite/)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🎯 Success Criteria

### Completion Metrics
- [ ] **100% keyboard navigable** - All features work without mouse
- [ ] **Screen reader compatible** - All content accessible via screen reader
- [ ] **WCAG AA compliant** - Meets minimum contrast and accessibility standards
- [ ] **Focus management** - Proper focus trapping and restoration
- [ ] **Semantic markup** - Proper HTML structure and ARIA implementation

### Testing Checklist
- [ ] Tab through entire widget with keyboard only
- [ ] Test with screen reader (NVDA, VoiceOver, or JAWS)
- [ ] Verify color contrast with tools
- [ ] Check focus indicators are visible
- [ ] Validate ARIA attributes with axe DevTools
- [ ] Test reduced motion preferences
- [ ] Verify proper announcement of dynamic content changes

**Total Estimated Work**: 21-28 hours across all phases

### Priority Order for Implementation:
1. **CRITICAL FIRST**: Focus indicators and keyboard accessibility (Phase 1: items 1-3)
2. **Semantic fixes**: Button elements and ARIA (Phase 1: items 4-5)
3. **Structure improvements**: Lists, headings, landmarks (Phase 2)
4. **Testing and validation**: Comprehensive accessibility testing (Phase 3)
