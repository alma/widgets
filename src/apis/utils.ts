import { ConfigPlan } from 'types'

type Queries = {
  installments_count: number | undefined
  deferred_days: number | undefined
  deferred_months: number | undefined
}
export const createQueriesFromPlans = (plans: ConfigPlan[]): Queries[] => {
  return plans?.map((plan) => ({
    installments_count: plan?.installmentsCount,
    deferred_days: plan?.deferredDays,
    deferred_months: plan?.deferredMonths,
  }))
}
