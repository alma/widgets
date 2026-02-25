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

1. **PaymentPlans arrow key navigation (Home/End)**
   - Would improve keyboard-only navigation experience
   - Priority: Low
   - Effort: 2-3 hours

2. **Animation instruction announcements**
   - Screen reader users should hear animation state changes
   - Priority: Low
   - Effort: 1-2 hours

3. **Analytics & Event Hooks**
   - Emit custom events for: plan selection, modal open/close, API calls
   - Allows merchants to track widget interactions
   - Priority: Low
   - Effort: 4-6 hours

4. **Error reporting integration**
   - Optional Sentry or similar integration for production monitoring
   - Priority: Very Low
   - Effort: 2-3 hours

---

## Summary

The Lit widget is **feature-complete for the POC stage**. All critical features are implemented:

✅ **Implemented:**
- PaymentPlans widget with all display/interaction options
- Modal widget with responsive layouts (desktop modal, mobile drawer, panels)
- Schedule widget (new in Lit, not in Preact)
- Full API compatibility with Preact widget
- Session cache + in-flight deduplication
- 7+ language locales
- 7 color scheme variants
- CSS isolation via Shadow DOM

⚠️ **Partial (but functional):**
- WCAG 2.1 AA (partial keyboard navigation, good focus management)
- Screen reader support (good ARIA labels, some announcements missing)

❌ **Not yet implemented:**
- Crowdin integration (planned for future when scaling i18n)
- Home/End keyboard navigation in PaymentPlans
- Animation instruction screen reader announcements

**Recommendation:** Deploy as POC/beta. These gaps don't block merchant integration. Plan Crowdin + a11y refinements for v2.0 release.
