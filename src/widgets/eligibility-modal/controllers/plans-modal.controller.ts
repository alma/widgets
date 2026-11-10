import { render } from 'lit'

import type { statusResponse } from '@/domain/plans/api/eligibility.const'
import { isSomePlanDeferred } from '@/domain/plans/plan-kind'
import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import type { Card } from '@/shared/ui/icons/cards/cards.types'
import { type MediaQueryWatch, watchMediaQuery } from '@/shared/ui/watch-media-query'
import {
  ModalPortalController,
  type ModalPortalHost,
  type RequestClose,
} from '@/widgets/eligibility-modal/controllers/modal-portal.controller'
import { desktopMediaQuery } from '@/widgets/eligibility-modal/eligibility-modal.const'
import { modalContentTemplate } from '@/widgets/eligibility-modal/templates/modal-content.template'

export type PlansModalHost = ModalPortalHost

export interface PlansModalParams {
  // Master's PaymentPlans passes its eligible plans only, so isSomePlanDeferred skips the others.
  eligiblePlans: EligibilityPlanToDisplay[]
  status: statusResponse
  // Among the eligible plans. Called when the modal opens only, like master's useState.
  initialPlanIndex: () => number
  cards?: Card[]
  intl: IntlShape
}

// Master's EligibilityModal on the host's plans, so no request.
// A tab change re-renders the portal, not the host.
export class PlansModalController {
  private readonly onRequestClose: RequestClose

  private readonly onDismiss?: () => void

  private readonly portal: ModalPortalController

  // Only while open, like master's useMediaQuery inside the modal.
  // A disconnect closes the modal, which stops it (ARCH-12).
  private bigScreen: MediaQueryWatch | null = null

  private params: PlansModalParams | undefined

  private currentPlanIndex = 0

  private isSyncing = false

  // onDismiss: closed by a disconnect or closeModalOf(), not by sync().
  constructor(host: PlansModalHost, onRequestClose: RequestClose, onDismiss?: () => void) {
    this.onRequestClose = onRequestClose
    this.onDismiss = onDismiss
    this.portal = new ModalPortalController(host, onRequestClose, this.handleClosed)
  }

  get isOpen(): boolean {
    return this.portal.isOpen
  }

  // Call it after each update of the host.
  sync(params?: PlansModalParams): void {
    this.params = params
    if (!params) {
      this.isSyncing = true
      try {
        this.portal.close()
      } finally {
        this.isSyncing = false
      }
      return
    }
    if (!this.portal.isOpen) {
      this.currentPlanIndex = params.initialPlanIndex()
      this.portal.open()
      // A disconnected host can't open it.
      if (!this.portal.isOpen) return
      this.bigScreen = watchMediaQuery(desktopMediaQuery, this.renderContent)
    }
    this.renderContent()
  }

  private readonly renderContent = (): void => {
    const { params } = this
    if (!params || !this.portal.isOpen) return
    render(
      modalContentTemplate({
        eligiblePlans: params.eligiblePlans,
        isSomePlanDeferred: isSomePlanDeferred(params.eligiblePlans),
        status: params.status,
        currentPlanIndex: this.currentPlanIndex,
        setCurrentPlanIndex: this.setCurrentPlanIndex,
        isBigScreen: this.bigScreen?.matches ?? false,
        cards: params.cards,
        onClose: this.onRequestClose,
        intl: params.intl,
      }),
      this.portal.content,
    )
  }

  private readonly setCurrentPlanIndex = (index: number): void => {
    this.currentPlanIndex = index
    this.renderContent()
  }

  private readonly handleClosed = (): void => {
    this.bigScreen?.stop()
    this.bigScreen = null
    if (!this.isSyncing) {
      this.onDismiss?.()
    }
  }
}
