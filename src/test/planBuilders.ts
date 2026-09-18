/* Identifiers mirror the snake_case API field names being built */
/* eslint-disable camelcase */
import { addDays, addMonths, fromUnixTime, getUnixTime } from 'date-fns'

import { EligiblePlan, IneligiblePlan, PaymentPlan } from '@/types'

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
      const amount = perInstallment + (index === 0 ? remainder : 0)
      return generateInstallment({
        due_date: shiftDueDate(DEFAULT_DUE_DATE, index, addMonths),
        purchase_amount: amount,
        total_amount: amount,
      })
    }),
  }
}

// Declining-balance (annuity) amortization: a fixed total payment per financed installment, with
// the interest/principal split shifting over time as the balance goes down.
// The first installment is an interest-free deposit, not part of the financed balance.
// Only the remaining installments amortize what's financed.
const withInterest = (plan: EligiblePlan, annualInterestRate: number): EligiblePlan => {
  requireStep(
    plan.payment_plan.length > 0,
    'withInterest',
    'plan has no installments yet — call withInstallmentsCount(...) first',
  )

  const installmentsCount = plan.payment_plan.length
  // annualInterestRate is in basis points, matching the annual_interest_rate field convention
  // (e.g. 1720 for 17.20%). The periodic rate is the actuarial monthly-compounded equivalent of
  // the annual rate
  const monthlyRate = (1 + annualInterestRate / BPS_SCALE) ** (1 / NB_MONTH_BY_YEAR) - 1

  // Annuity discount factor: present value of `periods` installments of 1. Dividing a present
  // value by it gives the fixed periodic payment that amortizes it (used for `payment` below).
  // Iterative rather than the closed form (1-(1+r)^-periods)/r, which is 0/0 at monthlyRate === 0.
  const discountFactorSum = (periods: number): number => {
    let sum = 0
    let discount = 1
    for (let i = 0; i < periods; i += 1) {
      discount /= 1 + monthlyRate
      sum += discount
    }
    return sum
  }

  const buildInstallment = (
    installment: PaymentPlan,
    principal: number,
    interest: number,
  ): PaymentPlan => ({
    ...installment,
    customer_interest: interest,
    purchase_amount: principal,
    total_amount: principal + interest + installment.customer_fee,
  })

  const financedInstallmentsCount = installmentsCount - 1
  // Annuity-due: the fixed payment for the financed installments, discounted one extra period
  // since the deposit (the "0th" payment) is due today.
  const payment = Math.floor(
    plan.purchase_amount / (discountFactorSum(installmentsCount) * (1 + monthlyRate)),
  )
  const financedBalance = Math.floor(payment * discountFactorSum(financedInstallmentsCount))
  const deposit = plan.purchase_amount - financedBalance

  let totalInterest = 0
  let balance = financedBalance
  const [firstInstallment, ...financedInstallments] = plan.payment_plan

  const financedPaymentPlan = financedInstallments.map((installment, index) => {
    const isLastInstallment = index === financedInstallmentsCount - 1
    const interest = isLastInstallment ? payment - balance : Math.round(balance * monthlyRate)
    const principal = isLastInstallment ? balance : payment - interest
    balance -= principal
    totalInterest += interest

    return buildInstallment(installment, principal, interest)
  })

  const payment_plan = [buildInstallment(firstInstallment, deposit, 0), ...financedPaymentPlan]

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
  ;(Object.keys(methods) as (keyof M)[]).forEach((key) => {
    Object.defineProperty(builder, key, { value: methods[key], enumerable: false })
  })
  return Object.freeze(builder)
}

/* Circular by design: these methods return EligiblePlanBuilder, which is declared from this interface. */
/* eslint-disable no-use-before-define */
interface EligiblePlanBuilderMethods {
  withPurchaseAmount(amount: number): EligiblePlanBuilder
  withInstallmentsCount(count: number): EligiblePlanBuilder
  withFees(fee: number): EligiblePlanBuilder
  withDeferredMonths(months: number): EligiblePlanBuilder
  withDeferredDays(days: number): EligiblePlanBuilder
  withCountry(countryCode: string): EligiblePlanBuilder
  withInterest(annualInterestRate: number): EligiblePlanBuilder
}
/* eslint-enable no-use-before-define */

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

/* Circular by design: these methods return IneligiblePlanBuilder, which is declared from this interface. */
/* eslint-disable no-use-before-define */
interface IneligiblePlanBuilderMethods {
  withPurchaseAmount(amount: number): IneligiblePlanBuilder
  withInstallmentsCount(count: number): IneligiblePlanBuilder
  withCountry(countryCode: string): IneligiblePlanBuilder
  withConstraints(constraints: IneligiblePlan['constraints']): IneligiblePlanBuilder
  withReasons(reasons: IneligiblePlan['reasons']): IneligiblePlanBuilder
}

/* eslint-enable no-use-before-define */

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
