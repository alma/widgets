import { defineMessages } from '@/shared/i18n/define-messages'

export const totalBlockMessages = defineMessages({
  totalAmount: {
    id: 'installments.total-amount',
    defaultMessage: 'Total',
  },
  totalFees: {
    id: 'installments.total-fees',
    defaultMessage: 'Dont frais (TTC)',
  },
  totalCreditCost: {
    id: 'credit-features.total-credit-cost',
    defaultMessage: 'Dont coût du crédit (TTC)',
  },
  creditCostDisplay: {
    id: 'credit-features.credit-cost-display',
    defaultMessage: '{creditCost} (TAEG {annualPercentageRate})',
  },
})
