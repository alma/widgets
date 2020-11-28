import { expectTypeOf } from 'expect-type'

import { Widgets } from '../src'
import { WidgetsController } from '@/widgets_controller'
import { ApiMode } from '@alma/client'
import { PaymentPlanWidget } from '../src/widgets/payment_plan'
import { HowItWorksWidget } from '../src/widgets/how_it_works'

describe('Widgets namespace', () => {
  it('exports the initialize function', () => {
    expect(Widgets.initialize).toBeDefined()

    expectTypeOf(Widgets.initialize).toEqualTypeOf<
      (merchantId: string, apiMode: ApiMode) => WidgetsController
    >()
  })

  it('exports the PaymentPlan widget', () => {
    expect(Widgets.PaymentPlan).toBeDefined()

    expectTypeOf(Widgets.PaymentPlan).toEqualTypeOf<typeof PaymentPlanWidget>()
  })

  it('exports the HowItWorks widget', () => {
    expect(Widgets.HowItWorks).toBeDefined()

    expectTypeOf(Widgets.HowItWorks).toEqualTypeOf<typeof HowItWorksWidget>()
  })
})
