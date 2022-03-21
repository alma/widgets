import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

import s from './Title.module.css'

const Title: FC = () => (
  <div className={s.title} data-testid="modal-title-element">
    <FormattedMessage
      id="eligibility-modal.title"
      defaultMessage="<highlighted>Payez en plusieurs fois</highlighted> ou plus tard par carte bancaire avec Alma."
      values={{ highlighted: (...chunks: string[]) => <span>{chunks}</span> }}
    />
  </div>
)

export default Title
