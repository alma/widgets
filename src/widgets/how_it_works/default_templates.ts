import {HowItWorksTemplates, HowItWorksWidgetClasses} from "./types";
import {DOMContent} from "../../types";
import {
  createListElement,
  createRootElement,
  formatCents,
  humanizedDate,
  imageWithSrc,
  priceFromCents,
  setDOMContent
} from "../../utils";

import {IPaymentPlan} from "alma-js-client/dist/types/entities/eligibility";

import almaLogo from '../../assets/alma.svg';
import infoLogo from '../../assets/info.svg';
import cbLogo from '../../assets/cards/cb.svg';
import visaLogo from '../../assets/cards/visa.svg';
import mastercardLogo from '../../assets/cards/mastercard.svg';
import amexLogo from '../../assets/cards/amex.svg';

function logo(): DOMContent {
  return imageWithSrc(almaLogo);
}

function cta(openModal: EventHandlerNonNull, classes: HowItWorksWidgetClasses): DOMContent {
  let cta = createRootElement(classes.cta);
  cta.appendChild(document.createTextNode("Comment ça marche ?"));
  cta.appendChild(imageWithSrc(infoLogo));
  cta.onclick = openModal;
  return cta;
}

function modal(content: DOMContent, closeModal: EventHandlerNonNull, classes: HowItWorksWidgetClasses): DOMContent {
  let wrapper = createRootElement(classes.modal.wrapper);

  let frame = createRootElement(classes.modal.frame);
  setDOMContent(frame, content);

  let closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;";
  closeButton.className = classes.modal.closeButton;
  closeButton.onclick = closeModal;
  frame.appendChild(closeButton);

  wrapper.appendChild(frame);
  wrapper.onclick = (e) => {
    if (e.target !== wrapper) {
      e.preventDefault();
      return false;
    }

    return closeModal(e);
  };

  return wrapper;
}

function modalContent(paymentPlans: IPaymentPlan[], closeModal: EventHandlerNonNull, classes: HowItWorksWidgetClasses): DOMContent {
  let contentRoot = createRootElement(classes.modal.content.wrapper);

  let logoRoot = createRootElement(classes.modal.content.logoContainer);
  setDOMContent(logoRoot, imageWithSrc(almaLogo));
  contentRoot.appendChild(logoRoot);

  let intro = createRootElement("", "p");
  intro.innerText = "Payer avec Alma, c'est simple et immédiat :";
  contentRoot.appendChild(intro);

  let steps = createListElement([
    "Validez votre panier",
    "Sélectionnez l'option de paiement en plusieurs fois Alma",
    "Entrez votre numéro de carte bancaire, et c'est tout !"
  ]);
  contentRoot.appendChild(steps);

  let paymentPlansWrapper = createRootElement(classes.modal.content.paymentPlansWrapper);

  let paymentPlansButtons: DOMContent[] = [];
  let planDetails: HTMLElement[][] = [];

  paymentPlans = paymentPlans.sort((a, b) => a.length - b.length);
  paymentPlans.forEach(p => {
    let installmentsCount = p.length;
    let totalAmount = formatCents(p.reduce((amount, i) => amount + i.purchase_amount, 0));
    let totalFees = priceFromCents(p.reduce((amount, i) => amount + i.customer_fee, 0));

    let countClass = classes.modal.content.paymentPlanButton.installmentsCount;
    let planButton = `<span class="amount">${totalAmount}&nbsp;€</span> en <span class="${countClass}">${installmentsCount}&times;</span>`;
    paymentPlansButtons.push(planButton);

    let details: HTMLElement[] = [];

    let cardLogos = createRootElement(classes.modal.cardLogos.wrapper);
    cardLogos.appendChild(imageWithSrc(cbLogo, classes.modal.cardLogos.logo));
    cardLogos.appendChild(imageWithSrc(visaLogo, classes.modal.cardLogos.logo));
    cardLogos.appendChild(imageWithSrc(mastercardLogo, classes.modal.cardLogos.logo));
    cardLogos.appendChild(imageWithSrc(amexLogo, classes.modal.cardLogos.logo));
    details.push(cardLogos);

    let ccPayment = createRootElement(classes.modal.content.creditCardPayment, "p");
    let ccPaymentHtml = "Paiement ";
    if (totalFees === 0) {
      ccPaymentHtml += "<strong>sans frais,</strong> par carte bancaire";
    } else {
      ccPaymentHtml += "par carte bancaire";
    }
    ccPaymentHtml += `, en ${installmentsCount} échéances :`;
    ccPayment.innerHTML = ccPaymentHtml;
    details.push(ccPayment);

    details.push(createListElement(p.map(i => {
      let amount = formatCents(i.purchase_amount + i.customer_fee);
      let fees = i.customer_fee === 0 ? "" : `(dont frais : ${formatCents(i.customer_fee)}&nbsp;€)`;
      let date = humanizedDate(new Date(i.due_date * 1000), true);

      let installment = `<span class="${classes.modal.content.installmentAmount}">${amount}&nbsp;€</span>`;
      installment += ` <span class="${classes.modal.content.installmentDate}">${date}</span> `;
      installment += ` <span class="${classes.modal.content.installmentFees}">${fees}</span> `;

      return installment;
    })));

    planDetails.push(details);
  });

  let paymentPlansButtonsList = createListElement(
    paymentPlansButtons,
    classes.modal.content.paymentPlansButtons,
    classes.modal.content.paymentPlanButton.button,
  );
  paymentPlansWrapper.appendChild(paymentPlansButtonsList);

  let planDetailsWrapper = createRootElement(classes.modal.content.paymentPlanDetailsWrapper);
  paymentPlansWrapper.appendChild(planDetailsWrapper);

  // Make first sample payment plan selected & visible
  setDOMContent(planDetailsWrapper, planDetails[0]);
  paymentPlansButtonsList.querySelector(`.${classes.modal.content.paymentPlanButton.button}`)!.classList.add(classes.modal.content.paymentPlanButton.selected);

  paymentPlansButtonsList.onclick = function (e) {
    paymentPlansButtonsList.querySelector(`.${classes.modal.content.paymentPlanButton.selected}`)?.classList.remove(classes.modal.content.paymentPlanButton.selected);
    let btn = (e.target as Element)?.closest(`.${classes.modal.content.paymentPlanButton.button}`);
    if (btn) {
      let index = Array.from(paymentPlansButtonsList.children).indexOf(btn);
      setDOMContent(planDetailsWrapper, planDetails[index]);
      btn.classList.add(classes.modal.content.paymentPlanButton.selected);
    }
  };

  contentRoot.appendChild(paymentPlansWrapper);

  let footer = createRootElement(classes.modal.content.footer.wrapper);
  let closeBtn = document.createElement("button");
  closeBtn.className = classes.modal.content.footer.closeButton;
  closeBtn.innerText = "J'ai compris !";
  closeBtn.onclick = closeModal;
  footer.appendChild(closeBtn);
  contentRoot.appendChild(footer);

  return contentRoot;
}


export const templates: HowItWorksTemplates = {
  logo,
  cta,
  modal,
  modalContent,
};

export default templates;
