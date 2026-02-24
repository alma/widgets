import { LitElement, html, PropertyValues } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { customElement, property, state } from 'lit/decorators.js'
import type { ConfigPlan, EligibilityPlan, Locale, Card } from '../types'
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
import { modalStyles } from './styles/modal.styles'
import { sharedStyles } from './styles/shared.styles'
import { designTokensStyles } from './styles/design-tokens.styles'
import {
  collectBackgroundElements,
  createFocusTrap,
  createInteractionTracker,
  focusInitialElement,
  setElementsInert,
} from '../utils/a11y'
import { CLOSE_ICON_SVG, ALMA_LOGO_PATH } from './assets'
import { injectAlmaFonts } from '../utils/fonts'

/**
 * Date formatting options for Intl.DateTimeFormat
 */
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}

/**
 * ===================================================================
 * ALMA MODAL COMPONENT - Detailed Payment Schedule Viewer
 * ===================================================================
 *
 * This is a Lit Web Component that displays a modal with detailed payment information.
 *
 * 🔑 KEY CONCEPTS FOR DEVELOPERS NOT FAMILIAR WITH LIT:
 *
 * 1. **Web Components & Shadow DOM**
 *    - This creates a custom HTML element: <alma-modal>
 *    - Shadow DOM = Complete CSS isolation (styles don't leak in/out)
 *    - The component is self-contained and can be used in any framework
 *
 * 2. **Lit Decorators**
 *    - @customElement('alma-modal') = Registers the component as <alma-modal>
 *    - @property() = Public property (can be set via HTML attribute or JS)
 *    - @state() = Private state (triggers re-render when changed)
 *
 * 3. **Reactivity**
 *    - When @property or @state values change, Lit AUTOMATICALLY re-renders
 *    - No need to call setState() or forceUpdate() like in React
 *    - Only the changed parts of the DOM are updated (efficient!)
 *
 * 4. **Template Syntax**
 *    - html`...` = Tagged template literal for HTML
 *    - ${value} = Insert dynamic values
 *    - @click=${handler} = Event listener
 *    - Works like JSX but is native JavaScript
 *
 * 5. **Lifecycle Methods**
 *    - connectedCallback() = Component added to DOM (like React componentDidMount)
 *    - disconnectedCallback() = Component removed from DOM (like componentWillUnmount)
 *    - updated() = After component re-renders (like componentDidUpdate)
 *
 * 📐 MODAL STRUCTURE (Desktop):
 * ┌─────────────────────────────────────────────────────┐
 * │ Header: "Pay in installments with Alma"                     [X] │
 * ├───────────────┬───────────────────────────────────────────────┤
 * │ LEFT COLUMN   │ RIGHT COLUMN                                  │
 * │               │                                               │
 * │ • Title       │ • Plan buttons (1x, 3x, 4x, D+15)             │
 * │ • Info steps  │ • Payment schedule (timeline)                 │
 * │ • Card icons  │ • Total block (fees, APR)                     │
 * │ • Alma logo   │                                               │
 * └───────────────┴───────────────────────────────────────────────┘
 *
 * On mobile, columns stack vertically: Left on top, Right below.
 *
 * ===================================================================
 */

/**
 * Eligibility Modal Component
 *
 * Displays detailed payment information:
 * - Selectable payment plan tabs (e.g., "3x", "4x", "J+15")
 * - Detailed payment schedule for selected plan
 * - Total cost with fees breakdown
 * - Credit warnings (for 4+ installments)
 * - Accessibility features (WCAG 2.1 AA compliant)
 */
@customElement('alma-modal')
export class AlmaModal extends LitElement {
  // ===================================================================
  // PUBLIC PROPERTIES (can be set via HTML attributes or JavaScript)
  // ===================================================================
  //
  // These properties are "reactive" - when they change, the component
  // automatically re-renders to reflect the new values.
  //
  // Example usage:
  //   <alma-modal purchase-amount="45000" locale="fr"></alma-modal>
  // Or:
  //   modal.purchaseAmount = 50000  // Component re-renders automatically!
  // ===================================================================

  @property({ type: Number, attribute: 'purchase-amount' }) purchaseAmount = 0
  @property({ type: String }) locale: Locale = 'fr'
  @property({ type: String }) plans?: string // JSON string of custom plan configurations
  @property({ type: String }) cards?: string // JSON string of accepted cards
  @property({ type: String, attribute: 'customer-billing-country' }) customerBillingCountry?: string
  @property({ type: String, attribute: 'customer-shipping-country' })
  customerShippingCountry?: string
  @property({ type: Boolean, attribute: 'merchant-covers-all-fees' })
  merchantCoversAllFees?: boolean

  // ===================================================================
  // PRIVATE STATE (internal component state, not exposed as HTML attributes)
  // ===================================================================
  //
  // These are like @property but for internal use only.
  // They still trigger re-renders when changed, but can't be set from outside.
  // ===================================================================

  @state() private isOpen = false // Whether modal is visible
  @state() private eligibilityPlans: EligibilityPlan[] = [] // Plans from API
  @state() private loading = true // Loading state for API call
  @state() private currentPlanIndex = 0 // Currently selected plan tab (0, 1, 2, ...)
  @state() private isMobile = false // Whether screen is mobile (<800px)

  /**
   * When true, skip links can become visible on focus.
   * We only enable this if the modal was opened via keyboard.
   */
  @state() private keyboardOpen = false

  // Media query for mobile breakpoint
  private mobileMediaQuery = window.matchMedia('(max-width: 799px)')

  /** Element that triggered the modal opening (used to restore focus on close). */
  private openerElement: HTMLElement | null = null

  /** Elements outside the widget we make inert while the modal is open. */
  private backgroundElements: HTMLElement[] = []

  private interactionTracker = createInteractionTracker(document)

  // We create the focus trap handler lazily once the modal element exists.
  private focusTrapHandler?: (evt: Event) => void

  private updateBackgroundInert(isInert: boolean) {
    const host =
      this.getRootNode() instanceof ShadowRoot ? (this.getRootNode() as ShadowRoot).host : null
    const modalHost = (host as HTMLElement) || this

    this.backgroundElements = collectBackgroundElements(modalHost)
    setElementsInert(this.backgroundElements, isInert)
  }

  private focusFirstElementInModal() {
    const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement | null
    if (!modal) return

    // Match the Preact widget behavior (react-modal): focus the dialog container.
    // The focus trap will keep Tab navigation inside, and the close button will
    // be the first focusable control.
    focusInitialElement(modal)
  }

  // ===================================================================
  // CSS STYLES (scoped to this component via Shadow DOM)
  // ===================================================================
  //
  // These styles ONLY affect this component, not the rest of the page.
  // The host site's CSS cannot affect these styles either.
  // This is the magic of Shadow DOM for perfect CSS isolation!
  // ===================================================================

  static styles = [designTokensStyles, sharedStyles, modalStyles]

  // ===================================================================
  // COMPUTED PROPERTIES (getters that parse JSON string attributes)
  // ===================================================================
  //
  // HTML attributes can only be strings, so we use getters to parse
  // JSON strings into usable objects.
  //
  // Example:
  //   <alma-modal plans='[{"installmentsCount":3}]'>
  //   → this.configPlans returns [{installmentsCount:3}]
  // ===================================================================

  /**
   * Parse custom plan configuration from JSON string attribute
   * Returns undefined if not set or invalid JSON
   */
  private get configPlans(): ConfigPlan[] | undefined {
    return parseConfigAttribute<ConfigPlan[]>(this.plans)
  }

  /**
   * Parse accepted cards list from JSON string attribute
   * Returns undefined if not set or invalid JSON
   */
  private get cardsList(): Card[] | undefined {
    return parseConfigAttribute<Card[]>(this.cards)
  }

  // ===================================================================
  // LIFECYCLE METHODS (Web Component lifecycle hooks)
  // ===================================================================
  //
  // These are called automatically by Lit at specific times:
  // - connectedCallback: When component is added to the page
  // - disconnectedCallback: When component is removed from the page
  // - updated: After component re-renders due to property/state change
  // ===================================================================

  /**
   * Called when component is added to the DOM
   * This is where we initialize data (similar to React's componentDidMount)
   */
  async connectedCallback() {
    super.connectedCallback() // Always call super first!

    // Inject fonts into document head for Shadow DOM compatibility
    injectAlmaFonts()

    // Set initial mobile state and listen for breakpoint changes
    this.isMobile = this.mobileMediaQuery.matches
    this.mobileMediaQuery.addEventListener('change', this.handleMediaQueryChange)

    this.interactionTracker.start()

    // The modal can be connected before the host code sets purchaseAmount.
    // Only fetch immediately if the amount is already valid.
    if (this.purchaseAmount > 0) {
      await this.loadEligibility()
    } else {
      this.loading = false
    }
  }

  /**
   * Called after component re-renders
   * Use this to react to property changes and trigger side effects
   *
   * @param changedProperties - Map of properties that changed with their old values
   */
  async updated(changedProperties: PropertyValues) {
    // Auto-reload plans when purchase amount changes.
    // Fetch when purchaseAmount becomes valid (or changes between valid values).
    if (changedProperties.has('purchaseAmount')) {
      const previous = Number(changedProperties.get('purchaseAmount') || 0)

      if (this.purchaseAmount > 0 && this.purchaseAmount !== previous) {
        await this.loadEligibility()
      }

      // If purchaseAmount is cleared, reset state.
      if (this.purchaseAmount <= 0) {
        this.loading = false
        this.eligibilityPlans = []
      }
    }

    // Attach/detach global Escape handler based on open state.
    if (changedProperties.has('isOpen')) {
      if (this.isOpen) {
        document.addEventListener('keydown', this.handleGlobalEscapeKeyDown, true)
      } else {
        document.removeEventListener('keydown', this.handleGlobalEscapeKeyDown, true)
      }
    }

    // Set up keyboard focus trap when modal opens
    if (changedProperties.has('isOpen') && this.isOpen) {
      this.trapFocus()
    }
  }

  /**
   * Called when component is removed from the DOM
   * Clean up side effects here (similar to React's componentWillUnmount)
   */
  disconnectedCallback() {
    super.disconnectedCallback()
    // Restore body scrolling if modal was open when removed
    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = ''
    }

    // Ensure we don't leave the page in an inert state.
    this.updateBackgroundInert(false)

    // Remove media query listener to prevent memory leaks
    this.mobileMediaQuery.removeEventListener('change', this.handleMediaQueryChange)

    // Remove focus trap listener if it was attached.
    const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement | null
    if (modal && this.focusTrapHandler) {
      modal.removeEventListener('keydown', this.focusTrapHandler)
    }

    this.interactionTracker.stop()

    document.removeEventListener('keydown', this.handleGlobalEscapeKeyDown, true)
  }

  /**
   * Handle media query changes for responsive behavior
   */
  private handleMediaQueryChange = (e: MediaQueryListEvent) => {
    this.isMobile = e.matches
  }

  // ===================================================================
  // DATA LOADING (API communication)
  // ===================================================================

  /**
   * Fetch eligible payment plans from Alma API
   *
   * This method:
   * 1. Calls Alma API with purchase amount and filters
   * 2. If another identical request is in progress (e.g., from PaymentPlans widget),
   *    the shared fetch promise ensures only ONE API call is made and result is shared
   * 3. Filters to only eligible plans
   * 4. Updates component state (which triggers automatic re-render)
   *
   * Note: This is called automatically:
   * - When component is first added to page (connectedCallback)
   * - When purchaseAmount property changes (updated)
   */
  private async loadEligibility() {
    // Don't fetch if no purchase amount
    if (!this.purchaseAmount) {
      this.loading = false
      return
    }

    this.loading = true // Show loading state

    // Get merchant credentials from global config
    // This was set by Alma.Widgets.initialize() in index.ts
    const config = getWidgetConfig()
    if (!config) {
      console.error(
        '[Modal] No __ALMA_WIDGET_CONFIG__ found. Did you call Alma.Widgets.initialize()?',
      )
      this.loading = false
      return
    }

    try {
      // Call Alma API to fetch eligibility
      const plans = await fetchEligibility(
        config.apiMode,
        config.merchantId,
        this.purchaseAmount,
        this.plansQueryForEligibility,
        this.customerBillingCountry,
        this.customerShippingCountry,
        this.merchantCoversAllFees,
      )

      // Modal shows only eligible plans (visual parity with Preact).
      // P1X is excluded unless explicitly configured. Display order is stable.
      const eligiblePlans = sortPlans(
        plans
          .filter((p) => p.eligible)
          .filter((plan) => !isPayNowPlan(plan) || isPayNowExplicitlyConfigured(this.configPlans)),
      )

      this.eligibilityPlans = eligiblePlans

      this.currentPlanIndex = this.getInitialPlanIndex()
    } catch (err) {
      console.error('[Modal] Error loading eligibility:', err)
      this.loading = false
    } finally {
      this.loading = false
    }
  }

  /**
   * Determine whether we should request explicit plan queries from the API.
   *
   * - If the merchant provides a `plans` config, we send queries so the API can return
   *   a deterministic response for those plan types.
   * - If no `plans` config is provided, we rely on the API default behavior and display
   *   ONLY what the API returns.
   */
  private get plansQueryForEligibility(): ConfigPlan[] | undefined {
    return this.configPlans && this.configPlans.length > 0 ? this.configPlans : undefined
  }

  /**
   * Get the initial plan index when the modal receives eligibility plans.
   *
   * Keep it simple and deterministic:
   * - If we already have a currentPlanIndex within bounds, keep it.
   * - Otherwise, default to the first available plan.
   */
  private getInitialPlanIndex(): number {
    if (this.currentPlanIndex >= 0 && this.currentPlanIndex < this.eligibilityPlans.length) {
      return this.currentPlanIndex
    }
    return 0
  }

  // ===================================================================
  // PUBLIC API METHODS (can be called from outside the component)
  // ===================================================================
  //
  // These methods are the public API of the modal component.
  // They can be called from JavaScript code outside the component.
  //
  // Example usage:
  //   const modal = document.querySelector('alma-modal')
  //   modal.open()              // Open modal
  //   modal.open(2)             // Open modal on plan at index 2
  //   modal.openWithPlan(plan)  // Open modal on specific plan
  //   modal.close()             // Close modal
  // ===================================================================

  /**
   * Open the modal
   *
   * @param planIndex - Optional: Index of plan to display (0 = first plan, 1 = second, etc.)
   *                    If not provided or invalid, uses current selection
   *
   * Side effects:
   * - Shows the modal overlay
   * - Prevents body scrolling (sets body overflow to hidden)
   * - Dispatches 'modal-opened' event
   * - Sets up keyboard focus trap
   */
  public open(planIndex?: number) {
    // Remember opener to restore focus on close.
    this.openerElement = (document.activeElement as HTMLElement) || null

    // Enable skip links only when the modal was opened from keyboard navigation.
    this.keyboardOpen = this.interactionTracker.getLastInteraction() === 'keyboard'

    this.isOpen = true // Setting state triggers automatic re-render!

    // Switch to specified plan if valid index provided
    if (planIndex !== undefined && planIndex >= 0 && planIndex < this.eligibilityPlans.length) {
      this.currentPlanIndex = planIndex
    }

    // Prevent page scrolling while modal is open
    document.body.style.overflow = 'hidden'

    // Prevent focusing the underlying page while modal is open.
    this.updateBackgroundInert(true)

    // Move focus into the modal after Lit applied the DOM update.
    // This is critical when the modal is opened via pointer: otherwise focus
    // may remain on the opener and Tab will keep navigating the background.
    this.updateComplete.then(() => {
      if (!this.isOpen) return
      this.focusFirstElementInModal()
      this.trapFocus()
    })

    // Dispatch event so external code can react to modal opening
    this.dispatchEvent(new CustomEvent('modal-opened', { bubbles: true, composed: true }))
  }

  /**
   * Open the modal with a specific plan based on its characteristics
   *
   * This is used to sync the modal with the PaymentPlans widget.
   * When user clicks a plan in PaymentPlans, we need to find the matching
   * plan in the modal's list and display it.
   *
   * @param plan - Plan object with identifying properties:
   *               - installments_count: Number of payments (1, 3, 4, 10, etc.)
   *               - deferred_days: Days until first payment (0, 15, 30, etc.)
   *               - deferred_months: Months until first payment (0, 1, 2, etc.)
   *
   * How it works:
   * 1. Search modal's plans for one with matching characteristics
   * 2. If found, open modal on that plan
   * 3. If not found, open on first plan (fallback)
   *
   * Example:
   *   User clicks "J+15" in PaymentPlans
   *   → PaymentPlans dispatches event with plan {installments_count: 1, deferred_days: 15}
   *   → Modal finds plan with same characteristics
   *   → Modal opens showing J+15
   */
  public openWithPlan(plan: {
    installments_count: number
    deferred_days: number
    deferred_months: number
  }) {
    // Find matching plan in modal's list by comparing identifying properties
    const index = this.eligibilityPlans.findIndex(
      (p) =>
        p.installments_count === plan.installments_count &&
        p.deferred_days === plan.deferred_days &&
        p.deferred_months === plan.deferred_months,
    )

    // Open modal on found plan, or fallback to first plan if not found
    this.open(index !== -1 ? index : 0)
  }

  /**
   * Close the modal
   *
   * Side effects:
   * - Hides the modal overlay
   * - Restores body scrolling
   * - Dispatches 'modal-closed' event
   */
  public close() {
    this.isOpen = false // Setting state triggers automatic re-render!
    this.keyboardOpen = false

    // Restore page scrolling
    document.body.style.overflow = ''

    // Restore focus to opener if possible.
    if (this.openerElement) {
      queueMicrotask(() => this.openerElement?.focus())
    }

    // Restore page interactivity.
    this.updateBackgroundInert(false)

    // Dispatch event so external code can react to modal closing
    this.dispatchEvent(new CustomEvent('modal-closed', { bubbles: true, composed: true }))
  }

  // ===================================================================
  // EVENT HANDLERS (respond to user interactions)
  // ===================================================================

  /**
   * Handle click on modal overlay (background)
   * Closes modal only if user clicked directly on overlay, not on modal content
   *
   * @param e - Mouse event from click
   */
  private handleOverlayClick(e: MouseEvent) {
    // e.target = element that was clicked
    // e.currentTarget = element that has the event listener (overlay)
    // If they're the same, user clicked overlay background, not modal content
    if (e.target === e.currentTarget) {
      this.close()
    }
  }

  /**
   * Handle Escape key press to close modal
   *
   * @param e - Keyboard event
   */
  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.isOpen) {
      this.close()
    }
  }

  /**
   * Global Escape handler.
   * We attach it only while the modal is open to ensure Escape always closes,
   * regardless of which element inside the Shadow DOM currently has focus.
   */
  private handleGlobalEscapeKeyDown: EventListener = (evt: Event) => {
    const e = evt as KeyboardEvent
    if (e.key !== 'Escape') return
    if (!this.isOpen) return

    e.preventDefault()
    this.close()
  }

  /**
   * Set up keyboard focus trap for accessibility
   *
   * When modal opens, keyboard focus should:
   * 1. Start on first focusable element (or close button)
   * 2. Stay trapped within modal (Tab doesn't leave modal)
   * 3. Cycle through focusable elements (Tab wraps around)
   *
   * This implements WCAG 2.1 AA requirement for modal dialogs.
   */
  private trapFocus() {
    const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement | null
    if (!modal) return

    // Lazy init
    this.focusTrapHandler ||= createFocusTrap(modal)

    modal.removeEventListener('keydown', this.focusTrapHandler)
    modal.addEventListener('keydown', this.focusTrapHandler)
  }

  /**
   * Handle click on skip links (accessibility feature)
   * Scrolls to the target section and focuses it
   *
   * @param event - Mouse event from click
   */
  private handleSkipLinkClick = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLAnchorElement | null
    if (!target) return

    const href = target.getAttribute('href')
    if (!href || !href.startsWith('#')) return

    const targetId = href.substring(1)
    const root = this.shadowRoot
    if (!root) return

    const targetElement = root.getElementById(targetId) as HTMLElement | null
    if (!targetElement) return

    // Mirror Preact behavior: focus the target after the browser scrolls.
    setTimeout(() => targetElement.focus(), 0)
  }

  // ===================================================================
  // HELPER METHODS (utilities for rendering and data processing)
  // ===================================================================

  /**
   * Format Unix timestamp as localized date string
   * Caches today's date to avoid recalculating on every call
   *
   * @param timestamp - Unix timestamp in seconds (not milliseconds!)
   * @returns Formatted date string (e.g., "15 March 2024" in English)
   */
  private formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000)

    // Return empty string if it's today (handled by renderSchedule as "today" label)
    if (this.isToday(timestamp)) {
      return ''
    }

    // Format date according to user's locale
    return date.toLocaleDateString(this.locale, DATE_FORMAT_OPTIONS)
  }

  /**
   * Check if a timestamp represents today's date
   * Uses cached today's date for performance
   *
   * @param timestamp - Unix timestamp in seconds
   * @returns true if date is today, false otherwise
   */
  private isToday(timestamp: number): boolean {
    const date = new Date(timestamp * 1000)
    const today = new Date()

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  /**
   * Calculate APR (Annual Percentage Rate) as a decimal.
   *
   * The API returns annual_interest_rate in basis points (e.g., 519 = 5.19%).
   * We convert it to a decimal (0.0519 = 5.19%).
   */
  private getTAEG(plan: EligibilityPlan): number {
    // annual_interest_rate from API is in basis points (e.g., 519 = 5.19%)
    // Divide by 10000 to get decimal percentage
    return plan.annual_interest_rate ? plan.annual_interest_rate / 10000 : 0
  }

  // ===================================================================
  // RENDER METHODS (generate HTML for the modal)
  // ===================================================================
  //
  // These methods return Lit HTML templates using the html`...` syntax.
  //
  // 🔑 KEY CONCEPTS:
  //
  // 1. **html`...` Tagged Template Literal**
  //    - Not a string! It's a special Lit template
  //    - Lit efficiently diffs and updates only what changed
  //    - Similar to JSX in React, but native JavaScript
  //
  // 2. **Interpolation ${...}**
  //    - Insert dynamic values: html`<div>${value}</div>`
  //    - Insert other templates: html`<div>${otherTemplate}</div>`
  //    - Conditional: html`${condition ? html`<div>Yes</div>` : ''}`
  //    - Loop: html`${array.map(item => html`<li>${item}</li>`)}`
  //
  // 3. **Event Listeners @event=${handler}**
  //    - @click=${this.handleClick}
  //    - @input=${e => this.value = e.target.value}
  //    - Arrow functions create new reference each render, but Lit handles it
  //
  // 4. **Conditional Rendering**
  //    - Use ternary: ${condition ? html`<div>Yes</div>` : ''}
  //    - Use &&: ${condition && html`<div>Yes</div>`}
  //    - Empty string '' = render nothing
  //
  // 5. **Automatic Re-rendering**
  //    - Lit watches @property and @state
  //    - When they change, render() is called automatically
  //    - Only changed DOM parts are updated (virtual DOM diffing)
  //
  // ===================================================================

  /**
   * Get the currently selected plan with bounds checking
   * Returns undefined if no plans available or index is out of bounds
   */
  private get currentPlan(): EligibilityPlan | undefined {
    if (
      this.eligibilityPlans.length === 0 ||
      this.currentPlanIndex >= this.eligibilityPlans.length
    ) {
      return undefined
    }
    return this.eligibilityPlans[this.currentPlanIndex]
  }

  // --- Helper methods to determine plan type ---

  /**
   * Check if any plan in the list is deferred
   * Used to determine modal title variant
   */
  private isSomePlanDeferred(): boolean {
    return this.eligibilityPlans.some((plan) => plan.deferred_days > 0 || plan.deferred_months > 0)
  }

  /**
   * Check if current plan is P1X (single payment immediately)
   * P1X = 1 payment, no deferral
   */
  private isCurrentPlanP1X(): boolean {
    return this.currentPlan ? isPayNowPlan(this.currentPlan) : false
  }

  /**
   * Derive the correct modal title key based on available plans.
   * - titleDeferred: at least one plan has a deferred payment
   * - titlePayNow:   all plans are P1X (pay now)
   * - titleNormal:   regular installment plans (3x, 4x…)
   */
  private get modalTitleKey(): 'modal.titleNormal' | 'modal.titleDeferred' | 'modal.titlePayNow' {
    if (this.isSomePlanDeferred()) return 'modal.titleDeferred'
    if (this.eligibilityPlans.length > 0 && this.eligibilityPlans.every((p) => isPayNowPlan(p)))
      return 'modal.titlePayNow'
    return 'modal.titleNormal'
  }

  /**
   * Render info section (how to proceed)
   * Includes sr-only heading for screen reader users to understand section purpose
   */
  private renderInfoSection(lang: I18nLocale) {
    const isP1X = this.isCurrentPlanP1X()

    return html`
      <div
        id="payment-info"
        class="info-section"
        role="region"
        aria-labelledby="payment-info-title"
        aria-describedby="payment-info-description"
        tabindex="-1"
      >
        <!-- Screen reader only heading -->
        <div id="payment-info-title" class="sr-only" role="heading" aria-level="2">
          ${t(lang, 'modal.infoTitle')}
        </div>

        <!-- Info list with ID for aria-describedby -->
        <ol id="payment-info-description" class="info-list">
          <li class="info-item">
            <div class="info-bullet">1</div>
            <div class="info-text">
              ${isP1X
                ? html`${unsafeHTML(t(lang, 'modal.infoBullet1P1X'))}`
                : html`${unsafeHTML(t(lang, 'modal.infoBullet1'))}`}
            </div>
          </li>
          <li class="info-item">
            <div class="info-bullet">2</div>
            <div class="info-text">
              ${isP1X
                ? html`${unsafeHTML(t(lang, 'modal.infoBullet2P1X'))}`
                : html`${unsafeHTML(t(lang, 'modal.infoBullet2'))}`}
            </div>
          </li>
          <li class="info-item">
            <div class="info-bullet">3</div>
            <div class="info-text">
              ${isP1X
                ? html`${unsafeHTML(t(lang, 'modal.infoBullet3P1X'))}`
                : html`${unsafeHTML(t(lang, 'modal.infoBullet3'))}`}
            </div>
          </li>
        </ol>
      </div>
    `
  }

  /**
   * Render skip links for accessibility (RGAA 11.13.1)
   * These links are hidden by default but become visible on keyboard focus
   */
  private renderSkipLinks(lang: I18nLocale) {
    return html`
      <nav
        class="skip-links ${this.keyboardOpen ? 'skip-links--enabled' : ''}"
        role="navigation"
        aria-label="${t(lang, 'accessibility.skipLinksNavLabel')}"
      >
        <ul class="skip-links-list">
          <li class="skip-link-item">
            <a href="#payment-plans" class="skip-link" @click=${this.handleSkipLinkClick}>
              ${t(lang, 'modal.skipToPlans')}
            </a>
          </li>
          <li class="skip-link-item">
            <a href="#payment-info" class="skip-link" @click=${this.handleSkipLinkClick}>
              ${t(lang, 'modal.skipToInfo')}
            </a>
          </li>
          <li class="skip-link-item">
            <a href="#payment-schedule" class="skip-link" @click=${this.handleSkipLinkClick}>
              ${t(lang, 'modal.skipToSchedule')}
            </a>
          </li>
        </ul>
      </nav>
    `
  }

  /**
   * Render plan selection buttons
   * Section has aria-labelledby linking to a title for screen readers
   */
  private renderPlanButtons(lang: I18nLocale) {
    return html`
      <div
        id="payment-plans"
        class="plan-buttons"
        role="group"
        aria-labelledby="payment-plans-title"
        tabindex="-1"
      >
        <!-- Screen reader only heading -->
        <div id="payment-plans-title" class="sr-only" role="heading" aria-level="2">
          ${t(lang, 'modal.planOptions')}
        </div>

        <div class="plan-buttons-container">
          ${this.eligibilityPlans.map(
            (plan, index) => html`
              <button
                type="button"
                class="plan-button ${index === this.currentPlanIndex ? 'active' : ''}"
                @click=${() => (this.currentPlanIndex = index)}
                aria-pressed="${index === this.currentPlanIndex}"
                aria-label="${getPlanButtonText(plan, this.locale)}"
              >
                <span class="plan-button-text" aria-hidden="true"
                  >${getPlanButtonText(plan, this.locale)}</span
                >
              </button>
            `,
          )}
        </div>
      </div>
    `
  }

  /**
   * Render payment schedule
   * Includes sr-only heading and proper region semantics for screen readers
   */
  private renderSchedule(plan: EligibilityPlan, lang: I18nLocale) {
    return html`
      <div
        id="payment-schedule"
        class="schedule-container"
        role="region"
        aria-labelledby="payment-schedule-title"
        aria-describedby="payment-schedule-description"
        tabindex="-1"
      >
        <!-- Screen reader only heading (div with role instead of h3 to avoid breaking page hierarchy) -->
        <div id="payment-schedule-title" class="sr-only" role="heading" aria-level="2">
          ${t(lang, 'modal.scheduleTitle')}
        </div>

        <!-- Wrapper for aria-describedby -->
        <div id="payment-schedule-description" class="payment-schedule-description">
          <div class="vertical-line" role="presentation" aria-hidden="true"></div>
          <div class="schedule-details">
            <ul class="installments-list">
              ${(plan.payment_plan || []).map(
                (installment) => html`
                  <li class="installment-item">
                    <div class="installment-date">
                      <div class="installment-dot" role="presentation" aria-hidden="true"></div>
                      ${this.isToday(installment.due_date)
                        ? html`<strong>${t(lang, 'modal.today')}</strong>`
                        : html`${this.formatDate(installment.due_date)}`}
                    </div>
                    <div class="installment-amount">
                      ${formatPrice(installment.total_amount, this.locale)}
                    </div>
                  </li>
                `,
              )}
            </ul>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Render total block with fees
   */
  private renderTotalBlock(plan: EligibilityPlan, lang: I18nLocale) {
    const isCredit = plan.installments_count > 4
    const total = plan.purchase_amount + plan.customer_total_cost_amount
    const fees = plan.customer_total_cost_amount
    const taeg = this.getTAEG(plan)

    // Calculate values for credit legal text
    const firstInstallmentAmount = plan.payment_plan?.[0]?.total_amount || 0
    const totalWithoutFirstInstallment =
      plan.purchase_amount + plan.customer_total_cost_amount - firstInstallmentAmount
    const productPriceWithoutCreditCost = plan.purchase_amount

    return html`
      <!-- Credit info warning (appears first, on white background) -->
      ${isCredit
        ? html`
            <div class="credit-info">
              <span class="credit-info-title">${t(lang, 'modal.creditWarningTitle')}</span>
              <br />
              ${t(lang, 'modal.creditWarning')}
            </div>
          `
        : ''}

      <!-- Total block (gray box with all financial details) -->
      <div class="total-block">
        <p class="total-row main-total">
          <span class="total-label">${t(lang, 'modal.total')}</span>
          <span class="total-value">${formatPrice(total, this.locale)}</span>
        </p>

        <p class="total-row fees-row">
          <span class="total-fees-label">
            ${isCredit ? t(lang, 'modal.creditCost') : t(lang, 'modal.fees')}
          </span>
          <span class="total-fees-value">
            ${formatPrice(fees, this.locale)}
            ${isCredit && taeg > 0 && fees > 0
              ? html`<span class="credit-cost-detail"> (APR ${(taeg * 100).toFixed(2)}%) </span>`
              : ''}
          </span>
        </p>

        <!-- Credit legal text (inside gray box) -->
        ${isCredit
          ? html`
              <div class="credit-legal-text">
                ${this.renderCreditLegalText(
                  plan,
                  lang,
                  totalWithoutFirstInstallment,
                  firstInstallmentAmount,
                  productPriceWithoutCreditCost,
                  taeg,
                )}
              </div>
            `
          : ''}
      </div>
    `
  }

  /**
   * Render credit legal text with interpolated values
   */
  private renderCreditLegalText(
    plan: EligibilityPlan,
    lang: I18nLocale,
    totalWithoutFirstInstallment: number,
    firstInstallmentAmount: number,
    productPriceWithoutCreditCost: number,
    taeg: number,
  ) {
    const template = t(lang, 'modal.creditLegalText' as any) || ''

    // Simple template interpolation
    return template
      .replace(
        '{totalWithoutFirstInstallment}',
        formatPrice(totalWithoutFirstInstallment, this.locale),
      )
      .replace('{taegPercentage}', `${(taeg * 100).toFixed(2)} %`)
      .replace('{installmeentsCountWithoutFirst}', String(plan.installments_count - 1))
      .replace('{firstInstallmentAmount}', formatPrice(firstInstallmentAmount, this.locale))
      .replace(
        '{productPriceWithoutCreditCost}',
        formatPrice(productPriceWithoutCreditCost, this.locale),
      )
  }

  /**
   * Helper: Render content for both desktop and mobile layouts
   * Handles loading/empty states
   */
  private renderModalContent(lang: I18nLocale) {
    return this.loading
      ? html`<div class="loading" role="status" aria-live="polite">
          ${t(lang, 'modal.loading')}
        </div>`
      : this.eligibilityPlans.length === 0
        ? html`<div class="no-plans" role="alert">${t(lang, 'modal.noPlans')}</div>`
        : null
  }

  /**
   * Helper: Render close button (same for both layouts)
   */
  private renderCloseButton(lang: I18nLocale) {
    return html`<button
      type="button"
      class="close-button"
      @click=${this.close}
      aria-label="${t(lang, 'modal.close')}"
    >
      ${unsafeHTML(CLOSE_ICON_SVG)}
    </button>`
  }

  /**
   * Render Alma Logo SVG
   */
  private renderAlmaLogo() {
    return html`<svg
      class="alma-logo"
      width="75"
      height="43"
      viewBox="0 0 352 120"
      fill="#fa5022"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="${ALMA_LOGO_PATH}" />
    </svg>`
  }

  /**
   * Render Desktop Modal Layout (2 columns)
   */
  private renderDesktopModal(lang: I18nLocale) {
    const emptyContent = this.renderModalContent(lang)
    if (emptyContent) {
      return emptyContent
    }

    return html`
      <div class="modal-content">
        <!-- Left Column: Title, Info, Cards, Logo -->
        <div class="left-column">
          <div class="modal-title" id="modal-title" role="heading" aria-level="1">
            ${t(lang, this.modalTitleKey)}
          </div>
          ${this.renderInfoSection(lang)}
          ${this.cardsList && this.cardsList.length > 0
            ? html`
                <div class="cards-row">
                  <div class="cards-container">
                    ${this.cardsList.map(
                      (card) =>
                        html`<div
                          class="card-icon card-${card}"
                          role="img"
                          aria-label="${card}"
                        ></div>`,
                    )}
                  </div>
                </div>
              `
            : ''}
          <div class="logo-row">${this.renderAlmaLogo()}</div>
        </div>

        <!-- Right Column: Buttons, Schedule, Total -->
        <div class="right-column">
          ${this.renderPlanButtons(lang)}
          ${this.currentPlan ? this.renderSchedule(this.currentPlan, lang) : ''}
          ${this.currentPlan ? this.renderTotalBlock(this.currentPlan, lang) : ''}
        </div>
      </div>
    `
  }

  private renderMobileModal(lang: I18nLocale) {
    const emptyContent = this.renderModalContent(lang)
    if (emptyContent) {
      return emptyContent
    }

    return html`
      <div class="modal-content-mobile">
        <div class="modal-title" id="modal-title" role="heading" aria-level="1">
          ${t(lang, this.modalTitleKey)}
        </div>
        ${this.renderPlanButtons(lang)}
        <!-- Wrapper for schedule and total (no gap between them) -->
        <div class="schedule-total-wrapper">
          ${this.currentPlan ? this.renderSchedule(this.currentPlan, lang) : ''}
          ${this.currentPlan ? this.renderTotalBlock(this.currentPlan, lang) : ''}
        </div>
        ${this.renderInfoSection(lang)}
        ${this.cardsList && this.cardsList.length > 0
          ? html`
              <div class="cards-row">
                <div class="cards-container">
                  ${this.cardsList.map(
                    (card) =>
                      html`<div
                        class="card-icon card-${card}"
                        role="img"
                        aria-label="${card}"
                      ></div>`,
                  )}
                </div>
              </div>
            `
          : ''}
        <div class="logo-row">${this.renderAlmaLogo()}</div>
      </div>
    `
  }

  /**
   * Main render method - renders only the appropriate layout (desktop or mobile)
   * No DOM elements are created for the unused layout (better for accessibility)
   */
  render() {
    const lang = (this.locale.split('-')[0] as I18nLocale) || ('fr' as I18nLocale)

    return html`
      <div
        class="modal-overlay ${this.isOpen ? 'open' : ''}"
        @click=${this.handleOverlayClick}
        @keydown=${this.handleKeyDown}
        aria-hidden="${!this.isOpen}"
      >
        ${this.isMobile
          ? html`
              <!-- MOBILE LAYOUT (rendered only on <800px) -->
              <div
                class="modal modal-mobile"
                role="dialog"
                aria-modal="${this.isOpen}"
                aria-labelledby="modal-title"
              >
                ${this.renderSkipLinks(lang)} ${this.renderCloseButton(lang)}
                ${this.renderMobileModal(lang)}
              </div>
            `
          : html`
              <!-- DESKTOP LAYOUT (rendered only on 800px+) -->
              <div
                class="modal modal-desktop"
                role="dialog"
                aria-modal="${this.isOpen}"
                aria-labelledby="modal-title"
              >
                ${this.renderSkipLinks(lang)} ${this.renderCloseButton(lang)}
                ${this.renderDesktopModal(lang)}
              </div>
            `}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'alma-modal': AlmaModal
  }
}
