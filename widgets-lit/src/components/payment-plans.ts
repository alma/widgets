import { LitElement, html, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { ConfigPlan, EligibilityPlan, Locale } from '../types'
import {
  fetchEligibility,
  formatPrice,
  getPlanButtonText,
  getWidgetConfig,
  isPayNowExplicitlyConfigured,
  isPayNowPlan,
  parseConfigAttribute,
  sortPlans,
} from '../utils'
import { t, Locale as I18nLocale } from '../i18n'
import { paymentPlansStyles } from './styles/payment-plans.styles'
import { sharedStyles } from './styles/shared.styles'
import { designTokensStyles } from './styles/design-tokens.styles'
import { ALMA_LOGO_COMPACT_PATH, ALMA_LOGO_PATH } from './assets'

/**
 * Payment Plans Widget - Displays available Alma payment options
 *
 * This is a Lit Web Component that shows payment plan buttons (3x, 4x, J+15, etc.)
 * Uses Shadow DOM for complete style isolation from the host page.
 *
 * Features:
 * - Auto-fetches eligible plans from Alma API
 * - Animated plan cycling (configurable)
 * - Responsive design
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Multi-language support (7 locales)
 */
@customElement('alma-payment-plans')
export class AlmaPaymentPlans extends LitElement {
  // --- Public Properties (set via HTML attributes or JS) ---

  // @property decorator makes these reactive - component re-renders when they change
  // Note: attribute names are kebab-case in HTML, camelCase in JS

  @property({ type: Number, attribute: 'purchase-amount' }) purchaseAmount = 0
  @property({ type: String }) locale: Locale = 'fr'
  @property({ type: String }) plans?: string // JSON string of custom plan configurations
  @property({ type: Boolean, attribute: 'hide-if-not-eligible' }) hideIfNotEligible = false
  @property({ type: Boolean }) monochrome = false // false = orange branding, true = black/white
  @property({ type: Boolean, attribute: 'hide-border' }) hideBorder = false
  @property({ type: String }) cards?: string // JSON string of accepted cards
  @property({ type: Number, attribute: 'transition-delay' }) transitionDelay = 5500 // Animation delay in ms
  @property({ type: String, attribute: 'suggested-payment-plan' }) suggestedPaymentPlan?: string
  @property({ type: String, attribute: 'customer-billing-country' }) customerBillingCountry?: string
  @property({ type: String, attribute: 'customer-shipping-country' })
  customerShippingCountry?: string
  @property({ type: Boolean, attribute: 'merchant-covers-all-fees' })
  merchantCoversAllFees?: boolean
  @property({ type: Boolean, attribute: 'compact-mode' }) compactMode = false
  @property({ type: Boolean, attribute: 'inline-compact' }) inlineCompact = false
  @property({ type: String, attribute: 'plan-style' }) planStyle: 'buttons' | 'tabs' = 'buttons'

  // --- Private State (internal component state, triggers re-renders) ---

  // @state decorator is like @property but for internal state
  // Changes trigger re-renders but aren't exposed as HTML attributes

  @state() private eligibilityPlans: EligibilityPlan[] = [] // Plans from API
  @state() private loading = false // Loading state for API call
  @state() private error = false // Error state
  @state() private currentPlanIndex = 0 // Currently displayed plan (for animation)
  @state() private animationActive = true // Whether auto-animation is running
  @state() private hasUserInteracted = false // Once true, we never resume auto-cycling (matches Preact)
  @state() private animationIterationCount = 1 // Stop after one full cycle (matches Preact useButtonAnimation)

  // Accessibility: Store current announcement for screen readers
  @state() private a11yAnnouncement = ''
  @state() private hoveredPlanIndex: number | null = null

  // Timer reference for plan cycling animation
  private animationTimer?: number

  // --- CSS Styles (scoped to Shadow DOM) ---

  static styles = [designTokensStyles, sharedStyles, paymentPlansStyles]

  // --- Computed Properties (getters for parsed JSON attributes) ---

  /**
   * Parse custom plans from JSON string attribute
   * This allows passing complex objects via HTML attributes
   */
  private get configPlans(): ConfigPlan[] | undefined {
    return parseConfigAttribute<ConfigPlan[]>(this.plans)
  }

  /**
   * PUBLIC GETTER: Get loaded eligibility plans
   *
   * This allows other components (like Modal) to access the plans
   * loaded by PaymentPlans without making duplicate API calls.
   *
   * Usage in Modal:
   *   const plansElement = document.querySelector('alma-payment-plans')
   *   const plans = plansElement?.getEligibilityPlans() ?? []
   */
  getEligibilityPlans(): EligibilityPlan[] {
    return this.eligibilityPlans
  }

  /**
   * PUBLIC GETTER: Check if plans are currently loading
   */
  isLoading(): boolean {
    return this.loading
  }

  // --- Lifecycle Methods (Lit/Web Component lifecycle) ---

  /**
   * connectedCallback: Called when component is added to the DOM
   * This is where we initialize data and start async operations
   */
  async connectedCallback() {
    super.connectedCallback() // Always call super first

    // In real merchant integrations, the element can be connected before the host code
    // sets purchaseAmount (e.g., when the widget is created and appended, then configured).
    // We only fetch immediately if we already have a valid purchaseAmount.
    if (this.purchaseAmount > 0) {
      await this.loadEligibility()
    } else {
      this.loading = false
    }
  }

  /**
   * disconnectedCallback: Called when component is removed from DOM
   * Clean up timers and event listeners here
   */
  disconnectedCallback() {
    super.disconnectedCallback()
    this.stopAnimation() // Clear animation timer
  }

  /**
   * updated: Called after component re-renders
   * Use this to react to property changes and trigger side effects
   */
  async updated(changedProperties: PropertyValues) {
    // Auto-refresh when purchase amount changes
    // This enables reactive updates without re-mounting the component
    if (changedProperties.has('purchaseAmount')) {
      const previous = Number(changedProperties.get('purchaseAmount') || 0)

      // Fetch when purchaseAmount becomes valid (or changes between valid values).
      if (this.purchaseAmount > 0 && this.purchaseAmount !== previous) {
        await this.loadEligibility()
      }

      // If purchaseAmount is cleared, stop loading and show the no-plans state.
      if (this.purchaseAmount <= 0) {
        this.loading = false
        this.eligibilityPlans = []
      }
    }

    // Start/restart animation when plans change
    if (changedProperties.has('eligibilityPlans') && this.eligibilityPlans.length > 0) {
      this.startAnimation()
    }

    // Announce plan change to screen readers when currentPlanIndex changes
    if (
      changedProperties.has('currentPlanIndex') &&
      !this.loading &&
      this.eligibilityPlans.length > 0
    ) {
      const lang = (this.locale.split('-')[0] as I18nLocale) || 'fr'
      const currentPlan = this.eligibilityPlans[this.currentPlanIndex]
      const planText = getPlanButtonText(currentPlan, this.locale)

      // Create announcement for screen readers
      // "Plan selected: 3x, €150 per month"
      this.a11yAnnouncement = t(lang, 'accessibility.planChanged', {
        plan: planText,
      })

      // Clear announcement after 2 seconds to avoid clutter
      setTimeout(() => {
        this.a11yAnnouncement = ''
      }, 2000)
    }
  }

  // --- Animation Methods (auto-cycling through payment plans) ---

  /**
   * Start automatic plan cycling animation
   * Cycles through available plans at configured interval
   */
  private startAnimation() {
    this.stopAnimation() // Clear any existing timer

    // If the user interacted (hover/click), we never restart auto cycling.
    if (this.hasUserInteracted) return

    // Respect user's motion preferences.
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Match the Preact widget behavior:
    // - If transitionDelay is explicitly -1 => animation is disabled.
    // - If suggestedPaymentPlan is set AND no transitionDelay is provided by the integrator,
    //   the widget should not auto-cycle (merchant wants a fixed suggested tab).
    // - If suggestedPaymentPlan is set BUT transitionDelay is explicitly provided,
    //   we keep the animation on (explicit config wins).
    const hasSuggestedPlan = this.suggestedPaymentPlan !== undefined
    const transitionDelayWasExplicitlySet = this.hasAttribute('transition-delay')

    if (this.transitionDelay === -1) return

    if (hasSuggestedPlan && !transitionDelayWasExplicitlySet) {
      return
    }

    const eligibleCountRaw = this.eligibilityPlans.filter((plan) => plan.eligible).length
    const eligibleCount = eligibleCountRaw === 0 ? this.eligibilityPlans.length : eligibleCountRaw
    if (eligibleCount <= 1) return

    // Ensure minimum delay of 1 second for usability
    const delay = Math.max(this.transitionDelay, 1000)

    // Reset iteration counter when starting a new animation cycle.
    this.animationIterationCount = 1

    this.animationTimer = window.setInterval(() => {
      if (!this.animationActive) return
      if (this.eligibilityPlans.length <= 1) return

      if (this.animationIterationCount === eligibleCount + 1) {
        this.animationActive = false
        this.stopAnimation()
        return
      }

      const nextIndex = this.getNextEligibleIndex(this.currentPlanIndex)
      if (nextIndex === -1) return

      this.animationIterationCount += 1
      this.currentPlanIndex = nextIndex
    }, delay)
  }

  private getNextEligibleIndex(currentIndex: number): number {
    if (this.eligibilityPlans.length === 0) return -1

    const total = this.eligibilityPlans.length
    for (let i = 1; i <= total; i += 1) {
      const nextIndex = (currentIndex + i) % total
      if (this.eligibilityPlans[nextIndex]?.eligible) return nextIndex
    }

    return -1
  }

  private getPrevEligibleIndex(currentIndex: number): number {
    if (this.eligibilityPlans.length === 0) return -1

    const total = this.eligibilityPlans.length
    for (let i = 1; i <= total; i += 1) {
      const prevIndex = (currentIndex - i + total) % total
      if (this.eligibilityPlans[prevIndex]?.eligible) return prevIndex
    }

    return -1
  }

  private focusPlanButton(index: number) {
    const buttons = this.shadowRoot?.querySelectorAll<HTMLButtonElement>('.plan-button')
    const target = buttons?.[index]
    if (target) target.focus()
  }

  /**
   * Stop animation timer
   */
  private stopAnimation() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer)
      this.animationTimer = undefined
    }
  }

  /**
   * Pause animation. The first manual interaction permanently disables auto-cycling.
   * This matches the Preact widget behavior where hover/focus stops the cycling for good.
   */
  private pauseAnimation() {
    this.animationActive = false
    this.hasUserInteracted = true
  }

  /**
   * Resume animation only if the user hasn't interacted manually.
   */
  private resumeAnimation() {
    if (this.hasUserInteracted) return
    this.animationActive = true
  }

  /**
   * Get initial plan index based on suggestedPaymentPlan
   * Supports single plan or array with fallback
   */
  private getSuggestedPlanIndex(): number {
    const suggested = parseConfigAttribute<number | number[]>(this.suggestedPaymentPlan)
    if (suggested === undefined) return 0

    const plans = Array.isArray(suggested) ? suggested : [suggested]

    for (const planCount of plans) {
      const index = this.eligibilityPlans.findIndex(
        (p) => p.installments_count === planCount && p.eligible,
      )
      if (index !== -1) return index
    }

    return 0
  }

  /**
   * Determine whether we should request explicit plan queries from the API.
   *
   * - If the merchant provides a `plans` config, we send queries so the API can return
   *   eligible=false entries (used to render disabled buttons).
   * - If no `plans` config is provided, we rely on the API default behavior and display
   *   ONLY what the API returns (merchant-dependent).
   */
  private get plansQueryForEligibility(): ConfigPlan[] | undefined {
    return this.configPlans && this.configPlans.length > 0 ? this.configPlans : undefined
  }

  /**
   * Fetch eligible payment plans from Alma API
   * This is the core data-fetching method
   */
  private async loadEligibility() {
    // Bail early if no purchase amount
    if (!this.purchaseAmount) {
      this.loading = false
      return
    }

    this.loading = true
    this.error = false

    const config = getWidgetConfig()
    if (!config) {
      console.error('[PaymentPlans] No widget config found!')
      this.error = true
      this.loading = false
      return
    }

    try {
      const plans = await fetchEligibility(
        config.apiMode,
        config.merchantId,
        this.purchaseAmount,
        this.plansQueryForEligibility,
        this.customerBillingCountry,
        this.customerShippingCountry,
        this.merchantCoversAllFees,
      )

      // PaymentPlans behavior parity with the Preact widget:
      // - We always exclude the P1X "pay now" plan unless it's explicitly configured.
      // - If `plans` is provided, the API can return eligible=false entries. We keep them
      //   visible but disabled.
      // - If `plans` is NOT provided, we display only what the API returns.
      const visiblePlans = sortPlans(
        plans.filter(
          (plan) => !isPayNowPlan(plan) || isPayNowExplicitlyConfigured(this.configPlans),
        ),
      )

      this.eligibilityPlans = visiblePlans

      // Set initial plan based on suggested plan (if any)
      this.currentPlanIndex = this.getSuggestedPlanIndex()

      // Reset animation state on fresh data.
      this.animationActive = true
      this.hasUserInteracted = false
      this.animationIterationCount = 1
    } catch (err) {
      console.error('[PaymentPlans] Error loading eligibility:', err)
      this.error = true
      this.eligibilityPlans = []
    } finally {
      this.loading = false
    }
  }

  /**
   * Handle plan button click
   * Dispatches a custom event that can trigger modal opening
   */
  private handlePlanClick(plan: EligibilityPlan) {
    // Custom events with 'composed: true' can cross Shadow DOM boundary
    // This allows the event to be caught by code in index.ts
    this.dispatchEvent(
      new CustomEvent('plan-selected', {
        detail: {
          plan, // Pass plan data to event listeners
          purchaseAmount: this.purchaseAmount, // Pass purchase amount so modal can update
        },
        bubbles: true, // Event bubbles up through DOM
        composed: true, // Event crosses Shadow DOM boundary
      }),
    )
  }

  /**
   * Generate accessible label for plan buttons
   * Includes plan name and monthly amount for screen readers
   */
  private getPlanAriaLabel(plan: EligibilityPlan, lang: string): string {
    // Convert locale string to base language code for i18n
    const locale = lang.split('-')[0] as I18nLocale
    const planText = getPlanButtonText(plan, this.locale)
    const monthlyAmount = plan.payment_plan?.[0]?.purchase_amount || 0
    const amount = formatPrice(monthlyAmount, this.locale)

    // Special case for single payment
    if (plan.installments_count === 1) {
      return `${planText}, ${t(locale, 'paymentPlans.payNow')}`
    }

    // Include amount and frequency for installment plans
    return `${planText}, ${amount} ${t(locale, 'paymentPlans.perMonth')}`
  }

  /**
   * Render plan information text with fees indicator
   * Matches the logic from Preact widget's paymentPlanInfoText
   */
  private renderPlanInfo(plan: EligibilityPlan, lang: I18nLocale) {
    const { installments_count, deferred_days, deferred_months, payment_plan } = plan

    // If the plan is ineligible, display purchase constraints when available.
    // This matches the Preact widget behavior where disabled options still explain why.
    if (plan.eligible === false) {
      const min = plan.constraints?.purchase_amount?.minimum
      const max = plan.constraints?.purchase_amount?.maximum

      if (typeof min === 'number' && this.purchaseAmount < min) {
        const minAmount = formatPrice(min, this.locale)
        return html`${t(lang, 'paymentPlans.ineligibleMin', { minAmount })}`
      }

      if (typeof max === 'number' && this.purchaseAmount > max) {
        const maxAmount = formatPrice(max, this.locale)
        return html`${t(lang, 'paymentPlans.ineligibleMax', { maxAmount })}`
      }

      if (typeof min === 'number') {
        const minAmount = formatPrice(min, this.locale)
        return html`${t(lang, 'paymentPlans.ineligibleMin', { minAmount })}`
      }

      if (typeof max === 'number') {
        const maxAmount = formatPrice(max, this.locale)
        return html`${t(lang, 'paymentPlans.ineligibleMax', { maxAmount })}`
      }

      return html`${t(lang, 'paymentPlans.ineligible')}`
    }

    if (!payment_plan || payment_plan.length === 0) {
      return html`${t(lang, 'paymentPlans.noPlans')}`
    }

    // Check if plan has no fees
    const hasNoFees = payment_plan.every(
      (installment) => installment.customer_fee === 0 && installment.customer_interest === 0,
    )

    const noFeeSuffix = hasNoFees ? html`<span> ${t(lang, 'paymentPlans.noFee')}</span>` : ''

    // Deferred payment (J+15, M+1, etc.)
    if ((deferred_days > 0 || deferred_months > 0) && installments_count === 1) {
      const totalAmount = formatPrice(payment_plan[0].total_amount, this.locale)
      const dueDate = this.formatDate(payment_plan[0].due_date)

      return html`${t(lang, 'paymentPlans.deferredPayOn', { totalAmount, dueDate })}${noFeeSuffix}`
    }

    // Pay now (1x)
    if (installments_count === 1) {
      const totalAmount = formatPrice(payment_plan[0].total_amount, this.locale)
      return html`${t(lang, 'paymentPlans.payNowWithAmount', { totalAmount })}${noFeeSuffix}`
    }

    // Credit (>4x)
    if (installments_count > 4) {
      return html`${t(lang, 'paymentPlans.creditMoreInfo')}`
    }

    // Check if all installments have same amount
    const allSameAmount = payment_plan.every(
      (inst, idx) => idx === 0 || inst.total_amount === payment_plan[0].total_amount,
    )

    // Multiple installments with same amount (e.g., "3 x 150,00 €")
    if (allSameAmount) {
      const count = installments_count
      const amount = formatPrice(payment_plan[0].total_amount, this.locale)
      return html`${t(lang, 'paymentPlans.multipleInstallmentsSame', {
        count,
        amount,
      })}${noFeeSuffix}`
    }

    // Multiple installments with different amounts (e.g., "150,00 € puis 2 x 145,00 €")
    const firstAmount = formatPrice(payment_plan[0].total_amount, this.locale)
    const remainingCount = installments_count - 1
    const otherAmount = formatPrice(payment_plan[1].total_amount, this.locale)

    return html`<p>
      ${t(lang, 'paymentPlans.multipleInstallmentsDifferent', {
        firstAmount,
        remainingCount,
        otherAmount,
      })}${noFeeSuffix}
    </p>`
  }

  /**
   * Format Unix timestamp as localized date string
   */
  private formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString(this.locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  /**
   * Render the component UI
   * This is called automatically by Lit when state/properties change
   */
  render() {
    // Extract base language code from locale (e.g., 'fr-FR' -> 'fr')
    const lang = (this.locale.split('-')[0] as I18nLocale) || 'fr'

    // --- Loading State ---
    if (this.loading) {
      return html`
        <div class="container ${this.hideBorder ? 'hide-border' : ''}">
          <div class="loading">${t(lang, 'paymentPlans.loading')}</div>
        </div>
      `
    }

    // --- Error State ---
    if (this.error) {
      return html`
        <div class="container ${this.hideBorder ? 'hide-border' : ''}">
          <div class="error">${t(lang, 'paymentPlans.error')}</div>
        </div>
      `
    }

    // --- Hide if Not Eligible (optional behavior) ---
    if (this.hideIfNotEligible && this.eligibilityPlans.length === 0) {
      return html`` // Return empty template (nothing rendered)
    }

    // --- No Plans Available State ---
    if (this.eligibilityPlans.length === 0) {
      return html`
        <div class="container ${this.hideBorder ? 'hide-border' : ''}">
          <div class="info">${t(lang, 'paymentPlans.noPlans')}</div>
        </div>
      `
    }

    // --- Main UI (plans available) ---

    // Get currently displayed plan (for animation)
    const currentPlan = this.eligibilityPlans[this.currentPlanIndex]
    const displayPlanIndex = this.hoveredPlanIndex ?? this.currentPlanIndex
    const displayPlan = this.eligibilityPlans[displayPlanIndex]

    return html`
      <div
        class="container ${this.hideBorder ? 'hide-border' : ''} ${this.compactMode
          ? 'compact'
          : ''} ${this.inlineCompact ? 'inline-compact' : ''} ${this.planStyle === 'tabs'
          ? 'plan-style-tabs'
          : ''}"
        role="region"
        aria-label="${t(lang, 'paymentPlans.regionLabel')}"
      >
        <div class="primary-container">
          <button
            class="logo-button ${this.monochrome ? 'monochrome' : ''}"
            @click=${() => this.handlePlanClick(currentPlan)}
            aria-label="${t(lang, 'paymentPlans.logoButton')}"
            type="button"
          >
            ${this.compactMode
              ? html`
                  <svg
                    class="logo"
                    width="16"
                    height="16"
                    viewBox="0 0 451 512"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    focusable="false"
                    role="img"
                  >
                    <title>Alma</title>
                    <path
                      d="${ALMA_LOGO_COMPACT_PATH}"
                      fill="${this.monochrome
                        ? 'var(--alma-color-text-primary)'
                        : 'var(--theme-primary, var(--alma-color-brand-primary))'}"
                    />
                  </svg>
                `
              : html`
                  <svg
                    class="logo"
                    width="42"
                    height="24"
                    viewBox="0 0 352 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    focusable="false"
                    role="img"
                  >
                    <title>Alma</title>
                    <path
                      d="${ALMA_LOGO_PATH}"
                      fill="${this.monochrome
                        ? 'var(--alma-color-text-primary)'
                        : 'var(--theme-primary, var(--alma-color-brand-primary))'}"
                    />
                  </svg>
                `}
          </button>
          <div
            class="payment-plans ${this.planStyle === 'tabs' ? 'tabs' : ''}"
            role="group"
            aria-label="${t(lang, 'paymentPlans.planOptions')}"
          >
            ${this.eligibilityPlans.map((plan, index) => {
              const isEligible = plan.eligible
              return html`
                <button
                  type="button"
                  class="plan-button ${index === this.currentPlanIndex ? 'active' : ''} ${this
                    .monochrome
                    ? 'monochrome'
                    : ''} ${!isEligible ? 'not-eligible' : ''}"
                  aria-pressed="${index === this.currentPlanIndex}"
                  aria-label="${this.getPlanAriaLabel(plan, lang)}"
                  aria-disabled="${!isEligible}"
                  ?disabled=${!isEligible}
                  tabindex=${isEligible ? 0 : -1}
                  @click=${() => {
                    if (!isEligible) return
                    this.currentPlanIndex = index
                    this.pauseAnimation()
                    this.handlePlanClick(plan)
                  }}
                  @mouseenter=${() => {
                    if (!isEligible) {
                      this.hoveredPlanIndex = index
                      return
                    }
                    this.hoveredPlanIndex = null
                    this.currentPlanIndex = index
                    this.pauseAnimation()
                  }}
                  @focus=${() => {
                    if (!isEligible) return
                    this.hoveredPlanIndex = null
                    this.currentPlanIndex = index
                    this.pauseAnimation()
                  }}
                  @blur=${() => {
                    if (!isEligible) return
                    this.resumeAnimation()
                  }}
                  @keydown=${(event: KeyboardEvent) => {
                    if (!isEligible) return
                    if (event.key === 'ArrowRight') {
                      event.preventDefault()
                      const nextIndex = this.getNextEligibleIndex(index)
                      if (nextIndex === -1) return
                      this.hoveredPlanIndex = null
                      this.currentPlanIndex = nextIndex
                      this.pauseAnimation()
                      this.focusPlanButton(nextIndex)
                    }
                    if (event.key === 'ArrowLeft') {
                      event.preventDefault()
                      const prevIndex = this.getPrevEligibleIndex(index)
                      if (prevIndex === -1) return
                      this.hoveredPlanIndex = null
                      this.currentPlanIndex = prevIndex
                      this.pauseAnimation()
                      this.focusPlanButton(prevIndex)
                    }
                  }}
                  @mouseleave=${() => {
                    if (!isEligible) {
                      this.hoveredPlanIndex = null
                      return
                    }
                    this.resumeAnimation()
                  }}
                >
                  ${getPlanButtonText(plan, this.locale)}
                </button>
              `
            })}
          </div>
        </div>

        ${this.compactMode
          ? html``
          : html`
              <div class="info-container" aria-live="polite" aria-atomic="true">
                <div class="info">${this.renderPlanInfo(displayPlan, lang)}</div>
              </div>
            `}

        <!-- Accessibility: Screen reader announcements region (hidden visually) -->
        <div class="sr-only" aria-live="polite" aria-atomic="true">${this.a11yAnnouncement}</div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'alma-payment-plans': AlmaPaymentPlans
  }
}
