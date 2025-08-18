import React, { FC } from 'react'

import { useIntl } from 'react-intl'

const MasterCard: FC = () => {
  const intl = useIntl()

  return (
    <svg
      width="24px"
      height="16px"
      viewBox="0 0 24 16"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={intl.formatMessage({
        id: 'accessibility.mastercard.aria-label',
        defaultMessage: 'Carte Mastercard acceptée',
      })}
      role="img"
    >
      <g id="Parcours-1C-B" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="mobile-1C-Paiement-V1" transform="translate(-269.000000, -313.000000)">
          <g id="mastercard" transform="translate(269.000000, 313.000000)">
            <rect id="Rectangle" fill="#FFFFFF" x="0" y="0" width="24" height="16" rx="1" />
            <g id="Group-6" transform="translate(4.000000, 3.000000)">
              <circle
                id="Oval-4-Copy"
                fill="#EA001B"
                cx="5.05263158"
                cy="5.05263158"
                r="5.05263158"
              />
              <circle
                id="Oval-4"
                fillOpacity="0.25"
                fill="#F79F1A"
                cx="10.9473684"
                cy="5.05263158"
                r="5.05263158"
              />
              <circle
                id="Oval-4-Copy-2"
                fillOpacity="0.6"
                fill="#F79F1A"
                cx="10.9473684"
                cy="5.05263158"
                r="5.05263158"
              />
              <circle
                id="Oval-4-Copy-3"
                fillOpacity="0.3"
                fill="#EA001B"
                cx="5.05263158"
                cy="5.05263158"
                r="5.05263158"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

export default MasterCard
