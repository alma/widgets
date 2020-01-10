import {integer} from "../../types";
import {priceFromCents} from "../../utils";
import Eligibility from "alma-js-client/dist/types/entities/eligibility";
import {PaymentPlanWidgetClasses, PaymentPlanTemplatesOption} from "./types";

function _installmentsCountsPhrase(installmentsCounts: integer[]): string {
  if (installmentsCounts.length === 1) {
    return String(installmentsCounts[0]);
  } else if (installmentsCounts.length === 2) {
    return installmentsCounts.join(" ou ");
  } else {
    return installmentsCounts.slice(0, installmentsCounts.length - 1).join(", ") + ` ou ${installmentsCounts[installmentsCounts.length - 1]}`;
  }
}

function titleTemplate(eligiblePlans: any[]): Element {
  let title = document.createElement("strong");
  title.innerText = `Payez en ${_installmentsCountsPhrase(eligiblePlans.map(p => p.installments_count))} fois`;
  return title;
}

function _installmentTemplate(content: string, classes: PaymentPlanWidgetClasses): Element {
  let installment = document.createElement("span");
  installment.className = classes.paymentPlan.installmentAmount;
  installment.innerHTML = content;

  return installment;
}

function paymentPlanTemplate(eligibility: Eligibility, classes: PaymentPlanWidgetClasses): Element[] {
  let installmentsCount = document.createElement("span");
  installmentsCount.className = classes.paymentPlan.installmentsCountWrapper;
  installmentsCount.innerHTML = `<span class="${classes.paymentPlan.installmentsCountText}">${eligibility.installments_count}&times;</span>`;

  let installments = document.createElement("span");
  installments.className = classes.paymentPlan.installmentsWrapper;

  let installmentsData = [...eligibility.payment_plan];
  let equalInstallments = eligibility.payment_plan.every((p: any, idx: number, arr: Array<any>) => {
    return p.purchase_amount + p.customer_fee === arr[0].purchase_amount + arr[0].customer_fee
  });

  if (!equalInstallments) {
    let amount = eligibility.payment_plan[0].purchase_amount + eligibility.payment_plan[0].customer_fee;
    installments.appendChild(_installmentTemplate(`${priceFromCents(amount)} €`, classes));
    installments.appendChild(document.createTextNode(" + "));
  }

  let amount = installmentsData[1].purchase_amount + installmentsData[1].customer_fee;
  installments.appendChild(_installmentTemplate(`${installmentsData.length - 1} &times; ${priceFromCents(amount)} €`, classes));

  return [installmentsCount, installments];
}

function notEligibleTemplate(minimum: number, maximum: number): string {
  return `<strong>Payez en plusieurs fois pour tout achat entre ${priceFromCents(minimum)} € et ${priceFromCents(maximum)} €</strong>`
}

const templates: PaymentPlanTemplatesOption =  {
  title: titleTemplate,
  paymentPlan: paymentPlanTemplate,
  notEligible: notEligibleTemplate,
};

export default templates;
