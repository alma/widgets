import { html } from 'lit'

import { statusResponse } from '@/domain/plans'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import {
  type AnimationInstructionsInputs,
  AnimationInstructionsController,
} from '@/widgets/payment-plans/controllers/animation-instructions.controller'
import { animationInstructionsMessages } from '@/widgets/payment-plans/controllers/animation-instructions.messages'
import { AnnounceController } from '@/widgets/payment-plans/controllers/announce.controller'

// Master's tests render in French.
const intl = createIntl(Locale.fr)

const INSTRUCTIONS =
  "Animation automatique des plans de paiement active. Survolez ou naviguez avec les flèches pour arrêter l'animation."

const defaultProps: AnimationInstructionsInputs = {
  status: statusResponse.SUCCESS,
  hasUserInteracted: false,
  eligiblePlansCount: 2,
  transitionDelay: 5000,
  intl,
}

class AnimationInstructionsHost extends LightDomElement {
  props: AnimationInstructionsInputs = defaultProps

  readonly instructions = new AnimationInstructionsController(this, () => this.props)

  setProps(props: Partial<AnimationInstructionsInputs>): Promise<boolean> {
    this.props = { ...this.props, ...props }
    this.requestUpdate()
    return this.updateComplete
  }

  protected override render() {
    return html``
  }
}
customElements.define('test-animation-instructions-host', AnimationInstructionsHost)

const appendHost = async (
  props: Partial<AnimationInstructionsInputs> = {},
): Promise<AnimationInstructionsHost> => {
  const host = document.createElement(
    'test-animation-instructions-host',
  ) as AnimationInstructionsHost
  host.props = { ...defaultProps, ...props }
  document.body.append(host)
  await host.updateComplete
  return host
}

describe('AnimationInstructionsController', () => {
  let mockFormatMessage: ReturnType<typeof vi.spyOn>
  let mockAnnounce: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    mockFormatMessage = vi.spyOn(intl, 'formatMessage')
    mockAnnounce = vi.spyOn(AnnounceController.prototype, 'announce')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('when conditions are met for announcing instructions', () => {
    it('should announce instructions after delay when all conditions are met', async () => {
      await appendHost()

      // Verify formatMessage is called with correct parameters
      expect(mockFormatMessage).toHaveBeenCalledWith(animationInstructionsMessages.instructions)

      // Initially, announce should not be called
      expect(mockAnnounce).not.toHaveBeenCalled()

      // Fast forward to the announcement delay
      vi.advanceTimersByTime(1500)

      // Now announce should be called with the formatted message
      expect(mockAnnounce).toHaveBeenCalledWith(INSTRUCTIONS, 2000)
    })

    it('should clear timeout on unmount', async () => {
      const host = await appendHost()

      // Start the timer
      vi.advanceTimersByTime(1000)

      // Unmount before timer completes
      host.remove()

      // Continue to when timer would have completed
      vi.advanceTimersByTime(1000)

      // Announce should not be called since component was unmounted
      expect(mockAnnounce).not.toHaveBeenCalled()
    })

    it('should clear previous timeout when dependencies change', async () => {
      const host = await appendHost()

      // Start first timer
      vi.advanceTimersByTime(1000)

      // Change props to retrigger effect
      await host.setProps({ eligiblePlansCount: 3 })

      // Advance to where first timer would have completed
      vi.advanceTimersByTime(500)

      // Should not announce yet (first timer was cleared)
      expect(mockAnnounce).not.toHaveBeenCalled()

      // Advance to where second timer completes
      vi.advanceTimersByTime(1000)

      // Should announce once with the new message
      expect(mockAnnounce).toHaveBeenCalledTimes(1)
      expect(mockAnnounce).toHaveBeenCalledWith(INSTRUCTIONS, 2000)
    })
  })

  describe('when conditions are not met', () => {
    it('should not announce when status is not SUCCESS', async () => {
      await appendHost({ status: statusResponse.PENDING })

      vi.advanceTimersByTime(2000)

      expect(mockFormatMessage).not.toHaveBeenCalled()
      expect(mockAnnounce).not.toHaveBeenCalled()
    })

    it('should not announce when user has already interacted', async () => {
      await appendHost({ hasUserInteracted: true })

      vi.advanceTimersByTime(2000)

      expect(mockFormatMessage).not.toHaveBeenCalled()
      expect(mockAnnounce).not.toHaveBeenCalled()
    })

    it('should not announce when there is only one eligible plan', async () => {
      await appendHost({ eligiblePlansCount: 1 })

      vi.advanceTimersByTime(2000)

      expect(mockFormatMessage).not.toHaveBeenCalled()
      expect(mockAnnounce).not.toHaveBeenCalled()
    })

    it('should not announce when animation is disabled (transitionDelay is -1)', async () => {
      await appendHost({ transitionDelay: -1 })

      vi.advanceTimersByTime(2000)

      expect(mockFormatMessage).not.toHaveBeenCalled()
      expect(mockAnnounce).not.toHaveBeenCalled()
    })

    it('should announce when transitionDelay is undefined (animation enabled)', async () => {
      await appendHost({ transitionDelay: undefined })

      vi.advanceTimersByTime(1500)

      // With undefined transitionDelay, animation should be enabled, so announcement should happen
      expect(mockFormatMessage).toHaveBeenCalled()
      expect(mockAnnounce).toHaveBeenCalledWith(INSTRUCTIONS, 2000)
    })
  })

  describe('timing behavior', () => {
    it('should use correct announcement delay (1500ms)', async () => {
      await appendHost()

      // Should not announce before delay
      vi.advanceTimersByTime(1400)
      expect(mockAnnounce).not.toHaveBeenCalled()

      // Should announce after delay
      vi.advanceTimersByTime(100)
      expect(mockAnnounce).toHaveBeenCalled()
    })

    it('should use correct announcement duration (2000ms)', async () => {
      await appendHost()

      vi.advanceTimersByTime(1500)

      expect(mockAnnounce).toHaveBeenCalledWith(INSTRUCTIONS, 2000)
    })
  })

  describe('lifecycle', () => {
    it('should announce once, at 1500 ms, for 2000 ms', async () => {
      const host = await appendHost()

      vi.advanceTimersByTime(1500)
      await host.updateComplete
      vi.advanceTimersByTime(10_000)

      expect(mockAnnounce).toHaveBeenCalledOnce()
      expect(vi.getTimerCount()).toBe(0)
    })

    it('should check again only when an input or the locale changes', async () => {
      const host = await appendHost()

      vi.advanceTimersByTime(1000)
      await host.setProps({ ...defaultProps })
      vi.advanceTimersByTime(500)
      expect(mockAnnounce).toHaveBeenCalledOnce()

      await host.setProps({ intl: createIntl(Locale.en) })
      vi.advanceTimersByTime(1500)
      expect(mockAnnounce).toHaveBeenCalledTimes(2)
      expect(mockAnnounce).toHaveBeenLastCalledWith(
        'Automatic animation of payment plans active. Hover or navigate with the arrows to stop animation.',
        2000,
      )
    })

    it('should cancel the pending timer when a condition stops holding', async () => {
      const host = await appendHost()

      await host.setProps({ hasUserInteracted: true })
      vi.advanceTimersByTime(5000)

      expect(mockAnnounce).not.toHaveBeenCalled()
      expect(vi.getTimerCount()).toBe(0)
    })

    it('should leave no timer once the host is removed', async () => {
      const host = await appendHost()
      vi.advanceTimersByTime(1500)

      host.remove()

      expect(vi.getTimerCount()).toBe(0)
    })

    it('should not schedule the instructions again when the host comes back', async () => {
      const host = await appendHost()
      vi.advanceTimersByTime(1000)
      host.remove()

      document.body.append(host)
      await host.updateComplete
      vi.advanceTimersByTime(5000)

      expect(mockAnnounce).not.toHaveBeenCalled()
      expect(vi.getTimerCount()).toBe(0)
    })

    it('should check the inputs that changed while the host was removed', async () => {
      const host = await appendHost({ status: statusResponse.PENDING })
      host.remove()
      host.props = { ...host.props, status: statusResponse.SUCCESS }

      document.body.append(host)
      await host.updateComplete
      vi.advanceTimersByTime(1500)

      expect(mockAnnounce).toHaveBeenCalledOnce()
    })
  })
})
