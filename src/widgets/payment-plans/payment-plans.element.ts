import { nothing, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'

import {
  type ConfigPlan,
  type EligibilityPlanToDisplay,
  filterEligiblePlans,
  requiresLegalDisclosure,
  statusResponse,
} from '@/domain/plans'
import { createIntl, isValidLocale } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { warnOnce } from '@/shared/lib/errors'
import type { Card } from '@/shared/ui/icons/cards/cards.types'
import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { safeCustomElement } from '@/shared/ui/lit/safe-custom-element'
import { type ApiData, EligibilityController } from '@/widgets/common/eligibility.controller'
import { paymentPlanInfoTextTemplate } from '@/widgets/common/plan-strings.template'
import { getPlanDescription } from '@/widgets/common/plan-text'
import { getIndexOfActivePlan } from '@/widgets/payment-plans/active-plan'
import { AnimationInstructionsController } from '@/widgets/payment-plans/controllers/animation-instructions.controller'
import { AnnounceController } from '@/widgets/payment-plans/controllers/announce.controller'
import { PlanCyclingController } from '@/widgets/payment-plans/controllers/plan-cycling.controller'
import { PAYMENT_PLANS_TAG } from '@/widgets/payment-plans/payment-plans.const'
import { paymentPlansMessages } from '@/widgets/payment-plans/payment-plans.messages'
import {
  plansLoadingTemplate,
  plansContentTemplate,
} from '@/widgets/payment-plans/templates/plans-content.template'

const DEFAULT_TRANSITION_TIME = 5500
const ANNOUNCE_DURATION_MS = 1000

type OpenEvent = MouseEvent | KeyboardEvent

interface PlanLists {
  eligiblePlans: EligibilityPlanToDisplay[]
  plansToDisplay: EligibilityPlanToDisplay[]
  eligiblePlanKeys: number[]
}

// Master's PaymentPlanWidget props, plus the locale of its IntlProvider. Frozen for 4.x.
export interface AlmaPaymentPlansProperties {
  purchaseAmount: number
  apiData?: ApiData
  configPlans?: ConfigPlan[]
  transitionDelay?: number
  customerBillingCountry?: string
  customerShippingCountry?: string
  merchantCoversAllFees?: boolean
  hideIfNotEligible?: boolean
  monochrome?: boolean
  suggestedPaymentPlan?: number | number[]
  cards?: Card[]
  hideBorder: boolean
  onModalClose?: (event: MouseEvent | KeyboardEvent) => void
  locale: string
}

@safeCustomElement(PAYMENT_PLANS_TAG)
export class AlmaPaymentPlans extends LightDomElement implements AlmaPaymentPlansProperties {
  @property({ attribute: false }) purchaseAmount!: number

  @property({ attribute: false }) apiData?: ApiData

  @property({ attribute: false }) configPlans?: ConfigPlan[]

  @property({ attribute: false }) transitionDelay?: number

  @property({ attribute: false }) customerBillingCountry?: string

  @property({ attribute: false }) customerShippingCountry?: string

  @property({ attribute: false }) merchantCoversAllFees?: boolean

  @property({ attribute: false }) hideIfNotEligible?: boolean

  @property({ attribute: false }) monochrome?: boolean

  @property({ attribute: false }) suggestedPaymentPlan?: number | number[]

  @property({ attribute: false }) cards?: Card[]

  @property({ attribute: false }) hideBorder = false

  @property({ attribute: false }) onModalClose?: AlmaPaymentPlansProperties['onModalClose']

  @property({ attribute: false }) locale: string = Locale.en

  // Stops the cycle for good, unlike a hover that the cycle resumes after.
  @state() private hasUserInteracted = false

  // The modal itself isn't rendered yet.
  @state() private isOpen = false

  private readonly eligibility = new EligibilityController(this)

  private readonly cycling = new PlanCyclingController(this, () => ({
    iterateValues: this.eligiblePlanKeys,
    transitionDelay: this.realTransitionTime,
  }))

  private readonly announcer = new AnnounceController(this)

  private readonly animationInstructions = new AnimationInstructionsController(this, () => ({
    status: this.eligibility.status,
    hasUserInteracted: this.hasUserInteracted,
    eligiblePlansCount: this.eligiblePlans.length,
    transitionDelay: this.transitionDelay,
    intl: this.intl,
  }))

  private previousStatus: statusResponse | undefined

  private planListsCache: { plans: EligibilityPlanToDisplay[]; lists: PlanLists } | undefined

  // The current plan, status and locale of the last announcement.
  private announced: string | undefined

  // Master throws on a locale that Intl rejects, such as `fr_FR` or null.
  private get hasValidLocale(): boolean {
    return isValidLocale(this.locale)
  }

  // English for an invalid locale, so createIntl adds no warning to the one of render().
  private get intl(): IntlShape {
    return createIntl(this.hasValidLocale ? this.locale : Locale.en)
  }

  // Master's useMemo: recomputed only when the eligibility controller gives new plans.
  private get planLists(): PlanLists {
    const { plans } = this.eligibility
    if (this.planListsCache?.plans !== plans) {
      // filterEligibility hides the plans that are ineligible for another reason than the amount.
      const plansToDisplay = plans.filter((plan) => !plan.hidden)
      this.planListsCache = {
        plans,
        lists: {
          eligiblePlans: filterEligiblePlans(plans),
          plansToDisplay,
          eligiblePlanKeys: plansToDisplay.reduce<number[]>(
            (keys, plan, index) => (plan.eligible ? [...keys, index] : keys),
            [],
          ),
        },
      }
    }
    return this.planListsCache.lists
  }

  private get eligiblePlans(): EligibilityPlanToDisplay[] {
    return this.planLists.eligiblePlans
  }

  private get plansToDisplay(): EligibilityPlanToDisplay[] {
    return this.planLists.plansToDisplay
  }

  private get eligiblePlanKeys(): number[] {
    return this.planLists.eligiblePlanKeys
  }

  // A suggested plan without a delay turns cycling off.
  private get realTransitionTime(): number {
    if (this.suggestedPaymentPlan !== undefined && !this.transitionDelay) {
      return -1
    }
    return this.transitionDelay ?? DEFAULT_TRANSITION_TIME
  }

  // Master's two effects, in master's order. Each runs after the render and causes another one, as
  // on master, where the cycling countdown restarts on each render.
  protected override updated(): void {
    // Lit still updates a removed host, such as when the response comes after the merchant emptied
    // the container. The effects wait for the reconnect, which updates the host again.
    if (!this.isConnected) return
    this.announceCurrentPlan()
    this.applySuggestedPlan()
  }

  // Master's effect on the current plan, the locale and the status.
  private announceCurrentPlan(): void {
    const { status } = this.eligibility
    const { current } = this.cycling
    const key = `${current}|${status}|${this.locale}`
    if (key === this.announced) return
    this.announced = key
    if (!this.hasValidLocale) return
    const plan = this.plansToDisplay[current]
    if (!plan || status !== statusResponse.SUCCESS) return
    const intl = this.intl
    this.announcer.announce(
      intl.formatMessage(paymentPlansMessages.planSelectionChanged, {
        planDescription: getPlanDescription(plan, intl),
      }),
      ANNOUNCE_DURATION_MS,
    )
  }

  // Master's effect on the status. The first render of the plans shows, and announces, the plan
  // that the cycle starts on, before the suggested plan replaces it.
  private applySuggestedPlan(): void {
    const { status } = this.eligibility
    if (status === this.previousStatus) return
    this.previousStatus = status
    if (status !== statusResponse.SUCCESS || this.suggestedPaymentPlan === undefined) return
    this.cycling.onHover(
      getIndexOfActivePlan({
        eligibilityPlans: this.plansToDisplay,
        suggestedPaymentPlan: this.suggestedPaymentPlan ?? 0,
      }),
    )
    this.cycling.onLeave()
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hasValidLocale) {
      warnOnce(`The widget shows nothing: "${this.locale}" is not a valid locale.`)
      return nothing
    }
    const { intl } = this
    const { status } = this.eligibility
    if (status === statusResponse.PENDING) {
      return plansLoadingTemplate()
    }
    const { eligiblePlans, plansToDisplay } = this
    if (
      (this.hideIfNotEligible && eligiblePlans.length === 0) ||
      plansToDisplay.length === 0 ||
      status === statusResponse.FAILED
    ) {
      return nothing
    }
    const { current } = this.cycling
    const currentPlan: EligibilityPlanToDisplay | undefined = plansToDisplay[current]
    const isInfoClickable =
      eligiblePlans.length > 0 && !!currentPlan?.eligible && requiresLegalDisclosure(currentPlan)
    return plansContentTemplate(
      {
        plans: plansToDisplay,
        current,
        monochrome: this.monochrome,
        hideBorder: this.hideBorder,
        isInfoClickable,
        info: this.renderInfo(currentPlan, intl),
        announceText: this.announcer.text,
        onOpenModal: this.handleOpenModal,
        onPlanHover: this.handleUserHover,
        onPlanLeave: this.handleUserLeave,
        onPlanKeyDown: this.handlePlanKeyDown,
        onPlanClick: this.handlePlanClick,
      },
      intl,
    )
  }

  // Master throws, such as for an eligible plan without payment_plan. The error says why.
  private renderInfo(
    plan: EligibilityPlanToDisplay | undefined,
    intl: IntlShape,
  ): TemplateResult | typeof nothing {
    if (!plan) return nothing
    try {
      return paymentPlanInfoTextTemplate({ plan, intl })
    } catch (error) {
      warnOnce('The payment information could not be shown.', error)
      return nothing
    }
  }

  private openModal(): void {
    this.isOpen = true
  }

  private readonly handleOpenModal = (event: OpenEvent): void => {
    event.preventDefault()
    if (this.eligiblePlans.length > 0) {
      this.openModal()
    }
  }

  private readonly handleUserHover = (index: number): void => {
    this.hasUserInteracted = true
    this.cycling.onHover(index)
  }

  private readonly handleUserLeave = (): void => {
    if (!this.hasUserInteracted) {
      this.cycling.onLeave()
    }
  }

  private readonly handlePlanClick = (event: MouseEvent, index: number): void => {
    event.stopPropagation()
    if (!this.plansToDisplay[index]?.eligible) return
    this.cycling.onHover(index)
    if (this.eligiblePlans.length > 0) {
      this.openModal()
    }
  }

  private readonly handlePlanKeyDown = (event: KeyboardEvent, index: number): void => {
    if (!this.plansToDisplay[index]?.eligible) return
    const keys = this.eligiblePlanKeys
    const position = keys.indexOf(index)
    const targets: Record<string, number | undefined> = {
      // No wrap: undefined past either end.
      ArrowLeft: keys[position - 1],
      ArrowRight: keys[position + 1],
      Home: keys[0],
      End: keys[keys.length - 1],
    }
    if (!(event.key in targets)) return
    event.preventDefault()
    const target = targets[event.key]
    if (target === undefined) return
    this.hasUserInteracted = true
    this.cycling.onHover(target)
    this.querySelectorAll<HTMLButtonElement>('[role="option"]')[target]?.focus()
  }
}

// Dev builds only. The second render after an announcement is master's, on purpose.
AlmaPaymentPlans.disableWarning?.('change-in-update')

declare global {
  interface HTMLElementTagNameMap {
    [PAYMENT_PLANS_TAG]: AlmaPaymentPlans
  }
}
