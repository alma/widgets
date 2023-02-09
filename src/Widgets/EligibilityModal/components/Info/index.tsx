import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

import s from './Info.module.css'
import cx from 'classnames'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'

const Info: FC = () => (
  <div className={cx(s.list, STATIC_CUSTOMISATION_CLASSES.info)} data-testid="modal-info-element">
    <div className={s.listItem}>
      <div className={cx(s.bullet, STATIC_CUSTOMISATION_CLASSES.bullet)}>1</div>
      <div className={STATIC_CUSTOMISATION_CLASSES.infoMessage}>
        <FormattedMessage
          id="eligibility-modal.bullet-1"
          defaultMessage="Choisissez <strong>Alma</strong> au moment du paiement."
          values={{ strong: (...chunks: string[]) => <strong>{chunks}</strong> }}
        />
      </div>
    </div>
    <div className={s.listItem}>
      <div className={cx(s.bullet, STATIC_CUSTOMISATION_CLASSES.bullet)}>2</div>
      <div className={STATIC_CUSTOMISATION_CLASSES.infoMessage}>
        <FormattedMessage
          id="eligibility-modal.bullet-2"
          defaultMessage="Laissez-vous guider et validez votre paiement en <strong>2 minutes.</strong>"
          values={{ strong: (...chunks: string[]) => <strong>{chunks}</strong> }}
        />
      </div>
    </div>
    <div className={s.listItem}>
      <div className={cx(s.bullet, STATIC_CUSTOMISATION_CLASSES.bullet)}>3</div>
      <div className={STATIC_CUSTOMISATION_CLASSES.infoMessage}>
        <FormattedMessage
          id="eligibility-modal.bullet-3"
          defaultMessage="<strong>Gardez le contrôle</strong> en avançant ou reculant vos échéances à votre rythme."
          values={{ strong: (...chunks: string[]) => <strong>{chunks}</strong> }}
        />
      </div>
    </div>
  </div>
)

export default Info
