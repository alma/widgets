import { html, type TemplateResult } from 'lit'

import type { IntlShape } from '@/shared/i18n/i18n.types'
import { cardMessages } from '@/shared/ui/icons/cards/cards.messages'

// Master's markup minus nine unused IDs that two logos on one page would duplicate.
export const mastercardTemplate = (intl: IntlShape): TemplateResult =>
  html`<svg
    width="24"
    height="16"
    viewBox="0 0 24 16"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    aria-label=${intl.formatMessage(cardMessages.mastercard)}
    role="img"
  >
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-269.000000, -313.000000)">
        <g transform="translate(269.000000, 313.000000)">
          <rect fill="#FFFFFF" x="0" y="0" width="24" height="16" rx="1" />
          <g transform="translate(4.000000, 3.000000)">
            <circle fill="#EA001B" cx="5.05263158" cy="5.05263158" r="5.05263158" />
            <circle
              fill-opacity="0.25"
              fill="#F79F1A"
              cx="10.9473684"
              cy="5.05263158"
              r="5.05263158"
            />
            <circle
              fill-opacity="0.6"
              fill="#F79F1A"
              cx="10.9473684"
              cy="5.05263158"
              r="5.05263158"
            />
            <circle
              fill-opacity="0.3"
              fill="#EA001B"
              cx="5.05263158"
              cy="5.05263158"
              r="5.05263158"
            />
          </g>
        </g>
      </g>
    </g>
  </svg>`
