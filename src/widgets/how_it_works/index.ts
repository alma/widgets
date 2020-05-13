import './styles.scss';

import {Widget} from "../base";
import {DOMContent} from "../../types";
import {Client} from "alma-js-client";
import {setDOMContent, createRootElement} from "../../utils";
import defaultTemplates from './default_templates';
import {HowItWorksConfig, HowItWorksSettings, HowItWorksWidgetClasses} from "./types";
import {
  IEligibility,
  IPaymentPlan
} from "alma-js-client/dist/types/entities/eligibility";

const defaultClasses: HowItWorksWidgetClasses = {
  root: "alma-how_it_works",
  logo: "alma-how_it_works--logo",
  cta: "alma-how_it_works--cta",
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
      }
    }
  }
};

export class HowItWorksWidget extends Widget {
  private modalWrapper: HTMLElement | null;

  constructor(almaClient: Client, options: HowItWorksSettings) {
    // Inject default templates & classes into the given options
    options = {
      displayLogo: true,
      displayInfoIcon: true,
      ctaContent: "Comment ça marche ?",
      samplePlans: [],
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

    this.modalWrapper = null;
  }


  get config(): HowItWorksConfig {
    return {...this._config} as HowItWorksConfig;
  }

  public openModal(e: Event) {
    e.preventDefault();
    this.modalWrapper!.style.display = "block";
    return false;
  }

  public closeModal(e: Event) {
    e.preventDefault();
    this.modalWrapper!.style.display = "none";
    return false;
  }

  protected async prepare(almaClient: Client): Promise<IPaymentPlan[]> {
    if (this.config.samplePlans.length === 0) {
      let samplePlans = await almaClient.payments.eligibility(
        {
          payment: {
            purchase_amount: 30000,
            installments_count: [3, 4]
          }
        }
      ) as IEligibility[];

      return samplePlans.filter(p => p.eligible).map(p => p.payment_plan!);
    } else {
      return this.config.samplePlans;
    }
  }

  protected async render(paymentPlans: IPaymentPlan[]): Promise<DOMContent> {
    let root = document.createElement("div");
    root.className = this.config.classes.root;

    if (this.config.displayLogo) {
      let logoRoot = createRootElement(this.config.classes.logo);
      setDOMContent(logoRoot, this.config.templates.logo(this.config.classes));
      root.appendChild(logoRoot);
    }

    let modalLinkRoot = createRootElement();
    setDOMContent(
      modalLinkRoot,
      this.config.templates.cta(
        this.openModal.bind(this),
        this.config.classes
      )
    );
    root.appendChild(modalLinkRoot);

    let closeModal = this.closeModal.bind(this);
    let content = this.config.templates.modalContent(paymentPlans, closeModal, this.config.classes);

    this.modalWrapper = createRootElement(this.config.classes.modal.root);
    this.modalWrapper.style.display = "none";
    setDOMContent(this.modalWrapper, this.config.templates.modal(content, closeModal, this.config.classes));

    document.body.appendChild(this.modalWrapper);

    return root;
  }
}

export default HowItWorksWidget;
