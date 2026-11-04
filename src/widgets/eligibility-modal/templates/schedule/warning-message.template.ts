import { html, nothing, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import type { IntlShape, MessageDescriptor } from '@/shared/i18n/i18n.types'
import { warningMessages } from '@/widgets/eligibility-modal/eligibility-modal.messages'
import styles from '@/widgets/eligibility-modal/templates/schedule/warning-message.module.css'

export interface WarningMessageParams {
  currentPlan: EligibilityPlanToDisplay
  intl: IntlShape
}

/**
 * Keyed by `transaction_country` only
 */
const WARNINGS_BY_COUNTRY: Record<string, MessageDescriptor> = {
  FR: warningMessages.fr,
  LU: warningMessages.lu,
  // Belgium is a single id: the FR/NL split of the mapping is a locale concern, so Crowdin serves
  // the Dutch wording to nl visitors rather than us branching on the country twice.
  BE: warningMessages.be,
  NL: warningMessages.nl,
  IT: warningMessages.it,
  DE: warningMessages.de,
  PT: warningMessages.pt,
  ES: warningMessages.es,
  GB: warningMessages.gb,
  // The mapping names this row "UK"; accept the non-ISO code in case the API sends it.
  UK: warningMessages.gb,
}

export const warningMessageTemplate = ({
  currentPlan,
  intl,
}: WarningMessageParams): TemplateResult | typeof nothing => {
  const warning = WARNINGS_BY_COUNTRY[currentPlan.transaction_country?.toUpperCase()]

  // An unmapped country has no approved wording, and showing another country's legal warning would
  // be worse than showing none.
  if (!warning) {
    return nothing
  }

  return html`<p class=${classMap({ [styles.warning]: true })}>${intl.formatMessage(warning)}</p>`
}
