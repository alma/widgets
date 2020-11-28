import { DOMContent, integer, ResolvePreserve } from '@/types'
import { joinInstallmentsCounts, createRootElement, formatCents, imageWithSrc } from '../../utils'
import { EligibleEligibility, IInstallment } from '@alma/client/dist/types/entities/eligibility'
import { PaymentPlanClassesConfig, PaymentPlanSettings } from './types'
import { WidgetFactoryFunc } from '../types'
import { HowItWorksWidget } from '../how_it_works'
import { HowItWorksSettings, HowItWorksClassesConfig } from '../how_it_works/types'
import infoLogo from '../../assets/info.svg'
import { WidgetConfig } from '@/widgets/config'

function howItWorksCtaTemplate(title: HTMLElement, classes: PaymentPlanClassesConfig) {
  return (openModal: EventHandlerNonNull, nestedClasses: HowItWorksClassesConfig): DOMContent => {
    const cta = createRootElement(nestedClasses.cta)
    cta.appendChild(title)

    const infoLogoImg = imageWithSrc(infoLogo)
    infoLogoImg.className = classes.infoButton
    cta.appendChild(infoLogoImg)

    cta.onclick = openModal
    return cta
  }
}

function titleTemplate(
  eligiblePlans: EligibleEligibility[],
  config: WidgetConfig<PaymentPlanSettings>,
  createWidget: WidgetFactoryFunc
): HTMLElement {
  const titleWrapper = createRootElement(config.classes.title)

  const title = document.createElement('strong')
  const totalFees = eligiblePlans
    .map((p) => p.payment_plan.reduce((fees, i) => fees + i.customer_fee, 0))
    .reduce((total, fees) => total + fees, 0)

  title.innerHTML =
    `Payez ${formatCents(config.purchaseAmount)}&nbsp;€ en ` +
    `${joinInstallmentsCounts(eligiblePlans.map((p) => p.installments_count))} fois` +
    (totalFees === 0 ? ' sans frais' : '')

  createWidget(HowItWorksWidget, {
    container: titleWrapper,
    displayLogo: false,
    samplePlans: eligiblePlans.map((p) => p.payment_plan),
    templates: {
      cta: howItWorksCtaTemplate(title, config.classes),
    },
  } as HowItWorksSettings)

  return titleWrapper
}

function _installmentTemplate(content: string, classes: PaymentPlanClassesConfig): HTMLElement {
  const installment = document.createElement('span')
  installment.className = classes.paymentPlan.installmentAmount
  installment.innerHTML = content

  return installment
}

function paymentPlanTemplate(
  eligibility: EligibleEligibility,
  config: WidgetConfig<PaymentPlanSettings>,
  _: WidgetFactoryFunc
): HTMLElement[] {
  const installmentsCountLabel = document.createElement('span')
  installmentsCountLabel.className = config.classes.paymentPlan.installmentsCount
  installmentsCountLabel.innerHTML = `${eligibility.installments_count}&times;`

  const installments = document.createElement('span')
  installments.className = config.classes.paymentPlan.installmentsWrapper

  const installmentsData = [...eligibility.payment_plan]
  const equalInstallments = eligibility.payment_plan.every(
    (p: IInstallment, idx: number, arr: IInstallment[]) => {
      return p.purchase_amount + p.customer_fee === arr[0].purchase_amount + arr[0].customer_fee
    }
  )

  if (!equalInstallments) {
    const amount =
      eligibility.payment_plan[0].purchase_amount + eligibility.payment_plan[0].customer_fee
    installments.appendChild(_installmentTemplate(`${formatCents(amount)} €`, config.classes))
    installments.appendChild(document.createTextNode(' + '))
  }

  const amount = installmentsData[1].purchase_amount + installmentsData[1].customer_fee
  const installmentsCount = equalInstallments
    ? installmentsData.length
    : installmentsData.length - 1
  installments.appendChild(
    _installmentTemplate(`${installmentsCount} &times; ${formatCents(amount)} €`, config.classes)
  )

  return [installmentsCountLabel, installments]
}

function notEligibleTemplate(
  min: number,
  max: number,
  installmentsCounts: integer[],
  config: WidgetConfig<PaymentPlanSettings>,
  createWidget: WidgetFactoryFunc
): HTMLElement {
  const titleWrapper = createRootElement(config.classes.title)

  const title = document.createElement('strong')
  title.innerHTML = `Payez en ${joinInstallmentsCounts(
    installmentsCounts
  )} fois entre ${formatCents(min)}&nbsp;€ et ${formatCents(max)}&nbsp;€`

  createWidget(HowItWorksWidget, {
    container: titleWrapper,
    displayLogo: false,
    templates: {
      cta: howItWorksCtaTemplate(title, config.classes),
    },
    // TODO: why does WidgetFactoryFunc "wrongly" resolves SettingsFor<T> to WidgetSettings when
    //  widget is declared as `class Widget<T extends WidgetSettings>`, but correctly to
    //  HowItWorksSettings when it is declared as `class Widget<T>`?
  } as ResolvePreserve<HowItWorksSettings>)

  return titleWrapper
}

export const defaultTemplates = {
  title: titleTemplate,
  paymentPlan: paymentPlanTemplate,
  notEligible: notEligibleTemplate,
}
