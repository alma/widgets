import { expectTypeOf } from 'expect-type'

import { Widgets } from '../src'
import { WidgetsController } from '@/widgets_controller'
import { ApiMode } from '@alma/client'
import { PaymentPlans } from '@/widgets/PaymentPlans/PaymentPlans'
import { HowItWorks } from '@/widgets/HowItWorks/HowItWorks'

describe('Widgets namespace', () => {
  it('exports the initialize function', () => {
    expect(Widgets.initialize).toBeDefined()

    expectTypeOf(Widgets.initialize).toEqualTypeOf<
      (merchantId: string, apiMode: ApiMode) => WidgetsController
    >()
  })

  it('exports the PaymentPlan widget', () => {
    expect(Widgets.PaymentPlans).toBeDefined()

    expectTypeOf(Widgets.PaymentPlans).toEqualTypeOf<typeof PaymentPlans>()
  })

  it('exports the HowItWorks widget', () => {
    expect(Widgets.HowItWorks).toBeDefined()

    expectTypeOf(Widgets.HowItWorks).toEqualTypeOf<typeof HowItWorks>()
  })
})
