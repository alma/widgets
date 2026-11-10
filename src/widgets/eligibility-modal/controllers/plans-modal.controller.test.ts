import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { statusResponse } from '@/domain/plans/api/eligibility.const'
import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import {
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockPlansAllEligible,
} from '@/test/fixtures'
import { closeModalOf } from '@/widgets/eligibility-modal/controllers/modal-portal.controller'
import {
  PlansModalController,
  type PlansModalParams,
} from '@/widgets/eligibility-modal/controllers/plans-modal.controller'

class PlansModalHost extends LightDomElement {
  private params?: PlansModalParams

  readonly onRequestClose = vi.fn()

  readonly onDismiss = vi.fn()

  readonly modal = new PlansModalController(this, this.onRequestClose, this.onDismiss)

  async show(params?: PlansModalParams): Promise<void> {
    this.params = params
    this.requestUpdate()
    await this.updateComplete
  }

  protected override updated(): void {
    this.modal.sync(this.params)
  }
}
customElements.define('test-plans-modal-host', PlansModalHost)

const PLANS = [mockP2XEligiblePlan, mockP3XEligiblePlanWithFees] as EligibilityPlanToDisplay[]

const paramsOf = (params: Partial<PlansModalParams> = {}): PlansModalParams => ({
  eligiblePlans: PLANS,
  status: statusResponse.SUCCESS,
  initialPlanIndex: () => 0,
  intl: createIntl('fr'),
  ...params,
})

const portals = () => document.querySelectorAll('.ReactModalPortal')
const activePlan = () => document.querySelector('.alma-eligibility-modal-active-option')

const appendHost = async (params?: PlansModalParams): Promise<PlansModalHost> => {
  const host = document.createElement('test-plans-modal-host') as PlansModalHost
  document.body.append(host)
  await host.show(params)
  return host
}

describe('PlansModalController', () => {
  afterEach(() => {
    document.querySelectorAll<PlansModalHost>('test-plans-modal-host').forEach((host) => {
      host.modal.sync()
    })
  })

  // No msw handler answers here, so a request would fail the test.
  it('should open the modal on the given plans, with no request', async () => {
    const host = await appendHost(paramsOf({ initialPlanIndex: () => 1 }))

    expect(host.modal.isOpen).toBe(true)
    expect(portals()).toHaveLength(1)
    expect(activePlan()?.textContent).toBe('3x')
  })

  it('should keep the plan it opened on when the initial index changes', async () => {
    const host = await appendHost(paramsOf())

    await host.show(paramsOf({ initialPlanIndex: () => 1 }))

    expect(activePlan()?.textContent).toBe('2x')
  })

  it('should show the plan the shopper picks, without updating the host', async () => {
    const host = await appendHost(paramsOf())
    const update = vi.spyOn(host, 'requestUpdate')

    await userEvent.click(screen.getByRole('button', { name: /3x/ }))

    expect(activePlan()?.textContent).toBe('3x')
    expect(update).not.toHaveBeenCalled()
  })

  it('should listen to the screen size only while open', async () => {
    const matchMedia = vi.mocked(window.matchMedia)
    const host = await appendHost(undefined)
    expect(matchMedia).not.toHaveBeenCalled()

    await host.show(paramsOf())
    const list = matchMedia.mock.results[0].value as MediaQueryList
    const onChange = vi.mocked(list.addEventListener).mock.calls[0][1]

    await host.show(undefined)
    expect(list.removeEventListener).toHaveBeenCalledWith('change', onChange)
  })

  it('should call onDismiss when the modal closes without sync()', async () => {
    const host = await appendHost(paramsOf())

    await host.show(undefined)
    expect(host.onDismiss).not.toHaveBeenCalled()

    await host.show(paramsOf())
    closeModalOf(host)
    expect(host.onDismiss).toHaveBeenCalledOnce()

    await host.show(paramsOf())
    host.remove()
    await Promise.resolve()
    expect(host.onDismiss).toHaveBeenCalledTimes(2)
  })

  it('should close the modal without params, and open it again on its new initial plan', async () => {
    const host = await appendHost(paramsOf())

    await host.show(undefined)
    expect(host.modal.isOpen).toBe(false)
    expect(portals()).toHaveLength(0)

    await host.show(paramsOf({ initialPlanIndex: () => 1 }))
    expect(activePlan()?.textContent).toBe('3x')
  })

  it('should pass a click on the close button to onRequestClose and stay open', async () => {
    const host = await appendHost(paramsOf())

    screen.getByTestId('modal-close-button').click()

    expect(host.onRequestClose).toHaveBeenCalledOnce()
    expect(host.onRequestClose.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
    expect(host.modal.isOpen).toBe(true)
  })

  it('should not open for a host out of the page', () => {
    const host = document.createElement('test-plans-modal-host') as PlansModalHost

    host.modal.sync(paramsOf())

    expect(host.modal.isOpen).toBe(false)
    expect(portals()).toHaveLength(0)
  })

  it.each([
    ['without a deferred plan', PLANS, 'Payez en plusieurs fois par carte bancaire avec Alma.'],
    [
      'with a deferred plan',
      mockPlansAllEligible as EligibilityPlanToDisplay[],
      'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.',
    ],
  ])('should pick the title from the given plans, %s', async (_name, eligiblePlans, title) => {
    await appendHost(paramsOf({ eligiblePlans }))

    expect(screen.getByTestId('modal-title-element')).toHaveTextContent(title)
  })
})
