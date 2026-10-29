# File map: master React files to Lit files

Sections by master folder: root · `assets` · `components/Installments/*` · `components/Loader`, `LoadingIndicator`, `Modal`, `SkipLinks`, `WarningMessage` · `hooks` · `intl` · `stories` · `test` · `utils` · `Widgets/EligibilityModal` and its folders · `Widgets/PaymentPlans`

For each file under `src/` at the reference commit (`scripts/ref-sha.txt`), the Lit file(s) it becomes and the Lit test file(s) that hold its ported tests. The Crowdin catalogues in `src/intl/messages/` don't change and aren't listed.

- `—` means no Lit counterpart. The note says why.
- `(?)` means no destination is set yet. The path follows `.claude/rules/architecture.md`. Ask the developer before you create it.
- Every `*.template.ts` has a `*.stories.ts` next to it with the same base name, so the tables don't list template stories. Element stories are listed.
- A row for a master test file gives, in "Lit file(s)", the Lit test file that its cases move to.
- `*Messages` names an export of a `.messages.ts` file that already holds the component's descriptors.
- CSS modules moved unchanged. Their Lit path is where the file already is.

## Root files (`src/`)

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `src/index.ts` | `src/index.ts` (same path) | — (contract tests) |
| `src/widgets_controller.tsx` | `src/public-api/widgets.ts`, `src/public-api/modal-handle.ts` | `src/public-api/widgets.test.ts` |
| `src/types.ts` | split: `src/public-api/public-api.types.ts` (options, `ApiConfig`, `WidgetNames`, `WidgetOptions`), `src/public-api/public-api.const.ts` (`widgetTypes` renamed `WidgetTypes`), `src/domain/plans/plans.types.ts` (`ConfigPlan`, `EligibilityPlanToDisplay`), `src/domain/plans/api/eligibility.types.ts` (API response types), `src/domain/plans/api/eligibility.const.ts` (`statusResponse`), `src/shared/i18n/i18n.const.ts` (`Locale`), `src/shared/ui/icons/cards/cards.types.ts` (`Card`) | — |
| `src/consts.ts` | `src/shared/config/api-url.const.ts` (URLs), `src/public-api/public-api.const.ts` (`ApiMode`, now an object) | — |
| `src/main.css` | `src/styles/main.css` | — |
| `src/declarations.d.ts` | `src/env.d.ts` (CSS module declaration) | — |
| `src/vite-env.d.ts` | `src/env.d.ts` (Vite client types). `BUILD_VERSION` is read in `src/shared/config/build-version.const.ts` | — |
| `src/global.d.ts` | — (`*.svg` declaration, no SVG import left) | — |
| `src/setupTests.ts` | `src/test/setup.ts`, `src/test/setup-jsdom.ts` (jsdom-only mocks), `src/test/vitest.d.ts` | `src/test/setup.test.ts` |

## `src/assets/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `src/assets/almaLogo.tsx` | `src/shared/ui/icons/alma-logo.template.ts` | `src/shared/ui/icons/icons.test.ts` |
| `src/assets/Cross.tsx` | `src/shared/ui/icons/cross.template.ts` | `src/shared/ui/icons/icons.test.ts` |
| `src/assets/cards/amex.tsx` | `src/shared/ui/icons/cards/amex.template.ts`, `src/shared/ui/icons/svg-id.ts` (gradient ID), `cardMessages` in `src/shared/ui/icons/cards/cards.messages.ts` | `src/shared/ui/icons/icons.test.ts` |
| `src/assets/cards/cb.tsx` | `src/shared/ui/icons/cards/cb.template.ts`, `src/shared/ui/icons/svg-id.ts`, `cardMessages` | `src/shared/ui/icons/icons.test.ts` |
| `src/assets/cards/mastercard.tsx` | `src/shared/ui/icons/cards/mastercard.template.ts` (drops the nine unused IDs), `cardMessages` | `src/shared/ui/icons/icons.test.ts` |
| `src/assets/cards/visa.tsx` | `src/shared/ui/icons/cards/visa.template.ts`, `cardMessages` | `src/shared/ui/icons/icons.test.ts` |
| `src/assets/__tests__/Accessibility.test.tsx` | `src/shared/ui/icons/icons.test.ts` | — |
| `src/assets/alma.svg` | — (moved to `examples/alma.svg`, used only by the example pages) | — |
| `src/assets/close.svg` | — (unused on master) | — |

## `src/components/Installments/Installment/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `index.tsx` | `src/widgets/eligibility-modal/templates/schedule/installment.template.ts`, `installmentMessages` in `src/widgets/eligibility-modal/eligibility-modal.messages.ts` | `src/widgets/eligibility-modal/templates/schedule/installment.template.test.ts` |
| `Installment.module.css` | `src/widgets/eligibility-modal/templates/schedule/installment.module.css` | — |
| `__tests__/Accessibility.test.tsx` | `src/widgets/eligibility-modal/templates/schedule/installment.template.test.ts` | — |

## `src/components/Installments/LegalMentions/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `index.tsx` | `src/widgets/eligibility-modal/templates/schedule/legal-mentions.template.ts`, `legalMentionsMessages` (deferred labels from `planStringsMessages` in `src/widgets/common/plan.messages.ts`) | `src/widgets/eligibility-modal/templates/schedule/legal-mentions.template.test.ts` |
| `LegalMentions.module.css` | `src/widgets/eligibility-modal/templates/schedule/legal-mentions.module.css` | — |
| `__tests__/LegalMentions.test.tsx` | `src/widgets/eligibility-modal/templates/schedule/legal-mentions.template.test.ts` | — |

## `src/components/Installments/TotalBlock/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `index.tsx` | `src/widgets/eligibility-modal/templates/schedule/total-block.template.ts`, `totalBlockMessages` | `src/widgets/eligibility-modal/__tests__/Plans.test.ts`, `src/widgets/eligibility-modal/__tests__/Schedule.test.ts` (no test file of its own) (?) |
| `TotalBlock.module.css` | `src/widgets/eligibility-modal/templates/schedule/total-block.module.css` | — |

## `src/components/Loader/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `index.tsx` | `src/widgets/payment-plans/templates/loader.template.ts` | `src/widgets/payment-plans/templates/loader.template.test.ts` |
| `Loader.module.css` | `src/widgets/payment-plans/templates/loader.module.css` | — |
| `__tests__/Accessibility.test.tsx` | `src/widgets/payment-plans/templates/loader.template.test.ts` | — |

## `src/components/LoadingIndicator/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `LoadingIndicator.tsx` | `src/widgets/eligibility-modal/templates/loading-indicator.template.ts` | `src/widgets/eligibility-modal/templates/loading-indicator.template.test.ts` (new, master has none) |
| `LoadingIndicator.module.css` | `src/widgets/eligibility-modal/templates/loading-indicator.module.css` | — |

## `src/components/Modal/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `index.tsx` | `src/widgets/eligibility-modal/controllers/modal-portal.controller.ts` (react-modal portal, body class, sentinels, scroll lock), `src/widgets/eligibility-modal/controllers/focus-trap.ts` (Tab trap, Escape, overlay click), `src/widgets/eligibility-modal/templates/modal-shell.template.ts` (header, close button, content), `modalShellMessages`, `src/shared/lib/react-event.ts` (the React event members on close events) | `src/widgets/eligibility-modal/controllers/modal-portal.controller.test.ts`, `src/widgets/eligibility-modal/templates/modal-shell.accessibility.test.ts`, `src/modal.browser.test.ts` (focus, Tab, scroll) |
| `Modal.module.css` | `src/widgets/eligibility-modal/templates/modal-shell.module.css` | — |
| `__tests__/Accessibility.test.tsx` | `src/widgets/eligibility-modal/templates/modal-shell.accessibility.test.ts` | — |

## `src/components/SkipLinks/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `index.tsx` | `src/widgets/eligibility-modal/templates/skip-links.template.ts`, `skipLinksMessages` | `src/widgets/eligibility-modal/templates/skip-links.template.test.ts`, `src/widgets/eligibility-modal/templates/skip-links.accessibility.test.ts` |
| `SkipLinks.module.css` | `src/widgets/eligibility-modal/templates/skip-links.module.css` | — |
| `__tests__/Accessibility.test.tsx` | `src/widgets/eligibility-modal/templates/skip-links.accessibility.test.ts` | — |
| `__tests__/SkipLinks.test.tsx` | `src/widgets/eligibility-modal/templates/skip-links.template.test.ts` | — |

## `src/components/WarningMessage/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `index.tsx` | `src/widgets/eligibility-modal/templates/schedule/warning-message.template.ts`, `warningMessages` | `src/widgets/eligibility-modal/templates/schedule/warning-message.template.test.ts` |
| `WarningMessage.module.css` | `src/widgets/eligibility-modal/templates/schedule/warning-message.module.css` | — |
| `__tests__/WarningMessage.test.tsx` | `src/widgets/eligibility-modal/templates/schedule/warning-message.template.test.ts` | — |

## `src/hooks/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `useAnimationInstructions.ts` | `src/widgets/payment-plans/controllers/animation-instructions.controller.ts`, `src/widgets/payment-plans/controllers/animation-instructions.messages.ts` | `src/widgets/payment-plans/controllers/animation-instructions.controller.test.ts` |
| `useAnimationInstructions.test.ts` | `src/widgets/payment-plans/controllers/animation-instructions.controller.test.ts` (without the cases about React details and the `formatMessage` error) | — |
| `useAnnounceText.ts` | `src/widgets/payment-plans/controllers/announce.controller.ts` | `src/widgets/payment-plans/controllers/announce.controller.test.ts` |
| `useAnnounceText.test.ts` | `src/widgets/payment-plans/controllers/announce.controller.test.ts` (without the cases about React details) | — |
| `useButtonAnimation.ts` | `src/widgets/payment-plans/controllers/plan-cycling.controller.ts` (reduced motion through `src/shared/ui/media-query.controller.ts`) | `src/widgets/payment-plans/controllers/plan-cycling.controller.test.ts` |
| `useButtonAnimation.test.ts` | `src/widgets/payment-plans/controllers/plan-cycling.controller.test.ts` (without the function references case) | — |
| `useFetchEligibility.ts` | `src/domain/plans/api/eligibility-api.ts` (request), `src/domain/plans/api/get-eligibility.ts` (cache-first lookup), `src/domain/plans/api/eligibility.const.ts`, `src/widgets/common/eligibility.controller.ts` (status and plans for both widgets) | `src/domain/plans/api/eligibility-api.test.ts`, `src/domain/plans/api/get-eligibility.test.ts`, `src/widgets/common/eligibility.controller.test.ts` |
| `useFetchEligibility.test.ts` | `src/domain/plans/api/get-eligibility.test.ts`, `src/widgets/common/eligibility.controller.test.ts` | — |
| `useSessionStorage.tsx` | `src/domain/plans/api/eligibility-cache.ts` (key, read, write, clear) | `src/domain/plans/api/eligibility-cache.test.ts` |
| `useSessionStorage.test.ts` | `src/domain/plans/api/eligibility-cache.test.ts` | — |

## `src/intl/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `IntlProvider.tsx` | `src/shared/i18n/create-intl.ts` (`createIntl(locale)` replaces `IntlProvider` and `useIntl()`), `src/shared/ui/rich-text.ts` (rich-text tags as Lit templates) | `src/shared/i18n/create-intl.test.ts`, `src/shared/ui/rich-text.test.ts` |
| `utils.ts` | `src/shared/i18n/create-intl.ts` (`getTranslationsByLocale`) | `src/shared/i18n/create-intl.test.ts` |
| `messages.json` | `src/intl/messages.json` (same path, extracted from the `.messages.ts` files) | `src/shared/i18n/define-messages.test.ts` |

## `src/stories/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `PaymentPlans.stories.ts` | `src/widgets/payment-plans/payment-plans.stories.ts` (element stories that need a request), plus the template stories in `src/widgets/payment-plans/templates/` for final states (?) | — |

## `src/test/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `eligibilityHandlers.ts` | `src/test/eligibilityHandlers.ts` (same path, also exports the endpoint) | — |
| `fixtures.ts` | `src/test/fixtures.ts` (same path) | `src/test/fixtures.test.ts` |
| `index.tsx` | `src/test/mount-widget.ts` (`mountWidget()` replaces `renderWithProviders`) | `src/test/mount-widget.test.ts` |
| `planBuilders.ts` | `src/test/planBuilders.ts` (same path, date-fns replaced by `src/shared/lib/date.ts`) | `src/test/planBuilders.test.ts` |
| `planBuilders.test.ts` | `src/test/planBuilders.test.ts` | — |

## `src/utils/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `fetch.ts` | `src/shared/lib/http.ts` | `src/shared/lib/http.test.ts` (new) |
| `filterEligibility.ts` | `src/domain/plans/filter-plans.ts` | `src/domain/plans/filter-plans.test.ts` (new) |
| `index.ts` | split: `src/shared/lib/price.ts` (`priceToCents`, `priceFromCents`, `formatCents`, re-exported by `src/public-api/utils.ts`), `src/domain/plans/plan-kind.ts` (`isP1X`), `src/widgets/eligibility-modal/eligibility-modal.const.ts` (`desktopWidth` becomes the `(min-width: 800px)` query) (?). `secondsToMilliseconds` is dropped: `src/shared/lib/date.ts` replaces the date-fns one | `src/shared/lib/price.test.ts`, `src/domain/plans/plan-kind.test.ts` |
| `index.test.tsx` | `src/shared/lib/price.test.ts` (price cases), `src/domain/plans/plan-kind.test.ts` (`isP1X` cases), `src/widgets/common/plan-text.test.ts` (`paymentPlanShorthandName` and missing `payment_plan` cases) | — |
| `merchantOrderPreferences.ts` | `src/widgets/payment-plans/active-plan.ts` | `src/widgets/payment-plans/active-plan.test.ts` (new) |
| `paymentPlanStrings.tsx` | `src/widgets/common/plan-text.ts` (short name and plan description, as strings), `src/widgets/common/plan-strings.template.ts` (info line), `planStringsMessages` in `src/widgets/common/plan.messages.ts` | `src/widgets/common/plan-text.test.ts`, `src/widgets/common/plan-strings.template.test.ts` |
| `paymentPlanStrings.module.css` | `src/widgets/common/plan-strings.module.css` | — |
| `polyfills.js` | — (the ES2021 bundle ships no polyfills) | — |
| `regulatoryFigures.ts` | `src/domain/plans/regulatory-figures.ts` (figures), `src/domain/plans/plan-kind.ts` (`isDeferred`, `isPayLater`, `isPNX`, `isCredit`, `requiresLegalDisclosure`) | `src/domain/plans/regulatory-figures.test.ts`, `src/domain/plans/plan-kind.test.ts` |
| `regulatoryFigures.test.ts` | `src/domain/plans/regulatory-figures.test.ts`, `src/domain/plans/plan-kind.test.ts` (plan kind cases) | — |
| `sortEligibility.ts` | `src/domain/plans/sort-plans.ts` | `src/domain/plans/sort-plans.test.ts` |
| `sortEligibility.test.ts` | `src/domain/plans/sort-plans.test.ts` | — |
| `utilsForStorage.ts` | `src/shared/lib/hash.ts` (`hashStringForStorage`), `src/domain/plans/api/eligibility-cache.ts` (`isMoreThanOneHourAgo`) | `src/shared/lib/hash.test.ts`, `src/domain/plans/api/eligibility-cache.test.ts` |
| `utilsForStorage.test.tsx` | `src/shared/lib/hash.test.ts`, `src/domain/plans/api/eligibility-cache.test.ts` | — |

## `src/Widgets/EligibilityModal/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `index.tsx` | `src/widgets/eligibility-modal/templates/modal-content.template.ts` (skip links, status content, regions), `src/widgets/eligibility-modal/templates/modal-layout.template.ts` (desktop or mobile), `src/widgets/eligibility-modal/eligibility-modal.element.ts` (selected plan, 800 px query through `src/shared/ui/media-query.controller.ts`), `eligibilityModalMessages` | `src/widgets/eligibility-modal/eligibility-modal.element.test.ts`, `src/widgets/eligibility-modal/templates/modal-layout.template.test.ts`, `src/widgets/eligibility-modal/__tests__/Basics.test.ts`, `src/widgets/eligibility-modal/__tests__/Plans.test.ts`, `src/widgets/eligibility-modal/__tests__/AxeStates.test.ts` |
| `EligibilityModal.module.css` | `src/widgets/eligibility-modal/templates/modal-content.module.css` | — |
| `ModalContainer.tsx` | `src/widgets/eligibility-modal/eligibility-modal.element.ts` (request through `src/widgets/common/eligibility.controller.ts`), `src/widgets/eligibility-modal/index.ts`, `src/widgets/eligibility-modal/eligibility-modal.stories.ts` (element stories) | `src/widgets/eligibility-modal/__tests__/ModalContainer.test.ts`, `src/widgets/eligibility-modal/__tests__/ModalContainerFetch.test.ts` |
| `ModalContainer.test.tsx` | `src/widgets/eligibility-modal/__tests__/ModalContainerFetch.test.ts` (?) | — |
| `classNames.const.ts` | `src/widgets/eligibility-modal/eligibility-modal.const.ts` | — |
| `__tests__/Accessibility.test.tsx` | `src/widgets/eligibility-modal/__tests__/Accessibility.test.ts` (axe on the portal div) | — |
| `__tests__/Basics.test.tsx` | `src/widgets/eligibility-modal/__tests__/Basics.test.ts` | — |
| `__tests__/Cards.test.tsx` | `src/widgets/eligibility-modal/__tests__/Cards.test.ts` | — |
| `__tests__/ModalContainer.test.tsx` | `src/widgets/eligibility-modal/__tests__/ModalContainer.test.ts` (?) | — |
| `__tests__/Plans.test.tsx` | `src/widgets/eligibility-modal/__tests__/Plans.test.ts` | — |
| `__tests__/Schedule.test.tsx` | `src/widgets/eligibility-modal/__tests__/Schedule.test.ts` | — |

## `src/Widgets/EligibilityModal/DesktopModal/` and `MobileModal/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `DesktopModal/index.tsx` | `src/widgets/eligibility-modal/templates/desktop-layout.template.ts` | `src/widgets/eligibility-modal/templates/modal-layout.template.test.ts` |
| `DesktopModal/DesktopModal.module.css` | `src/widgets/eligibility-modal/templates/desktop-layout.module.css` | — |
| `MobileModal/index.tsx` | `src/widgets/eligibility-modal/templates/mobile-layout.template.ts` | `src/widgets/eligibility-modal/templates/modal-layout.template.test.ts` |
| `MobileModal/MobileModal.module.css` | `src/widgets/eligibility-modal/templates/mobile-layout.module.css` | — |

## `src/Widgets/EligibilityModal/components/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `Cards/index.tsx` | `src/widgets/eligibility-modal/templates/cards.template.ts` | `src/widgets/eligibility-modal/__tests__/Cards.test.ts` |
| `Cards/Cards.module.css` | `src/widgets/eligibility-modal/templates/cards.module.css` | — |
| `EligibilityPlansButtons/index.tsx` | `src/widgets/eligibility-modal/templates/plan-tabs.template.ts`, `planTabsMessages` (section title from `planSectionMessages` in `src/widgets/common/plan.messages.ts`) | `src/widgets/eligibility-modal/templates/plan-tabs.template.test.ts`, `src/widgets/eligibility-modal/__tests__/Accessibility.test.ts` |
| `EligibilityPlansButtons/EligibilityPlansButtons.module.css` | `src/widgets/eligibility-modal/templates/plan-tabs.module.css` | — |
| `Info/index.tsx` | `src/widgets/eligibility-modal/templates/info.template.ts`, `infoMessages` | — (no master test, covered by the widget tests in `src/widgets/eligibility-modal/__tests__/`) (?) |
| `Info/Info.module.css` | `src/widgets/eligibility-modal/templates/info.module.css` | — |
| `Schedule/index.tsx` | `src/widgets/eligibility-modal/templates/schedule/schedule.template.ts`, `scheduleMessages` | `src/widgets/eligibility-modal/__tests__/Schedule.test.ts` |
| `Schedule/Schedule.module.css` | `src/widgets/eligibility-modal/templates/schedule/schedule.module.css` | — |
| `Title/index.tsx` | `src/widgets/eligibility-modal/templates/title.template.ts`, `titleMessages` | `src/widgets/eligibility-modal/__tests__/Plans.test.ts` (title case) (?) |
| `Title/Title.module.css` | `src/widgets/eligibility-modal/templates/title.module.css` | — |

## `src/Widgets/PaymentPlans/`

| Master file | Lit file(s) | Lit test file(s) |
| --- | --- | --- |
| `index.tsx` | `src/widgets/payment-plans/payment-plans.element.ts`, `src/widgets/payment-plans/index.ts`, `src/widgets/payment-plans/templates/payment-plans.template.ts`, `src/widgets/payment-plans/templates/plan-button.template.ts`, `paymentPlansMessages` in `src/widgets/payment-plans/payment-plans.messages.ts` (section title from `planSectionMessages`), `src/widgets/payment-plans/payment-plans.stories.ts` (element stories) | `src/widgets/payment-plans/payment-plans.element.test.ts`, `src/widgets/payment-plans/__tests__/*.test.ts` |
| `PaymentPlans.module.css` | `src/widgets/payment-plans/templates/payment-plans.module.css` | — |
| `classNames.const.ts` | `src/widgets/payment-plans/payment-plans.const.ts` | — |
| `__tests__/Accessibility.test.tsx` | `src/widgets/payment-plans/__tests__/Accessibility.test.ts` | — |
| `__tests__/AriaLandmarks.test.tsx` | `src/widgets/payment-plans/__tests__/AriaLandmarks.test.ts` | — |
| `__tests__/Basics.test.tsx` | `src/widgets/payment-plans/__tests__/Basics.test.ts` | — |
| `__tests__/Credit.test.tsx` | `src/widgets/payment-plans/__tests__/Credit.test.ts` | — |
| `__tests__/CustomTransitionDelay.test.tsx` | `src/widgets/payment-plans/__tests__/CustomTransitionDelay.test.ts` | — |
| `__tests__/HideBorder.test.tsx` | `src/widgets/payment-plans/__tests__/HideBorder.test.ts` | — |
| `__tests__/HideIneligiblePlans.test.tsx` | `src/widgets/payment-plans/__tests__/HideIneligiblePlans.test.ts` | — |
| `__tests__/HideWidget.test.tsx` | `src/widgets/payment-plans/__tests__/HideWidget.test.ts` | — |
| `__tests__/IneligibleOptions.test.tsx` | `src/widgets/payment-plans/__tests__/IneligibleOptions.test.ts` | — |
| `__tests__/InfoLink.test.tsx` | `src/widgets/payment-plans/__tests__/InfoLink.test.ts` | — |
| `__tests__/KnowMoreButton.test.tsx` | `src/widgets/payment-plans/__tests__/KnowMoreButton.test.ts` | — |
| `__tests__/LanguageCheck.test.tsx` | `src/widgets/payment-plans/__tests__/LanguageCheck.test.ts` | — |
| `__tests__/LaunchModal.test.tsx` | `src/widgets/payment-plans/__tests__/LaunchModal.test.ts` | — |
| `__tests__/Monochrome.test.tsx` | `src/widgets/payment-plans/__tests__/Monochrome.test.ts` | — |
| `__tests__/PaymentPlanContainer.test.tsx` | `src/widgets/payment-plans/__tests__/PaymentPlanContainer.test.ts` | — |
| `__tests__/SuggestedPaymentPlan.test.tsx` | `src/widgets/payment-plans/__tests__/SuggestedPaymentPlan.test.ts` | — |
| `__tests__/WithoutPlans.test.tsx` | `src/widgets/payment-plans/__tests__/WithoutPlans.test.ts` | — |
