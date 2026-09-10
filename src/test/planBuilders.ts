import { EligiblePlan, IneligiblePlan, PaymentPlan } from '@/types'
import { addDays, addMonths, fromUnixTime, getUnixTime } from 'date-fns'

const DEFAULT_DUE_DATE = 1638350762
const BPS_SCALE = 10000
const NB_MONTH_BY_YEAR = 12

const requireStep = (condition: boolean, methodName: string, hint: string): void => {
  if (!condition) {
    throw new Error(`${methodName}: ${hint}`)
  }
}

const toBps = (amount: number, base: number): number => Math.round((amount / base) * BPS_SCALE)

const deriveTotalCosts = (plan: {
  customer_fee: number
  customer_interest: number
  purchase_amount: number
}) => {
  const customer_total_cost_amount = plan.customer_fee + plan.customer_interest
  return {
    customer_total_cost_amount,
    customer_total_cost_bps: toBps(customer_total_cost_amount, plan.purchase_amount),
  }
}

// date-fns treats a numeric argument as milliseconds, but due_date is Unix seconds —
// round-trip through from/getUnixTime to bridge the units.
const shiftDueDate = (
  dueDate: number,
  offset: number,
  addOffset: (date: Date, offet: number) => Date,
): number => getUnixTime(addOffset(fromUnixTime(dueDate), offset))

const generateInstallment = (partials: Partial<PaymentPlan> = {}): PaymentPlan => ({
  customer_fee: 0,
  customer_interest: 0,
  due_date: DEFAULT_DUE_DATE,
  purchase_amount: 0,
  total_amount: 0,
  ...partials,
})

// Shared by both eligible and ineligible plans: they only differ on payment_plan/fees/interest
// (eligible) vs. constraints/reasons (ineligible), not on these base fields.
const withPurchaseAmount = <T extends { purchase_amount: number }>(
  plan: T,
  purchase_amount: number,
): T => ({
  ...plan,
  purchase_amount,
})

const withCountry = <T extends { transaction_country: string }>(
  plan: T,
  transaction_country: string,
): T => ({
  ...plan,
  transaction_country,
})

const withFees = (plan: EligiblePlan, customer_fee: number): EligiblePlan => {
  requireStep(
    plan.payment_plan.length > 0,
    'withFees',
    'plan has no installments yet — call withInstallmentsCount(...) first',
  )
  return {
    ...plan,
    customer_fee,
    ...deriveTotalCosts({ ...plan, customer_fee }),
    payment_plan: plan.payment_plan.map((installment, index) => {
      const fee = index === 0 ? customer_fee : 0
      return { ...installment, customer_fee: fee, total_amount: installment.total_amount + fee }
    }),
  }
}

const withDeferredMonths = (plan: EligiblePlan, deferred_months: number): EligiblePlan => {
  requireStep(
    plan.payment_plan.length > 0,
    'withDeferredMonths',
    'plan has no installments yet — call withInstallmentsCount(...) first',
  )
  return {
    ...plan,
    deferred_months,
    payment_plan: plan.payment_plan.map((installment) => ({
      ...installment,
      due_date: shiftDueDate(installment.due_date, deferred_months, addMonths),
    })),
  }
}

const withDeferredDays = (plan: EligiblePlan, deferred_days: number): EligiblePlan => {
  requireStep(
    plan.payment_plan.length > 0,
    'withDeferredDays',
    'plan has no installments yet — call withInstallmentsCount(...) first',
  )
  return {
    ...plan,
    deferred_days,
    payment_plan: plan.payment_plan.map((installment) => ({
      ...installment,
      due_date: shiftDueDate(installment.due_date, deferred_days, addDays),
    })),
  }
}

const withInstallmentsCount = (plan: EligiblePlan, installments_count: number): EligiblePlan => {
  requireStep(
    plan.purchase_amount !== 0,
    'withInstallmentsCount',
    'purchase_amount not set — call withPurchaseAmount(...) first',
  )
  const perInstallment = Math.floor(plan.purchase_amount / installments_count)
  const remainder = plan.purchase_amount - perInstallment * installments_count

  return {
    ...plan,
    installments_count,
    payment_plan: Array.from({ length: installments_count }, (_, index) => {
      const amount = perInstallment + (index === installments_count - 1 ? remainder : 0)
      return generateInstallment({
        due_date: shiftDueDate(DEFAULT_DUE_DATE, index, addMonths),
        purchase_amount: amount,
        total_amount: amount,
      })
    }),
  }
}

// Declining-balance (annuity) amortization: a fixed total payment per installment,
// with the interest/principal split shifting over time as the balance goes down.
const withInterest = (plan: EligiblePlan, annualInterestRate: number): EligiblePlan => {
  requireStep(
    plan.payment_plan.length > 0,
    'withInterest',
    'plan has no installments yet — call withInstallmentsCount(...) first',
  )

  const installmentsCount = plan.payment_plan.length
  // annualInterestRate is in basis points, matching the annual_interest_rate field convention
  // (e.g. 1720 for 17.20%) — convert to a monthly decimal rate.
  const monthlyRate = annualInterestRate / BPS_SCALE / NB_MONTH_BY_YEAR
  const payment =
    monthlyRate === 0
      ? Math.round(plan.purchase_amount / installmentsCount)
      : Math.round(
          (plan.purchase_amount * monthlyRate) / (1 - (1 + monthlyRate) ** -installmentsCount),
        )

  let balance = plan.purchase_amount
  let totalInterest = 0

  const payment_plan = plan.payment_plan.map((installment, index) => {
    const isLastInstallment = index === installmentsCount - 1
    const interest = monthlyRate === 0 ? 0 : Math.round(balance * monthlyRate)
    const principal = isLastInstallment ? balance : payment - interest
    balance -= principal
    totalInterest += interest

    return {
      ...installment,
      customer_interest: interest,
      purchase_amount: principal,
      total_amount: principal + interest + installment.customer_fee,
    }
  })

  return {
    ...plan,
    annual_interest_rate: annualInterestRate,
    customer_interest: totalInterest,
    ...deriveTotalCosts({ ...plan, customer_interest: totalInterest }),
    payment_plan,
  }
}

const attachBuilderMethods = <P extends object, M extends object>(
  plan: P,
  methods: M,
): Readonly<P & M> => {
  const builder = { ...plan } as P & M
  for (const key of Object.keys(methods) as (keyof M)[]) {
    Object.defineProperty(builder, key, { value: methods[key], enumerable: false })
  }
  return Object.freeze(builder)
}

interface EligiblePlanBuilderMethods {
  withPurchaseAmount(amount: number): EligiblePlanBuilder
  withInstallmentsCount(count: number): EligiblePlanBuilder
  withFees(fee: number): EligiblePlanBuilder
  withDeferredMonths(months: number): EligiblePlanBuilder
  withDeferredDays(days: number): EligiblePlanBuilder
  withCountry(countryCode: string): EligiblePlanBuilder
  withInterest(annualInterestRate: number): EligiblePlanBuilder
}

export type EligiblePlanBuilder = EligiblePlan & EligiblePlanBuilderMethods

const buildEligiblePlan = (plan: EligiblePlan): EligiblePlanBuilder => {
  const methods: EligiblePlanBuilderMethods = {
    withPurchaseAmount: (amount) => buildEligiblePlan(withPurchaseAmount(plan, amount)),
    withInstallmentsCount: (count) => buildEligiblePlan(withInstallmentsCount(plan, count)),
    withFees: (fee) => buildEligiblePlan(withFees(plan, fee)),
    withInterest: (annualInterestRate) => buildEligiblePlan(withInterest(plan, annualInterestRate)),
    withDeferredMonths: (months) => buildEligiblePlan(withDeferredMonths(plan, months)),
    withDeferredDays: (days) => buildEligiblePlan(withDeferredDays(plan, days)),
    withCountry: (countryCode) => buildEligiblePlan(withCountry(plan, countryCode)),
  }

  return attachBuilderMethods({ ...plan, eligible: true }, methods)
}

const EMPTY_ELIGIBLE_PLAN: EligiblePlan = {
  customer_total_cost_amount: 0,
  customer_total_cost_bps: 0,
  customer_interest: 0,
  customer_fee: 0,
  deferred_days: 0,
  deferred_months: 0,
  eligible: true,
  installments_count: 0,
  payment_plan: [],
  purchase_amount: 0,
  transaction_country: 'FR',
}

export const eligiblePlanBuilder = (): EligiblePlanBuilder => buildEligiblePlan(EMPTY_ELIGIBLE_PLAN)

interface IneligiblePlanBuilderMethods {
  withPurchaseAmount(amount: number): IneligiblePlanBuilder
  withInstallmentsCount(count: number): IneligiblePlanBuilder
  withCountry(countryCode: string): IneligiblePlanBuilder
  withConstraints(constraints: IneligiblePlan['constraints']): IneligiblePlanBuilder
  withReasons(reasons: IneligiblePlan['reasons']): IneligiblePlanBuilder
}

export type IneligiblePlanBuilder = IneligiblePlan & IneligiblePlanBuilderMethods

const buildIneligiblePlan = (plan: IneligiblePlan): IneligiblePlanBuilder => {
  const methods: IneligiblePlanBuilderMethods = {
    withPurchaseAmount: (amount) => buildIneligiblePlan(withPurchaseAmount(plan, amount)),
    withInstallmentsCount: (count) => buildIneligiblePlan({ ...plan, installments_count: count }),
    withCountry: (countryCode) => buildIneligiblePlan(withCountry(plan, countryCode)),
    withConstraints: (constraints) => buildIneligiblePlan({ ...plan, constraints }),
    withReasons: (reasons) => buildIneligiblePlan({ ...plan, reasons }),
  }

  return attachBuilderMethods({ ...plan, eligible: false }, methods)
}

const EMPTY_INELIGIBLE_PLAN: IneligiblePlan = {
  deferred_days: 0,
  deferred_months: 0,
  eligible: false,
  installments_count: 0,
  purchase_amount: 0,
  transaction_country: 'FR',
  reasons: {},
}

export const ineligiblePlanBuilder = (): IneligiblePlanBuilder =>
  buildIneligiblePlan(EMPTY_INELIGIBLE_PLAN)
