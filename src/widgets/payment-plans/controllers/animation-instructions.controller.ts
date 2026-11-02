import type { ReactiveController, ReactiveControllerHost } from 'lit'

import { statusResponse } from '@/domain/plans'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { animationInstructionsMessages } from '@/widgets/payment-plans/controllers/animation-instructions.messages'
import { AnnounceController } from '@/widgets/payment-plans/controllers/announce.controller'

export type AnimationInstructionsInputs = {
  status: statusResponse
  hasUserInteracted: boolean
  eligiblePlansCount: number
  // The merchant's raw option. Master checks it before a suggested plan or the default replaces it.
  transitionDelay?: number
  intl: IntlShape
}

const ANNOUNCE_DELAY_MS = 1500
const ANNOUNCE_DURATION_MS = 2000

const sameInputs = (a: AnimationInstructionsInputs, b: AnimationInstructionsInputs): boolean =>
  a.status === b.status &&
  a.hasUserInteracted === b.hasUserInteracted &&
  a.eligiblePlansCount === b.eligiblePlansCount &&
  a.transitionDelay === b.transitionDelay &&
  // createIntl caches one instance per locale, so this compares the locales.
  a.intl === b.intl

const shouldAnnounce = (inputs: AnimationInstructionsInputs): boolean =>
  inputs.status === statusResponse.SUCCESS &&
  !inputs.hasUserInteracted &&
  inputs.eligiblePlansCount > 1 &&
  inputs.transitionDelay !== -1

// Tells screen readers how to stop the plan cycling, 1500 ms after the plans show.
export class AnimationInstructionsController implements ReactiveController {
  private readonly host: ReactiveControllerHost

  private readonly getInputs: () => AnimationInstructionsInputs

  // As on master, the instructions have their own announcer, which no element renders.
  private readonly announcer: AnnounceController

  private inputs: AnimationInstructionsInputs | undefined

  private connected = false

  private timer: ReturnType<typeof setTimeout> | undefined

  constructor(host: ReactiveControllerHost, getInputs: () => AnimationInstructionsInputs) {
    this.host = host
    this.getInputs = getInputs
    host.addController(this)
    this.announcer = new AnnounceController(host)
  }

  hostConnected(): void {
    this.connected = true
    // Checks the inputs that changed while the host was out of the page. Unchanged inputs schedule
    // nothing.
    this.host.requestUpdate()
  }

  hostDisconnected(): void {
    this.connected = false
    this.cancel()
  }

  hostUpdated(): void {
    if (!this.connected) return
    const inputs = this.getInputs()
    if (this.inputs && sameInputs(this.inputs, inputs)) return
    this.inputs = inputs
    this.cancel()
    if (!shouldAnnounce(inputs)) return
    const text = inputs.intl.formatMessage(animationInstructionsMessages.instructions)
    this.timer = setTimeout(() => {
      this.timer = undefined
      this.announcer.announce(text, ANNOUNCE_DURATION_MS)
    }, ANNOUNCE_DELAY_MS)
  }

  private cancel(): void {
    clearTimeout(this.timer)
    this.timer = undefined
  }
}
