import cx from 'classnames'

import { integer } from '@/types'
import { QueriedPlanProperties } from '@/widgets/PaymentPlans/types'
import { EligibleEligibility, IEligibility } from '@alma/client/dist/types/entities/eligibility'

import { useEffect, useLayoutEffect, useReducer } from 'preact/hooks'

import { HowItWorksRenderer } from '@/widgets/HowItWorks/HowItWorksRenderer'
import { PlanSummary } from '@/widgets/PaymentPlans/PlanSummary'

import almaLogo from '../../assets/alma.svg'
import { render } from 'preact'
import { Client } from '@alma/client'

type RendererProps = {
  almaClient: Client
  purchaseAmount: integer
  queriedPlans: QueriedPlanProperties[]
  results: IEligibility[]
  transitionDelay: number
  error?: boolean
  retryCallback?: () => void
}

const basePillClasses = [
  'atw-inline-block',
  'atw-p-1',
  'atw-text-white',
  'atw-rounded-sm',
  'atw-transition-colors',
  'atw-duration-500',
  'atw-select-none',
]

function planIsAvailable(plan: IEligibility): boolean {
  // TODO: Eligibility types need fixing in @alma/client
  return plan.eligible || (plan as any).reasons === undefined
}

function PillPlaceholder({ plan }: { plan: QueriedPlanProperties }): JSX.Element {
  return (
    <span className="atw-animate-pulse">
      <span
        className={cx(...basePillClasses, 'atw-bg-blue', 'atw-opacity-25', 'atw-w-full atw-h-full')}
      >
        {plan.installmentsCount}⨉
      </span>
    </span>
  )
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

export function PaymentPlansRenderer({
  almaClient,
  purchaseAmount,
  queriedPlans,
  results,
  transitionDelay,
  error,
  retryCallback,
}: RendererProps): JSX.Element | null {
  let planPills: JSX.Element[], planSummary: JSX.Element

  const [state, dispatch] = useReducer(reducer, results, initState)

  useEffect(() => {
    dispatch(setState('autoRotate', results.length > 0))
  }, [results])

  // Automatically transition from one plan to another
  useEffect(() => {
    let timeoutId: number | null = null
    if (state.autoRotate) {
      timeoutId = window.setTimeout(() => {
        dispatch(setState('shownPlan', (state.shownPlan + 1) % results.length))
      }, transitionDelay)
    }

    return () => timeoutId && clearTimeout(timeoutId)
  }, [state.autoRotate, state.shownPlan])

  const eligiblePlans = results.filter((r) => r.eligible) as EligibleEligibility[]
  const hasEligiblePlans = eligiblePlans.length > 0

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
          installmentsCounts={eligiblePlans.map((p) => p.installments_count)}
          closeCallback={() => dispatch(setState('showInfoModal', false))}
          samplePlans={eligiblePlans.map((r) => r.payment_plan)}
        />,
        container,
      )

      return () => document.body.removeChild(container)
    }
  }, [state.showInfoModal, hasEligiblePlans])

  if (results.length === 0 || error) {
    // We're still loading results, or having an issue, but we know what pills should be presented
    // so show placeholders
    planPills = queriedPlans.map((p, idx) => <PillPlaceholder plan={p} key={idx} />)

    if (error) {
      planSummary = (
        <span>
          <span className="atw-text-xs">ERREUR</span> &nbsp;
          <span className="atw-text-blue atw-underline" onClick={retryCallback}>
            réessayer
          </span>
        </span>
      )
    } else {
      planSummary = (
        <span className="atw-animate-pulse">
          <span className="atw-inline-block atw-h-4 atw-bg-blue atw-opacity-25 atw-rounded-sm atw-w-full">
            &nbsp;
          </span>
        </span>
      )
    }
  } else {
    const { shownPlan } = state

    planPills = results.filter(planIsAvailable).map((r, idx) => (
      <span
        key={idx}
        className={cx(...basePillClasses, {
          'atw-bg-red': shownPlan === idx && r.eligible,
          'atw-bg-blue': shownPlan !== idx || !r.eligible,
          'atw-bg-opacity-75': shownPlan !== idx,
        })}
        onMouseEnter={() => dispatch(setState('shownPlan', idx))}
      >
        {r.installments_count}⨉
      </span>
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
        <span className="atw-flex atw-flex-row atw-space-x-1 atw-mx-2 atw-mb-2">{planPills}</span>
        <span className="atw-inline-block atw-mb-2 atw-flex-grow atw-text-sm">{planSummary}</span>
      </div>
    </div>
  )
}
