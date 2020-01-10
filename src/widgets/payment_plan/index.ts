import './styles.scss';

import Eligibility from "alma-js-client/dist/types/entities/eligibility";

import {Widget} from "../base";
import {DOMContent, integer} from "../../types";
import {Client} from "alma-js-client";
import {setDOMContent, priceFromCents} from "../../utils";
import defaultTemplates from './default_templates';
import {PaymentPlanConfig, PaymentPlanSettings, PaymentPlanWidgetClasses} from "./types";

const defaultClasses: PaymentPlanWidgetClasses = {
  root: "alma-payment_plan",
  title: "alma-payment_plan--title",
  paymentPlan: {
    root: "alma-payment_plan--plan",
    installmentsCountWrapper: "alma-installments_count",
    installmentsCountText: "alma-installments_count--text",
    installmentsWrapper: "alma-payment_plan--installments",
    installmentAmount: "alma-payment_plan--installment",
  },
  notEligible: "alma-payment_plan--not_eligible"
};

export class PaymentPlanWidget extends Widget {
  protected constructor(almaClient: Client, options: PaymentPlanSettings) {
    // Inject default templates into the given options
    options = {
      ...options,
      templates: {
        ...defaultTemplates,
        ...options.templates,
      },
      classes: {
        ...defaultClasses,
        ...options.classes,
      }
    };

    super(almaClient, options);
  }


  get config(): PaymentPlanConfig {
    return {...this._config} as PaymentPlanConfig;
  }

  protected async prepare(almaClient: Client): Promise<any> {
    const options = this._config as PaymentPlanSettings;
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
    root.className = this.config.classes.root;

    let eligiblePlans: Eligibility[] = [];
    let minEligible: integer = Number.MAX_VALUE;
    let maxEligible: integer = Number.MIN_VALUE;

    for (let eligibility of renderingContext) {
      if (eligibility.eligible) {
        eligiblePlans.push(eligibility);
      } else if (!eligibility.reasons.installments_count) {
        let min = this.config.minPurchaseAmount || eligibility.constraints.purchase_amount.minimum;
        let max = this.config.maxPurchaseAmount || eligibility.constraints.purchase_amount.maximum;

        minEligible = min < minEligible ? min : minEligible;
        maxEligible = max > maxEligible ? max : maxEligible;
      }
    }

    if (eligiblePlans.length > 0) {
      let titleRoot = document.createElement("div");
      titleRoot.className = this.config.classes.title;
      setDOMContent(titleRoot, this.config.templates.title(eligiblePlans));
      setDOMContent(root, titleRoot);

      for (let eligibility of eligiblePlans) {
        let plan = document.createElement("div");
        plan.className = this.config.classes.paymentPlan.root;
        setDOMContent(plan, this.config.templates.paymentPlan(eligibility, this.config.classes!));

        root.appendChild(plan);
      }
    } else {
      let notEligibleRoot = document.createElement("div");
      notEligibleRoot.className = this.config.classes.notEligible;
      setDOMContent(notEligibleRoot, this.config.templates.notEligible(minEligible, maxEligible));

      setDOMContent(root, notEligibleRoot);
    }

    return root;
  }
}

export default PaymentPlanWidget;
