import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import cx from 'classnames'

import s from './Title.module.css'

const Title: FC<{ isSomePlanDeferred: boolean }> = ({ isSomePlanDeferred }) => (
  <div
    className={cx(s.title, STATIC_CUSTOMISATION_CLASSES.title)}
    data-testid="modal-title-element"
  >
    {isSomePlanDeferred ? (
      <FormattedMessage
        id={'eligibility-modal.title-deferred'}
        defaultMessage="<highlighted>Payez en plusieurs fois</highlighted> ou plus tard par carte bancaire avec Alma."
        values={{ highlighted: (...chunks: string[]) => <span>{chunks}</span> }}
      />
    ) : (
      <FormattedMessage
        id={'eligibility-modal.title'}
        defaultMessage="<highlighted>Payez en plusieurs fois</highlighted> par carte bancaire avec Alma."
        values={{ highlighted: (...chunks: string[]) => <span>{chunks}</span> }}
      />
    )}
  </div>
)

export default Title
