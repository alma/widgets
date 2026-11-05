import { nothing, type PropertyValues, render } from 'lit'
import { property, state } from 'lit/decorators.js'

import { type ConfigPlan, filterEligiblePlans, isSomePlanDeferred } from '@/domain/plans'
import { createIntl, isValidLocale } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { warnOnce } from '@/shared/lib/errors'
import { withReactEventMembers } from '@/shared/lib/react-event'
import type { Card } from '@/shared/ui/icons/cards/cards.types'
import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { safeCustomElement } from '@/shared/ui/lit/safe-custom-element'
import { MediaQueryController } from '@/shared/ui/media-query.controller'
import { type ApiData, EligibilityController } from '@/widgets/common/eligibility.controller'
import { ModalPortalController } from '@/widgets/eligibility-modal/controllers/modal-portal.controller'
import {
  desktopMediaQuery,
  ELIGIBILITY_MODAL_TAG,
} from '@/widgets/eligibility-modal/eligibility-modal.const'
import { modalContentTemplate } from '@/widgets/eligibility-modal/templates/modal-content.template'

// Master's ModalContainer props, and the locale of its IntlProvider. Frozen for 4.x.
export interface AlmaEligibilityModalProperties {
  purchaseAmount: number
  apiData?: ApiData
  configPlans?: ConfigPlan[]
  customerBillingCountry?: string
  customerShippingCountry?: string
  merchantCoversAllFees?: boolean
  cards?: Card[]
  locale: string
  onClose?: (event: MouseEvent | KeyboardEvent) => void
}

const portals = new WeakMap<Element, ModalPortalController>()

// Master unmounts the modal at once when the facade replaces or closes it. A host removed any other
// way closes its modal a microtask later, so a host put back in the same task keeps it, as on master.
export const closeModalOf = (host: Element): void => {
  portals.get(host)?.close()
}

// The standalone modal of add(Modal). It renders nothing in its container and the modal at the end
// of <body>.
@safeCustomElement(ELIGIBILITY_MODAL_TAG)
export class AlmaEligibilityModal
  extends LightDomElement
  implements AlmaEligibilityModalProperties
{
  @property({ attribute: false }) purchaseAmount!: number

  @property({ attribute: false }) apiData?: ApiData

  @property({ attribute: false }) configPlans?: ConfigPlan[]

  @property({ attribute: false }) customerBillingCountry?: string

  @property({ attribute: false }) customerShippingCountry?: string

  @property({ attribute: false }) merchantCoversAllFees?: boolean

  @property({ attribute: false }) cards?: Card[]

  // Master's next render shows the modal once the locale is valid, so a host that couldn't open
  // opens when one arrives.
  @property({ attribute: false })
  get locale(): string {
    return this.currentLocale
  }

  set locale(locale: string) {
    this.currentLocale = locale
    if (this.isConnected && !this.portal.isOpen) {
      this.open()
    }
  }

  @property({ attribute: false }) onClose?: (event: MouseEvent | KeyboardEvent) => void

  // Among the eligible plans.
  @state() private currentPlanIndex = 0

  // Starts on the first valid connect only.
  private readonly eligibility = new EligibilityController(this)

  private readonly bigScreen = new MediaQueryController(this, desktopMediaQuery)

  private readonly portal = new ModalPortalController(this, (event) => this.requestClose(event))

  private currentLocale: string = Locale.en

  constructor() {
    super()
    portals.set(this, this.portal)
  }

  override connectedCallback(): void {
    this.open()
  }

  private open(): void {
    // Master throws while it renders, before its request, and shows no modal.
    if (!isValidLocale(this.locale)) {
      warnOnce(`The modal doesn't open: "${this.locale}" is not a valid locale.`)
      return
    }
    super.connectedCallback()
    this.portal.open()
  }

  protected override render() {
    return nothing
  }

  protected override update(changedProperties: PropertyValues): void {
    super.update(changedProperties)
    const { plans, status } = this.eligibility
    render(
      modalContentTemplate({
        eligiblePlans: filterEligiblePlans(plans),
        isSomePlanDeferred: isSomePlanDeferred(plans),
        status,
        currentPlanIndex: this.currentPlanIndex,
        setCurrentPlanIndex: this.setCurrentPlanIndex,
        isBigScreen: this.bigScreen.matches,
        cards: this.cards,
        onClose: this.requestClose,
        intl: createIntl(this.locale),
      }),
      this.portal.content,
    )
  }

  private readonly setCurrentPlanIndex = (index: number): Promise<boolean> => {
    this.currentPlanIndex = index
    return this.updateComplete
  }

  private readonly requestClose = (event: MouseEvent | KeyboardEvent): void => {
    this.onClose?.(withReactEventMembers(event))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [ELIGIBILITY_MODAL_TAG]: AlmaEligibilityModal
  }
}
