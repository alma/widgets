import React, { FC } from 'react'

import { useIntl } from 'react-intl'

const CbCard: FC = () => {
  const intl = useIntl()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="16"
      viewBox="0 0 24 16"
      aria-label={intl.formatMessage({
        id: 'accessibility.cb-card.aria-label',
        defaultMessage: 'Carte Bancaire CB acceptée',
      })}
      role="img"
    >
      <defs>
        <linearGradient id="cardcb" x1="5.842%" x2="95.393%" y1="81.753%" y2="17.344%">
          <stop offset="0%" stopColor="#39B54A" />
          <stop offset="100%" stopColor="#0A5296" />
        </linearGradient>
      </defs>
      <g fill="none" fillRule="nonzero">
        <path
          fill="url(#cardcb)"
          d="M22.621 16H1.38C.627 16 0 15.392 0 14.662V1.338C0 .608.627 0 1.379 0H22.62C23.373 0 24 .608 24 1.338v13.324c-.063.73-.627 1.338-1.379 1.338z"
        />
        <g fill="#FFF">
          <path d="M19.094 4.03h-6.437V8h6.498c1.165 0 2.084-.889 2.084-2.015-.06-1.066-.98-1.955-2.145-1.955zM19.094 8.593h-6.437v3.97h6.498c1.165 0 2.084-.889 2.084-2.015-.06-1.067-.98-1.955-2.145-1.955zM7.017 8.06h4.966c-.245-2.371-2.391-4.267-4.966-4.267-2.758 0-5.027 2.074-5.027 4.681s2.269 4.682 5.027 4.682c2.698 0 4.904-2.015 5.027-4.563H7.017v-.534z" />
        </g>
      </g>
    </svg>
  )
}

export default CbCard
