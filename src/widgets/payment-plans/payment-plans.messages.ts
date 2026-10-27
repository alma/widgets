import { defineMessages } from '@/shared/i18n/define-messages'

export const paymentPlansMessages = defineMessages({
  planSelectionChanged: {
    id: 'accessibility.plan-selection-changed',
    defaultMessage: 'Plan sélectionné : {planDescription}',
  },
  openButtonAriaLabel: {
    id: 'accessibility.payment-widget.open-button.aria-label',
    defaultMessage: 'Ouvrir les options de paiement Alma pour en savoir plus',
  },
  listboxAriaLabel: {
    id: 'accessibility.payment-options.listbox.aria-label',
    defaultMessage: 'Options de paiement disponibles',
  },
  planOptionAriaLabel: {
    id: 'accessibility.payment-plan.option.aria-label',
    defaultMessage: 'Option de paiement {planDescription}',
  },
  paymentInfoSectionTitle: {
    id: 'accessibility.payment-info.section-title',
    defaultMessage: 'Informations sur le plan de paiement sélectionné',
  },
})
