import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import cx from 'classnames'

import s from './Title.module.css'

const Title: FC<{ isSomePlanDeferred: boolean, isCurrentPlanP1X:boolean }> = ({ isSomePlanDeferred, isCurrentPlanP1X }) => (
  <div
    className={cx(s.title, STATIC_CUSTOMISATION_CLASSES.title)}
    data-testid="modal-title-element"
  >
    {isSomePlanDeferred ? (
      <FormattedMessage
        id="eligibility-modal.title-deferred-plan"
        defaultMessage="Payez en plusieurs fois ou plus tard par carte bancaire avec Alma."
      />
    ) : isCurrentPlanP1X ? (<FormattedMessage
      id="eligibility-modal.title-pay-now"
      defaultMessage="Payez comptant par carte bancaire avec Alma."
    />
    ) : (
      <FormattedMessage
        id="eligibility-modal.title-normal"
        defaultMessage="Payez en plusieurs fois par carte bancaire avec Alma."
      />
    )}
  </div>
)

export default Title
