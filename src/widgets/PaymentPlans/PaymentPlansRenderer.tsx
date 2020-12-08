import cx from 'classnames'

import { integer } from '@/types'
import { QueriedPlanProperties } from '@/widgets/PaymentPlans/types'
import { EligibleEligibility, IEligibility } from '@alma/client/dist/types/entities/eligibility'

import { useEffect, useLayoutEffect, useReducer } from 'preact/hooks'

import { HowItWorksRenderer } from '@/widgets/HowItWorks/HowItWorksRenderer'
import { PlanSummary } from '@/widgets/PaymentPlans/components/PlanSummary'

import almaLogo from '../../assets/alma.svg'
import { render } from 'preact'
import { Client } from '@alma/client'
import { PlanPill } from '@/widgets/PaymentPlans/components/PlanPill'
import { plansPlaceholders } from './components/plansPlaceholders'

type RendererProps = {
  almaClient: Client
  purchaseAmount: integer
  queriedPlans: QueriedPlanProperties[]
  results: IEligibility[]
  transitionDelay: number | false
  error: boolean
  errorRetryCallback: () => void
}

function planIsAvailable(plan: IEligibility): boolean {
  // TODO: Eligibility types need fixing in @alma/client
  return plan.eligible || (plan as any).reasons === undefined
}

type State = {
  shownPlan: integer
  autoRotate: boolean
  showTooltip: boolean
  showInfoModal: boolean
  modalContent: JSX.Element | null
}

type ActionPayload<S extends keyof State> = {
  key: S
  value: State[S]
}

const setState = <S extends keyof State>(key: S, value: State[S]): ActionPayload<S> => ({
  key,
  value,
})

function initState(initialResults: IEligibility[]): State {
  return {
    shownPlan: 0,
    autoRotate: initialResults.length > 0,
    showTooltip: false,
    showInfoModal: false,
    modalContent: null,
  }
}

function reducer(state: State, action: ReturnType<typeof setState>): State {
  return { ...state, [action.key]: action.value }
}

function handleMouseEnter(dispatch: (action: ReturnType<typeof setState>) => void) {
  return () => {
    dispatch(setState('showTooltip', true))
    dispatch(setState('autoRotate', false))
  }
}

function handleMouseLeave(dispatch: (action: ReturnType<typeof setState>) => void) {
  return () => {
    dispatch(setState('showTooltip', false))
    dispatch(setState('autoRotate', true))
  }
}

function useTimeout(timeout: number, cb: () => void): void {
  useEffect(() => {
    const timeoutId = window.setTimeout(cb, timeout)
    return () => clearTimeout(timeoutId)
  }, [timeout, cb])
}

export function PaymentPlansRenderer({
  almaClient,
  purchaseAmount,
  queriedPlans,
  results,
  transitionDelay,
  error,
  errorRetryCallback,
}: RendererProps): JSX.Element {
  const eligiblePlans = results.filter((r) => r.eligible) as EligibleEligibility[]
  const hasEligiblePlans = eligiblePlans.length > 0

  const [state, dispatch] = useReducer(reducer, results, initState)

  useEffect(() => {
    dispatch(setState('autoRotate', results.length > 0))
  }, [results])

  // Automatically transition from one plan to another
  if (state.autoRotate && transitionDelay && results.length > 1) {
    useTimeout(transitionDelay, () => {
      dispatch(setState('shownPlan', (state.shownPlan + 1) % results.length))
    })
  }

  useLayoutEffect(() => {
    if (state.showInfoModal && hasEligiblePlans) {
      // To show correctly, the modal needs to be injected into the document's body
      const container = document.createElement('div')
      container.className = 'alma-widget-root'
      document.body.appendChild(container)

      render(
        <HowItWorksRenderer
          almaClient={almaClient}
          purchaseAmount={purchaseAmount}
          installmentsCounts={eligiblePlans.map((ep) => ep.installments_count)}
          closeCallback={() => dispatch(setState('showInfoModal', false))}
          samplePlans={eligiblePlans.map((ep) => ep.payment_plan)}
        />,
        container,
      )

      return () => document.body.removeChild(container)
    }
  }, [state.showInfoModal, hasEligiblePlans])

  let planPills: JSX.Element[], planSummary: JSX.Element
  if (results.length === 0 || error) {
    // We're still loading results, or having an issue, but we know what pills should be presented
    // so show placeholders
    ;({ planPills, planSummary } = plansPlaceholders({ error, queriedPlans, errorRetryCallback }))
  } else {
    const { shownPlan } = state

    planPills = results
      .filter(planIsAvailable)
      .map((r, idx) => (
        <PlanPill
          key={idx}
          eligibility={r}
          isActive={shownPlan === idx}
          mouseEnterCallback={() => dispatch(setState('shownPlan', idx))}
        />
      ))

    planSummary = <PlanSummary purchaseAmount={purchaseAmount} eligibility={results[shownPlan]} />
  }

  return (
    <div
      onMouseEnter={handleMouseEnter(dispatch)}
      onMouseLeave={handleMouseLeave(dispatch)}
      onClick={() => !error && hasEligiblePlans && dispatch(setState('showInfoModal', true))}
    >
      <p
        className={cx(
          !error && state.showTooltip && hasEligiblePlans ? 'atw-opacity-100' : 'atw-opacity-0',
          'atw-transition-opacity',
          'atw-duration-200',
          'atw-my-1',
          'atw-pl-1',
          'atw-text-xs',
          'atw-font-normal',
          'atw-text-right',
        )}
      >
        cliquez pour plus d'infos
      </p>
      <div className="atw-bg-white atw-cursor-pointer atw-flex atw-flex-row atw-items-center atw-flex-wrap atw-text-xs atw-p-2 atw-pb-0 atw-rounded-md atw-border atw-border-blue atw-border-opacity-50">
        <img className="atw-h-5 atw-mb-2" src={almaLogo} alt="Alma" />
        <span className="atw-flex atw-flex-row atw-space-x-1 atw-mx-2 atw-mb-1">{planPills}</span>
        <span className="atw-inline-block atw-mb-2 atw-flex-grow atw-text-sm">{planSummary}</span>
      </div>
    </div>
  )
}
