import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

import s from './Info.module.css'
import cx from 'classnames'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'

const Info: FC = () => (
  <div className={cx(s.list, STATIC_CUSTOMISATION_CLASSES.info)} data-testid="modal-info-element">
    <div className={s.listItem}>
      <div className={s.bullet}>1</div>
      <div className={STATIC_CUSTOMISATION_CLASSES.infoMessage}>
        <FormattedMessage
          id="eligibility-modal.bullet-1"
          defaultMessage="Choisissez <strong>Alma</strong> au moment du paiement."
          values={{ strong: (...chunks: string[]) => <strong>{chunks}</strong> }}
        />
      </div>
    </div>
    <div className={s.listItem}>
      <div className={s.bullet}>2</div>
      <div className={STATIC_CUSTOMISATION_CLASSES.infoMessage}>
        <FormattedMessage
          id="eligibility-modal.bullet-2"
          defaultMessage="Renseignez les <strong>informations</strong> demandées."
          values={{ strong: (...chunks: string[]) => <strong>{chunks}</strong> }}
        />
      </div>
    </div>
    <div className={s.listItem}>
      <div className={s.bullet}>3</div>
      <div className={STATIC_CUSTOMISATION_CLASSES.infoMessage}>
        <FormattedMessage
          id="eligibility-modal.bullet-3"
          defaultMessage="La validation de votre paiement <strong>instantanée</strong> !"
          values={{ strong: (...chunks: string[]) => <strong>{chunks}</strong> }}
        />
      </div>
    </div>
  </div>
)

export default Info
