import {DOMContent, integer} from "../../types";
import {joinInstallmentsCounts, createRootElement, formatCents, imageWithSrc} from "../../utils";
import {EligibleEligibility} from "alma-js-client/dist/types/entities/eligibility";
import {PaymentPlanConfig, PaymentPlanTemplatesOption, PaymentPlanWidgetClasses} from "./types";
import {WidgetFactoryFunc} from "../types";
import HowItWorksWidget from "../how_it_works";
import {HowItWorksSettings, HowItWorksWidgetClasses} from "../how_it_works/types";
import infoLogo from "../../assets/info.svg";

function howItWorksCtaTemplate(title: HTMLElement, classes: PaymentPlanWidgetClasses) {
  return ((openModal: EventHandlerNonNull, nestedClasses: HowItWorksWidgetClasses): DOMContent => {
    let cta = createRootElement(nestedClasses.cta);
    cta.appendChild(title);

    let infoLogoImg = imageWithSrc(infoLogo);
    infoLogoImg.className = classes.infoButton;
    cta.appendChild(infoLogoImg);

    cta.onclick = openModal;
    return cta;
  });
}

function titleTemplate(eligiblePlans: EligibleEligibility[], config: PaymentPlanConfig, createWidget: WidgetFactoryFunc): HTMLElement {
  let titleWrapper = createRootElement(config.classes.title);

  let title = document.createElement("strong");
  const totalFees = eligiblePlans
    .map(p => p.payment_plan.reduce((fees, i) => fees + i.customer_fee, 0))
    .reduce((total, fees) => total + fees, 0);

  title.innerHTML = `Payez ${formatCents(config.purchaseAmount)}&nbsp;€ en ` +
    `${joinInstallmentsCounts(eligiblePlans.map(p => p.installments_count))} fois` +
    (totalFees === 0 ? " sans frais" : "");

  createWidget(
    HowItWorksWidget,
    {
      container: titleWrapper,
      displayLogo: false,
      samplePlans: eligiblePlans.map(p => p.payment_plan),
      templates: {
        cta: howItWorksCtaTemplate(title, config.classes),
      }
    } as HowItWorksSettings
  );

  return titleWrapper;
}

function _installmentTemplate(content: string, classes: PaymentPlanWidgetClasses): HTMLElement {
  let installment = document.createElement("span");
  installment.className = classes.paymentPlan.installmentAmount;
  installment.innerHTML = content;

  return installment;
}

function paymentPlanTemplate(eligibility: EligibleEligibility, config: PaymentPlanConfig, createWidget: WidgetFactoryFunc): HTMLElement[] {
  let installmentsCountLabel = document.createElement("span");
  installmentsCountLabel.className = config.classes.paymentPlan.installmentsCount;
  installmentsCountLabel.innerHTML = `${eligibility.installments_count}&times;`;

  let installments = document.createElement("span");
  installments.className = config.classes.paymentPlan.installmentsWrapper;

  let installmentsData = [...eligibility.payment_plan];
  let equalInstallments = eligibility.payment_plan.every((p: any, idx: number, arr: Array<any>) => {
    return p.purchase_amount + p.customer_fee === arr[0].purchase_amount + arr[0].customer_fee
  });

  if (!equalInstallments) {
    let amount = eligibility.payment_plan[0].purchase_amount + eligibility.payment_plan[0].customer_fee;
    installments.appendChild(_installmentTemplate(`${formatCents(amount)} €`, config.classes));
    installments.appendChild(document.createTextNode(" + "));
  }

  let amount = installmentsData[1].purchase_amount + installmentsData[1].customer_fee;
  let installmentsCount = equalInstallments ? installmentsData.length : installmentsData.length - 1;
  installments.appendChild(_installmentTemplate(`${installmentsCount} &times; ${formatCents(amount)} €`, config.classes));

  return [installmentsCountLabel, installments];
}

function notEligibleTemplate(min: number, max: number, installmentsCounts: integer[], config: PaymentPlanConfig, createWidget: WidgetFactoryFunc): HTMLElement {
  let titleWrapper = createRootElement(config.classes.title);

  let title = document.createElement("strong");
  title.innerHTML = `Payez en ${joinInstallmentsCounts(installmentsCounts)} fois entre ${formatCents(min)}&nbsp;€ et ${formatCents(max)}&nbsp;€`;

  createWidget(
    HowItWorksWidget,
    {
      container: titleWrapper,
      displayLogo: false,
      templates: {
        cta: howItWorksCtaTemplate(title, config.classes)
      }
    } as HowItWorksSettings
  );

  return titleWrapper;
}

const templates: PaymentPlanTemplatesOption =  {
  title: titleTemplate,
  paymentPlan: paymentPlanTemplate,
  notEligible: notEligibleTemplate,
};

export default templates;
