import './styles.scss'

import { EligibleEligibility } from '@alma/client/dist/types/entities/eligibility'

import { Widget } from '../base'
import { DOMContent, integer } from '@/types'
import { Client } from '@alma/client'
import { setDOMContent } from '@/utils'
import { defaultTemplates } from './default_templates'
import { PaymentPlanSettings } from './types'
import { WidgetFactoryFunc } from '../types'
import { DefaultWidgetConfig } from '@/widgets/config'

type PaymentPlanDefaultConfig = DefaultWidgetConfig<PaymentPlanSettings>

export class PaymentPlanWidget extends Widget<PaymentPlanSettings> {
  defaultConfig(): PaymentPlanDefaultConfig {
    return {
      purchaseAmount: 100,
      installmentsCount: 3,
      minPurchaseAmount: null,
      maxPurchaseAmount: null,
      templates: defaultTemplates,
      classes: {
        root: 'alma-payment_plan',
        title: 'alma-payment_plan--title',
        infoButton: 'alma-payment_plan--info_btn',
        paymentPlan: {
          root: 'alma-payment_plan--plan',
          installmentsCount: 'alma-payment_plan--installments_count',
          installmentsWrapper: 'alma-payment_plan--installments',
          installmentAmount: 'alma-payment_plan--installment',
        },
        notEligible: 'alma-payment_plan--not_eligible',
      },
    }
  }
  get installmentsCounts(): integer[] {
    let installmentsCounts = this.config.installmentsCount

    if (typeof this.config.installmentsCount === 'number') {
      installmentsCounts = [this.config.installmentsCount]
    }

    return installmentsCounts as integer[]
  }

  protected async prepare(almaClient: Client): Promise<any> {
    const { purchaseAmount, minPurchaseAmount, maxPurchaseAmount } = this.config

    if (
      (minPurchaseAmount && purchaseAmount < minPurchaseAmount) ||
      (maxPurchaseAmount && purchaseAmount > maxPurchaseAmount)
    ) {
      return [
        {
          eligible: false,
          reasons: {
            purchase_amount: 'invalid_value',
          },
          constraints: {
            purchase_amount: {
              minimum: minPurchaseAmount,
              maximum: maxPurchaseAmount,
            },
          },
        },
      ]
    }

    return almaClient.payments.eligibility({
      payment: {
        purchase_amount: purchaseAmount,
        installments_count: this.installmentsCounts,
      },
    })
  }

  protected async render(
    renderingContext: any,
    createWidget: WidgetFactoryFunc
  ): Promise<DOMContent> {
    const root = document.createElement('div')
    root.className = this.config.classes.root

    const eligiblePlans: EligibleEligibility[] = []
    let minEligible: integer = Number.MAX_VALUE
    let maxEligible: integer = Number.MIN_VALUE

    for (const eligibility of renderingContext) {
      if (eligibility.eligible) {
        eligiblePlans.push(eligibility)
      } else {
        if (eligibility.reasons.purchase_amount) {
          const min = Math.max(
            this.config.minPurchaseAmount || 0,
            eligibility.constraints.purchase_amount.minimum
          )
          const max = Math.min(
            this.config.maxPurchaseAmount || 0,
            eligibility.constraints.purchase_amount.maximum
          )

          minEligible = min < minEligible ? min : minEligible
          maxEligible = max > maxEligible ? max : maxEligible
        } else if (eligibility.reasons.merchant) {
          return ''
        }
      }
    }

    if (eligiblePlans.length > 0) {
      const titleRoot = document.createElement('div')
      titleRoot.className = this.config.classes.title
      setDOMContent(
        titleRoot,
        this.config.templates.title(eligiblePlans, this.config, createWidget)
      )
      setDOMContent(root, titleRoot)

      for (const eligibility of eligiblePlans) {
        const plan = document.createElement('div')
        plan.className = this.config.classes.paymentPlan.root
        setDOMContent(
          plan,
          this.config.templates.paymentPlan(eligibility, this.config, createWidget)
        )

        root.appendChild(plan)
      }
    } else {
      const notEligibleRoot = document.createElement('div')
      notEligibleRoot.className = this.config.classes.notEligible
      setDOMContent(
        notEligibleRoot,
        this.config.templates.notEligible(
          minEligible,
          maxEligible,
          this.installmentsCounts,
          this.config,
          createWidget
        )
      )

      setDOMContent(root, notEligibleRoot)
    }

    return root
  }
}
