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
import { designTokensStyles } from './styles/design-tokens.styles'
import { sharedStyles } from './styles/shared.styles'
import { scheduleStyles } from './styles/schedule.styles'

@customElement('alma-schedule')
export class AlmaSchedule extends LitElement {
  @property({ type: Number, attribute: 'purchase-amount' }) purchaseAmount = 0
  @property({ type: Number, attribute: 'installments-count' }) installmentsCount = 0
  @property({ type: Number, attribute: 'deferred-days' }) deferredDays = 0
  @property({ type: Number, attribute: 'deferred-months' }) deferredMonths = 0
  @property({ type: String }) locale: Locale = 'fr'
  @property({ type: String }) plans?: string
  @property({ type: String, attribute: 'customer-billing-country' }) customerBillingCountry?: string
  @property({ type: String, attribute: 'customer-shipping-country' })
  customerShippingCountry?: string
  @property({ type: Boolean, attribute: 'merchant-covers-all-fees' })
  merchantCoversAllFees?: boolean
  @property({ type: Boolean }) small = false
  @property({ type: Boolean }) monochrome = false
  @property({ type: Boolean, attribute: 'hide-border' }) hideBorder = false

  @state() private loading = false
  @state() private error = false
  @state() private schedulePlan: EligibilityPlan | null = null
  @state() private eligibilityPlans: EligibilityPlan[] = []
  @state() private currentPlanIndex = 0

  static styles = [designTokensStyles, sharedStyles, scheduleStyles]

  private get configPlans(): ConfigPlan[] | undefined {
    return parseConfigAttribute<ConfigPlan[]>(this.plans)
  }

  private get isSelectorMode(): boolean {
    return this.installmentsCount <= 0
  }

  async connectedCallback() {
    super.connectedCallback()
    if (this.purchaseAmount > 0 && (this.installmentsCount > 0 || this.isSelectorMode)) {
      await this.loadEligibility()
    }
  }

  async updated(changedProperties: PropertyValues) {
    const relevant = [
      'purchaseAmount',
      'installmentsCount',
      'deferredDays',
      'deferredMonths',
      'customerBillingCountry',
      'customerShippingCountry',
      'merchantCoversAllFees',
      'plans',
    ]

    if (relevant.some((key) => changedProperties.has(key as any))) {
      if (this.purchaseAmount > 0 && (this.installmentsCount > 0 || this.isSelectorMode)) {
        await this.loadEligibility()
      } else {
        this.schedulePlan = null
        this.eligibilityPlans = []
        this.loading = false
      }
    }
  }

  private get planQuery(): ConfigPlan[] | undefined {
    if (this.isSelectorMode) {
      return this.configPlans && this.configPlans.length > 0 ? this.configPlans : undefined
    }

    return [
      {
        installmentsCount: this.installmentsCount,
        deferredDays: this.deferredDays || 0,
        deferredMonths: this.deferredMonths || 0,
        minAmount: 0,
        maxAmount: 0,
      },
    ]
  }

  private async loadEligibility() {
    this.loading = true
    this.error = false

    const config = getWidgetConfig()
    if (!config) {
      this.error = true
      this.loading = false
      return
    }

    try {
      const plans = await fetchEligibility(
        config.apiMode,
        config.merchantId,
        this.purchaseAmount,
        this.planQuery,
        this.customerBillingCountry,
        this.customerShippingCountry,
        this.merchantCoversAllFees,
      )

      if (this.isSelectorMode) {
        const eligiblePlans = sortPlans(
          plans
            .filter((plan) => plan.eligible)
            .filter(
              (plan) => !isPayNowPlan(plan) || isPayNowExplicitlyConfigured(this.configPlans),
            ),
        )

        this.eligibilityPlans = eligiblePlans
        if (this.currentPlanIndex >= eligiblePlans.length) {
          this.currentPlanIndex = 0
        }
        this.schedulePlan = eligiblePlans[this.currentPlanIndex] ?? null
        return
      }

      const match = plans.find(
        (plan) =>
          plan.installments_count === this.installmentsCount &&
          plan.deferred_days === (this.deferredDays || 0) &&
          plan.deferred_months === (this.deferredMonths || 0) &&
          plan.eligible,
      )

      this.schedulePlan = match || null
      this.eligibilityPlans = []
    } catch (err) {
      this.error = true
      this.schedulePlan = null
      this.eligibilityPlans = []
    } finally {
      this.loading = false
    }
  }

  private formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString(this.locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  private isToday(timestamp: number): boolean {
    const date = new Date(timestamp * 1000)
    const today = new Date()

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  private getTAEG(plan: EligibilityPlan): number {
    return plan.annual_interest_rate ? plan.annual_interest_rate / 10000 : 0
  }

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
        <div id="payment-schedule-title" class="sr-only" role="heading" aria-level="2">
          ${t(lang, 'modal.scheduleTitle')}
        </div>
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

  private renderCreditLegalText(
    plan: EligibilityPlan,
    lang: I18nLocale,
    totalWithoutFirstInstallment: number,
    firstInstallmentAmount: number,
    productPriceWithoutCreditCost: number,
    taeg: number,
  ) {
    const template = t(lang, 'modal.creditLegalText' as any) || ''

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

  private renderTotalBlock(plan: EligibilityPlan, lang: I18nLocale) {
    const isCredit = plan.installments_count > 4
    const total = plan.purchase_amount + plan.customer_total_cost_amount
    const fees = plan.customer_total_cost_amount
    const taeg = this.getTAEG(plan)

    const firstInstallmentAmount = plan.payment_plan?.[0]?.total_amount || 0
    const totalWithoutFirstInstallment =
      plan.purchase_amount + plan.customer_total_cost_amount - firstInstallmentAmount
    const productPriceWithoutCreditCost = plan.purchase_amount

    return html`
      ${isCredit
        ? html`
            <div class="credit-info">
              <span class="credit-info-title">${t(lang, 'modal.creditWarningTitle')}</span>
              <br />
              ${t(lang, 'modal.creditWarning')}
            </div>
          `
        : ''}

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
   * Build CSS class string based on active variants
   */
  private getCssClass(): string {
    const classes = ['schedule-widget']
    if (this.small) classes.push('small')
    if (this.monochrome) classes.push('monochrome')
    if (this.hideBorder) classes.push('hide-border')
    return classes.join(' ')
  }

  /**
   * Render loading, error, or empty state
   */
  private renderEmptyState(lang: I18nLocale, type: 'loading' | 'error' | 'no-plans') {
    const messages = {
      loading: t(lang, 'modal.loading'),
      error: t(lang, 'paymentPlans.error'),
      'no-plans': t(lang, 'modal.noPlans'),
    }

    return html`
      <div class="${this.getCssClass()}">
        <div class="${type}">${messages[type]}</div>
      </div>
    `
  }

  private renderPlanButtons(lang: I18nLocale) {
    return html`
      <div class="plan-buttons" role="group" aria-label="${t(lang, 'modal.planOptions')}">
        <div class="plan-buttons-container">
          ${this.eligibilityPlans.map(
            (plan, index) => html`
              <button
                type="button"
                class="plan-button ${index === this.currentPlanIndex ? 'active' : ''}"
                @click=${() => {
                  this.currentPlanIndex = index
                  this.schedulePlan = this.eligibilityPlans[index] ?? null
                }}
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

  render() {
    const lang = (this.locale.split('-')[0] as I18nLocale) || ('fr' as I18nLocale)

    if (this.loading) return this.renderEmptyState(lang, 'loading')
    if (this.error) return this.renderEmptyState(lang, 'error')
    if (!this.schedulePlan) return this.renderEmptyState(lang, 'no-plans')

    return html`
      <div
        class="${this.getCssClass()}"
        role="region"
        aria-label="${t(lang, 'modal.scheduleTitle')}"
      >
        ${this.isSelectorMode ? this.renderPlanButtons(lang) : ''}
        <div class="schedule-total-wrapper">
          ${this.renderSchedule(this.schedulePlan, lang)}
          ${this.renderTotalBlock(this.schedulePlan, lang)}
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'alma-schedule': AlmaSchedule
  }
}
