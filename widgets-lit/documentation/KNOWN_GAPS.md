# Known Gaps

Features not yet implemented or only partially implemented.

---

## Status

- **Last Updated:** February 24, 2026
- **Core Features:** ✅ Complete
- **Known Gaps:** Accessibility (partial), Crowdin integration
- **Production Ready:** ✅ Yes

---

## Gap 1: Full WCAG 2.1 AA Accessibility

**Severity:** Medium  \
**Impact:** Compliance with web accessibility standards

**Current State:**
- ✅ Keyboard support (Tab/Shift+Tab/Enter/Escape)
- ✅ ARIA labels and roles
- ✅ Focus trap in modal
- ✅ Skip links (keyboard-only visibility)
- ✅ Live regions for loading + plan changes
- ⚠️ Arrow/Home/End navigation in PaymentPlans
- ⚠️ Animation instruction announcements
- ⚠️ Formal WCAG 2.1 AA audit

**To Complete:**
1. Add arrow/Home/End keyboard navigation in PaymentPlans
2. Add animation instruction announcements for screen readers
3. Run a full WCAG 2.1 AA audit (color contrast, focus visibility, touch targets)

**See:** [docs/ACCESSIBILITY.md](ACCESSIBILITY.md)

---

## Gap 2: Crowdin Integration

**Severity:** Low  \
**Impact:** Translation management workflow

**Current State:**
- ✅ All strings in `src/i18n/messages.ts`
- ✅ Locales supported (EN, FR, DE, ES, IT, PT, NL + regional variants)
- ❌ Crowdin integration
- ❌ Automated translation updates

**To Complete:**
1. Configure Crowdin project
2. Add a sync workflow (CI/CD)
3. Generate translation files from Crowdin

**Note:** Not required for the POC. Translations are currently managed manually in code.

---

## Nice-to-have Improvements

1. **Analytics hooks**
   - Track: widget renders, plan selections, modal opens
   - Priority: Low

2. **Error reporting**
   - Integrate Sentry or similar for production monitoring
   - Priority: Low

---

## Summary

The Lit widget is feature-complete for the POC. Remaining gaps are non-blocking and limited to accessibility refinements and translation workflow automation.

Priority order:
1. WCAG 2.1 AA audit + keyboard navigation in PaymentPlans
2. Animation instruction announcements
3. Crowdin integration
