import React, { FC } from 'react'

import cx from 'classnames'
import { FormattedMessage } from 'react-intl'

import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import s from 'Widgets/EligibilityModal/components/Title/Title.module.css'

const Title: FC<{ isSomePlanDeferred: boolean; isCurrentPlanP1X: boolean }> = ({
  isSomePlanDeferred,
  isCurrentPlanP1X,
}) => (
  <h5
    id="modal-title"
    className={cx(s.title, STATIC_CUSTOMISATION_CLASSES.title)}
    data-testid="modal-title-element"
  >
    {isSomePlanDeferred && (
      <FormattedMessage
        id="eligibility-modal.title-deferred-plan"
        defaultMessage="Payez en plusieurs fois ou plus tard par carte bancaire avec Alma."
      />
    )}
    {!isSomePlanDeferred && isCurrentPlanP1X && (
      <FormattedMessage
        id="eligibility-modal.title-pay-now"
        defaultMessage="Payez comptant par carte bancaire avec Alma."
      />
    )}
    {!isSomePlanDeferred && !isCurrentPlanP1X && (
      <FormattedMessage
        id="eligibility-modal.title-normal"
        defaultMessage="Payez en plusieurs fois par carte bancaire avec Alma."
      />
    )}
  </h5>
)

export default Title
