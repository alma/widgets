import { HowItWorksTemplatesConfig, HowItWorksClassesConfig } from './types'
import { DOMContent } from '@/types'
import {
  createListElement,
  createRootElement,
  formatCents,
  humanizedDate,
  imageWithSrc,
  priceFromCents,
  setDOMContent,
} from '../../utils'

import { IPaymentPlan } from '@alma/client/dist/types/entities/eligibility'

import almaLogo from '../../assets/alma.svg'
import infoLogo from '../../assets/info.svg'
import cbLogo from '../../assets/cards/cb.svg'
import visaLogo from '../../assets/cards/visa.svg'
import mastercardLogo from '../../assets/cards/mastercard.svg'
import amexLogo from '../../assets/cards/amex.svg'

function logo(): DOMContent {
  return imageWithSrc(almaLogo)
}

function cta(openModal: EventHandlerNonNull, classes: HowItWorksClassesConfig): DOMContent {
  const cta = createRootElement(classes.cta)
  cta.appendChild(document.createTextNode('Comment ça marche ?'))
  cta.appendChild(imageWithSrc(infoLogo))
  cta.onclick = openModal
  return cta
}

function modal(
  content: DOMContent,
  closeModal: EventHandlerNonNull,
  classes: HowItWorksClassesConfig
): DOMContent {
  const wrapper = createRootElement(classes.modal.wrapper)

  const frame = createRootElement(classes.modal.frame)
  setDOMContent(frame, content)

  const closeButton = document.createElement('button')
  closeButton.innerHTML = '&times;'
  closeButton.className = classes.modal.closeButton
  closeButton.onclick = closeModal
  frame.appendChild(closeButton)

  wrapper.appendChild(frame)
  wrapper.onclick = (e) => {
    if (e.target !== wrapper) {
      e.preventDefault()
      return false
    }

    return closeModal(e)
  }

  return wrapper
}

function modalContent(
  paymentPlans: IPaymentPlan[],
  closeModal: EventHandlerNonNull,
  classes: HowItWorksClassesConfig
): DOMContent {
  const contentRoot = createRootElement(classes.modal.content.wrapper)

  const logoRoot = createRootElement(classes.modal.content.logoContainer)
  setDOMContent(logoRoot, imageWithSrc(almaLogo))
  contentRoot.appendChild(logoRoot)

  const intro = createRootElement('', 'p')
  intro.innerText = "Payer avec Alma, c'est simple et immédiat :"
  contentRoot.appendChild(intro)

  const steps = createListElement([
    'Validez votre panier',
    "Sélectionnez l'option de paiement en plusieurs fois Alma",
    "Entrez votre numéro de carte bancaire, et c'est tout !",
  ])
  contentRoot.appendChild(steps)

  const paymentPlansWrapper = createRootElement(classes.modal.content.paymentPlansWrapper)

  const paymentPlansButtons: DOMContent[] = []
  const planDetails: HTMLElement[][] = []

  paymentPlans = paymentPlans.sort((a, b) => a.length - b.length)
  paymentPlans.forEach((p) => {
    const installmentsCount = p.length
    const totalAmount = formatCents(p.reduce((amount, i) => amount + i.purchase_amount, 0))
    const totalFees = priceFromCents(p.reduce((amount, i) => amount + i.customer_fee, 0))

    const countClass = classes.modal.content.paymentPlanButton.installmentsCount
    const planButton = `<span class="amount">${totalAmount}&nbsp;€</span> en <span class="${countClass}">${installmentsCount}&times;</span>`
    paymentPlansButtons.push(planButton)

    const details: HTMLElement[] = []

    const cardLogos = createRootElement(classes.modal.cardLogos.wrapper)
    cardLogos.appendChild(imageWithSrc(cbLogo, classes.modal.cardLogos.logo))
    cardLogos.appendChild(imageWithSrc(visaLogo, classes.modal.cardLogos.logo))
    cardLogos.appendChild(imageWithSrc(mastercardLogo, classes.modal.cardLogos.logo))
    cardLogos.appendChild(imageWithSrc(amexLogo, classes.modal.cardLogos.logo))
    details.push(cardLogos)

    const ccPayment = createRootElement(classes.modal.content.creditCardPayment, 'p')
    let ccPaymentHtml = 'Paiement '
    if (totalFees === 0) {
      ccPaymentHtml += '<strong>sans frais,</strong> par carte bancaire'
    } else {
      ccPaymentHtml += 'par carte bancaire'
    }
    ccPaymentHtml += `, en ${installmentsCount} échéances :`
    ccPayment.innerHTML = ccPaymentHtml
    details.push(ccPayment)

    details.push(
      createListElement(
        p.map((i) => {
          const amount = formatCents(i.purchase_amount + i.customer_fee)
          const fees =
            i.customer_fee === 0 ? '' : `(dont frais : ${formatCents(i.customer_fee)}&nbsp;€)`
          const date = humanizedDate(new Date(i.due_date * 1000), true)

          let installment = `<span class="${classes.modal.content.installmentAmount}">${amount}&nbsp;€</span>`
          installment += ` <span class="${classes.modal.content.installmentDate}">${date}</span> `
          installment += ` <span class="${classes.modal.content.installmentFees}">${fees}</span> `

          return installment
        })
      )
    )

    planDetails.push(details)
  })

  const paymentPlansButtonsList = createListElement(
    paymentPlansButtons,
    classes.modal.content.paymentPlansButtons,
    classes.modal.content.paymentPlanButton.button
  )
  paymentPlansWrapper.appendChild(paymentPlansButtonsList)

  const planDetailsWrapper = createRootElement(classes.modal.content.paymentPlanDetailsWrapper)
  paymentPlansWrapper.appendChild(planDetailsWrapper)

  // Make first sample payment plan selected & visible
  setDOMContent(planDetailsWrapper, planDetails[0])

  // TODO: Remove non-null assertion / handle null case
  paymentPlansButtonsList
    .querySelector(`.${classes.modal.content.paymentPlanButton.button}`)!
    .classList.add(classes.modal.content.paymentPlanButton.selected)

  paymentPlansButtonsList.onclick = function (e) {
    paymentPlansButtonsList
      .querySelector(`.${classes.modal.content.paymentPlanButton.selected}`)
      ?.classList.remove(classes.modal.content.paymentPlanButton.selected)
    const btn = (e.target as Element)?.closest(`.${classes.modal.content.paymentPlanButton.button}`)
    if (btn) {
      const index = Array.from(paymentPlansButtonsList.children).indexOf(btn)
      setDOMContent(planDetailsWrapper, planDetails[index])
      btn.classList.add(classes.modal.content.paymentPlanButton.selected)
    }
  }

  contentRoot.appendChild(paymentPlansWrapper)

  const footer = createRootElement(classes.modal.content.footer.wrapper)
  const closeBtn = document.createElement('button')
  closeBtn.className = classes.modal.content.footer.closeButton
  closeBtn.innerText = "J'ai compris !"
  closeBtn.onclick = closeModal
  footer.appendChild(closeBtn)
  contentRoot.appendChild(footer)

  return contentRoot
}

export const defaultTemplates: HowItWorksTemplatesConfig = {
  logo,
  cta,
  modal,
  modalContent,
}
