import { useEffect, useState } from 'preact/hooks'

import { integer } from '@/types'
import {
  EligibleEligibility,
  IEligibility,
  IPaymentPlan,
} from '@alma/client/dist/types/entities/eligibility'

import { Client } from '@alma/client'

import { Modal } from '@/components/Modal'
import { PlanIntro } from './components/PlanIntro'
import { PlanSelector } from './components/PlanSelector/PlanSelector'
import { PaymentPlan } from './components/PaymentPlan/PaymentPlan'

import './styles.scss'
import almaLogo from '../../assets/alma.svg'
import { CardLogo } from '@/components/CardLogo'

type HowItWorksProps = {
  almaClient: Client
  purchaseAmount: integer
  installmentsCounts: integer[]
  samplePlans?: IPaymentPlan[]
  closeCallback: () => void
}

function planForN(plans: IPaymentPlan[], n: integer): IPaymentPlan | null {
  return plans.find((p) => p.length === n) || null
}

async function fetchSamplePlans(
  almaClient: Client,
  purchaseAmount: integer,
  installmentsCounts: integer[],
): Promise<IPaymentPlan[]> {
  const plans: IEligibility[] = await almaClient.payments.eligibility({
    payment: {
      purchase_amount: purchaseAmount,
      installments_count: installmentsCounts,
    },
  })

  return (plans.filter((p) => p.eligible) as EligibleEligibility[]).map((p) => p.payment_plan)
}

export function HowItWorksRenderer({
  almaClient,
  purchaseAmount,
  installmentsCounts,
  samplePlans: initialSamplePlans = [],
  closeCallback,
}: HowItWorksProps): JSX.Element {
  const [shownInstallmentsCount, setShownInstallmentsCount] = useState(0)
  const [samplePlans, setSamplePlans] = useState(initialSamplePlans)

  useEffect(() => {
    // Select "p3x" by default, or the plan with highest installments count if p3x not present
    const defaultInstallmentsCount = samplePlans
      .map((p) => p.length)
      .reduce((prev, n) => (prev !== 3 && n > prev ? n : prev), 0)

    setShownInstallmentsCount(defaultInstallmentsCount)
  }, [samplePlans])

  useEffect(() => {
    if (!samplePlans.length) {
      fetchSamplePlans(almaClient, purchaseAmount, installmentsCounts)
        .then(setSamplePlans)
        .catch(() => {
          return null
        })
    }
  }, [purchaseAmount, installmentsCounts, samplePlans])

  const shownPlan = planForN(samplePlans, shownInstallmentsCount)

  return (
    <Modal closeCallback={closeCallback}>
      <div className="atw-overflow-auto atw-relative atw-flex atw-flex-row atw-flex-wrap atw-rounded-sm atw-shadow-lg atw-w-screen atw-h-screen md:atw-h-650 lg:atw-w-9/12 md:atw-max-w-3xl atw-max-h-screen atw-bg-white atw-text-base">
        <button
          onClick={closeCallback}
          className="atw-text-3xl atw-opacity-50 hover:atw-opacity-100 focus:atw-opacity-100 atw-absolute atw-top-3 atw-right-4 atw-outline-none atw-transform hover:atw-scale-125 focus:atw-scale-125 atw-transition-transform atw-duration-100"
        >
          &times;
        </button>

        <div className="atw-w-full md:atw-w-1/2 atw-p-8">
          <img className="atw-h-8" src={almaLogo} alt="Alma" />

          <div className="alma-title-text atw-text-5xl atw-font-bold atw-mt-8">
            Payer avec Alma c'est simple <br />
            et <span className="alma-text-highlight-md">immédiat</span>
          </div>

          <ul className="alma-howItWorks__steps atw-my-10">
            <li className="atw-pl-8 atw-mb-5">Validez votre panier</li>
            <li className="atw-pl-8 atw-mb-5">
              Sélectionnez l'option de paiement en plusieurs fois Alma
            </li>
            <li className="atw-pl-8 atw-mb-5">
              Entrez votre numéro de carte bancaire, et c'est tout !
            </li>
          </ul>

          <p>
            <a
              href="https://getalma.eu/customers"
              target="_blank"
              className="atw-text-xs atw-underline"
            >
              Une question ? Visitez notre page dédiée
            </a>
          </p>

          <p className="atw-mt-7 atw-space-x-3">
            <span className="atw-inline-block atw-h-10 atw-border atw-border-orange atw-rounded-md atw-p-2">
              <CardLogo brand="cb" />
            </span>
            <span className="atw-inline-block atw-h-10 atw-border atw-border-orange atw-rounded-md atw-p-2">
              <CardLogo brand="visa" />
            </span>
            <span className="atw-inline-block atw-h-10 atw-border atw-border-orange atw-rounded-md atw-p-1">
              <CardLogo brand="mastercard" />
            </span>
          </p>
        </div>
        <div className="alma-howItWorks__planPanel atw-w-full md:atw-w-1/2 atw-p-8 atw-pb-24 md:atw-pb-8 md:atw-pt-24 atw-flex atw-flex-col atw-align-center atw-bg-beige">
          <div className="atw-flex-grow">
            <PlanSelector
              installmentsCounts={samplePlans.map((p) => p.length)}
              selectedPlan={shownInstallmentsCount}
              onSelect={setShownInstallmentsCount}
            />

            <PlanIntro plan={shownPlan} />

            <PaymentPlan plan={shownPlan} />
          </div>

          {/* First wrapper to make the button fixed and displayed over the rest of the modal on small screens */}
          <div className="atw-mt-8 atw-fixed md:atw-relative atw-shadow-above-md md:atw-shadow-none atw-p-4 md:atw-p-0 atw-bg-beige md:atw-bg-transparent atw-bottom-0 atw-left-0 atw-right-0">
            {/* Second wrappers for the drop shadow, so that it's retained when showing the button's shadow outline */}
            <div className="atw-shadow-xl atw-rounded-sm">
              {/* The actual button, that will get a shadow-based outline upon focus/hover (which justifies inner wrapper) */}
              <button
                onClick={closeCallback}
                className="atw-w-full atw-uppercase atw-bg-red atw-text-white atw-h-12 atw-rounded-sm alma-title-text atw-bg-gradient-to-b atw-from-red atw-via-red atw-to-red-700 atw-outline-none hover:atw-shadow-outline-red focus:atw-shadow-outline-red"
              >
                J'ai compris
              </button>
            </div>
            {shownPlan && shownPlan.length > 4 && (
              <div className="atw-font-light atw-mt-6">
                Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de
                remboursement avant de vous engager.
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
