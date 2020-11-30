import './styles.scss'

import { Widget } from '../base'
import { DOMContent, ResolvePreserve } from '@/types'
import { Client } from '@alma/client'
import { setDOMContent, createRootElement } from '../../utils'
import { defaultTemplates } from './default_templates'
import { HowItWorksSettings } from './types'
import { IEligibility, IPaymentPlan } from '@alma/client/dist/types/entities/eligibility'
import { DefaultWidgetConfig } from '@/widgets/config'

export class HowItWorksWidget extends Widget<HowItWorksSettings> {
  private readonly modalWrapper: HTMLElement

  constructor(almaClient: Client, settings: ResolvePreserve<HowItWorksSettings>) {
    super(almaClient, settings)

    this.modalWrapper = createRootElement(this.config.classes.modal.root)
    this.modalWrapper.style.display = 'none'
  }

  defaultConfig(): DefaultWidgetConfig<HowItWorksSettings> {
    return {
      displayLogo: true,
      displayInfoIcon: true,
      ctaContent: '',
      samplePlans: [],
      classes: {
        root: 'alma-how_it_works',
        logo: 'alma-how_it_works--logo',
        cta: 'alma-how_it_works--cta',
        modal: {
          root: 'alma-modal',
          wrapper: 'alma-modal--wrapper',
          frame: 'alma-modal--frame',
          closeButton: 'alma-modal--close-btn',
          cardLogos: {
            wrapper: 'alma-hiw_content--card-logos',
            logo: 'alma-hiw_content--card-logo',
          },
          content: {
            wrapper: 'alma-hiw_content--wrapper',
            logoContainer: 'alma-hiw_content--logo',
            paymentPlansWrapper: 'alma-hiw_content--plans',
            paymentPlansButtons: 'alma-hiw_content--plans-btns',
            paymentPlanButton: {
              button: 'alma-hiw_content--plan-btn',
              selected: 'alma-hiw_content--plan-btn__selected',
              installmentsCount: 'alma-hiw_content--plan-btn--installments_count',
            },
            paymentPlanDetailsWrapper: 'alma-hiw_content--plan-details',
            creditCardPayment: 'alma-hiw_content--cc-payment',
            installmentAmount: 'alma-hiw_content--installment-amount',
            installmentFees: 'alma-hiw_content--installment-fees',
            installmentDate: 'alma-hiw_content--installment-date',
            footer: {
              wrapper: 'alma-hiw_content--footer',
              closeButton: 'alma-hiw_content--close-btn',
            },
          },
        },
      },
      templates: defaultTemplates,
    }
  }

  openModal(e: Event): boolean {
    e.preventDefault()
    this.modalWrapper.style.display = 'block'
    return false
  }

  closeModal(e: Event): boolean {
    e.preventDefault()
    this.modalWrapper.style.display = 'none'
    return false
  }

  protected async prepare(almaClient: Client): Promise<IPaymentPlan[]> {
    if (this.config.samplePlans.length === 0) {
      const samplePlans = (await almaClient.payments.eligibility({
        payment: {
          purchase_amount: 30000,
          installments_count: [3, 4],
        },
      })) as IEligibility[]

      // TODO: Remove non-null assertion. Requires using type EligibleEligibility[] above, but can
      //    we actually guarantee that 300€ in 3 or 4 installments will always be eligible for any
      //    given merchant? It might be safer to just hardcode some samples!
      return samplePlans.filter((p) => p.eligible).map((p) => p.payment_plan!)
    } else {
      return this.config.samplePlans
    }
  }

  protected async render(paymentPlans: IPaymentPlan[]): Promise<DOMContent> {
    const root = document.createElement('div')
    root.className = this.config.classes.root

    if (this.config.displayLogo) {
      const logoRoot = createRootElement(this.config.classes.logo)
      setDOMContent(logoRoot, this.config.templates.logo(this.config.classes))
      root.appendChild(logoRoot)
    }

    const modalLinkRoot = createRootElement()
    setDOMContent(
      modalLinkRoot,
      this.config.templates.cta(this.openModal.bind(this), this.config.classes)
    )
    root.appendChild(modalLinkRoot)

    const closeModal = this.closeModal.bind(this)
    const content = this.config.templates.modalContent(
      paymentPlans,
      closeModal,
      this.config.classes
    )

    setDOMContent(
      this.modalWrapper,
      this.config.templates.modal(content, closeModal, this.config.classes)
    )

    document.body.appendChild(this.modalWrapper)

    return root
  }
}
