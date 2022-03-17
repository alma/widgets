import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'

import s from './EligibilityModal.module.css'

const Info: FC = () => (
  <div className={s.list} data-testid="modal-info-element">
    <div className={s.listItem}>
      <div className={s.bullet}>1</div>
      <div>
        <FormattedMessage
          id="eligibility-modal.bullet-1"
          defaultMessage="Choisissez <strong>Alma</strong> au moment du paiement."
          values={{ strong: (...chunks: string[]) => <strong>{chunks}</strong> }}
        />
      </div>
    </div>
    <div className={s.listItem}>
      <div className={s.bullet}>2</div>
      <div>
        <FormattedMessage
          id="eligibility-modal.bullet-2"
          defaultMessage="Renseignez les <strong>informations</strong> demandées."
          values={{ strong: (...chunks: string[]) => <strong>{chunks}</strong> }}
        />
      </div>
    </div>
    <div className={s.listItem}>
      <div className={s.bullet}>3</div>
      <div>
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
