import './styles.scss';

import {Widget, WidgetOptions} from "../base";
import {DOMContent, integer} from "../../types";
import {Client} from "alma-js-client";
import {priceFromCents} from "../../utils";

import Eligibility from "alma-js-client/dist/types/entities/eligibility";

interface PaymentPlanOptions extends WidgetOptions {
  purchaseAmount: integer;
  installmentsCount: integer | integer[];
  minPurchaseAmount?: integer;
  maxPurchaseAmount?: integer;
}

export class PaymentPlanWidget extends Widget {
  get options(): PaymentPlanOptions {
    return {...this._options} as PaymentPlanOptions;
  }

  protected async prepare(almaClient: Client): Promise<any> {
    const options = this._options as PaymentPlanOptions;
    const installmentsCount = typeof options.installmentsCount === "number" ? [options.installmentsCount] : options.installmentsCount;

    return almaClient.payments.eligibility({
      payment: {
        purchase_amount: options.purchaseAmount,
        installments_count: installmentsCount
      }
    });
  }

  protected async render(renderingContext: any): Promise<DOMContent> {
    let root = document.createElement("div");
    root.className = "alma-payment_plan";

    let eligiblePlans: Eligibility[] = [];
    let minEligible: integer = Number.MAX_VALUE;
    let maxEligible: integer = Number.MIN_VALUE;

    for (let eligibility of renderingContext) {
      if (eligibility.eligible) {
        eligiblePlans.push(eligibility);
      } else if (!eligibility.reasons.installments_count) {
        let min = this.options.minPurchaseAmount || eligibility.constraints.purchase_amount.minimum;
        let max = this.options.maxPurchaseAmount || eligibility.constraints.purchase_amount.maximum;

        minEligible = min < minEligible ? min : minEligible;
        maxEligible = max > maxEligible ? max : maxEligible;
      }
    }

    if (eligiblePlans.length > 0) {
      let title = document.createElement("strong");
      title.className = "alma-payment_plan--title";
      title.innerText = `Payez en ${PaymentPlanWidget.installmentsCountsPhrase(eligiblePlans.map(p => p.installments_count))} fois`;

      root.appendChild(title);

      for (let eligibility of eligiblePlans) {
        let plan = document.createElement("div");
        plan.className = "alma-payment_plan--plan";

        let installmentsCount = document.createElement("span");
        installmentsCount.className = "alma-payment_plan--installments_count";
        installmentsCount.innerHTML = `<span class="alma-installments_count--text-wrapper">${eligibility.installments_count}&times;</span>`;
        plan.appendChild(installmentsCount);

        let installments = document.createElement("span");
        installments.className = "alma-payment_plan--installments";

        let installmentsData = [...eligibility.payment_plan];
        let equalInstallments = eligibility.payment_plan.every((p: any, idx: number, arr: Array<any>) => {
          return p.purchase_amount + p.customer_fee === arr[0].purchase_amount + arr[0].customer_fee
        });

        if (!equalInstallments) {
          let firstInstallment = document.createElement("span");
          firstInstallment.className = "alma-payment_plan--installment";

          let amount = eligibility.payment_plan[0].purchase_amount + eligibility.payment_plan[0].customer_fee;
          firstInstallment.innerText = `${priceFromCents(amount)} €`;

          installments.appendChild(firstInstallment);
          installments.appendChild(document.createTextNode(" + "));

          installmentsData.shift();
        }

        let nextInstallments = document.createElement("span");
        nextInstallments.className = "alma-payment_plan--installment";

        let amount = installmentsData[0].purchase_amount + installmentsData[0].customer_fee;
        nextInstallments.innerHTML = `${installmentsData.length} &times; ${priceFromCents(amount)} €`;
        installments.appendChild(nextInstallments);

        plan.appendChild(installments);
        root.appendChild(plan);
      }
    } else {
      let notEligible = document.createElement("strong");
      notEligible.className = "alma-payment_plan--not_eligible";
      notEligible.innerText = `Payez en plusieurs fois pour tout achat entre ${priceFromCents(minEligible)} € et ${priceFromCents(maxEligible)} €`;

      root.appendChild(notEligible);
    }

    return root;
  }

  private static installmentsCountsPhrase(installmentsCounts: integer[]): string {
    if (installmentsCounts.length === 1) {
      return String(installmentsCounts[0]);
    } else if (installmentsCounts.length === 2) {
      return installmentsCounts.join(" ou ");
    } else {
      return installmentsCounts.slice(0, installmentsCounts.length - 1).join(", ") + ` ou ${installmentsCounts[installmentsCounts.length - 1]}`;
    }
  }
}

export default PaymentPlanWidget;
