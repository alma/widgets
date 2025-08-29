import React, { FC } from 'react'

import cx from 'classnames'
import { FormattedMessage } from 'react-intl'

import s from 'Widgets//EligibilityModal/components/Info/Info.module.css'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'

const StrongText = (chunks: React.ReactNode) => <strong>{chunks}</strong>

const Info: FC<{ isCurrentPlanP1X: boolean; id?: string }> = ({ isCurrentPlanP1X, id }) => (
  // TODO: refactor this component into subcomponents to factorize code and make it cleaner
  <div
    id={id}
    className={cx(s.list, STATIC_CUSTOMISATION_CLASSES.info)}
    data-testid="modal-info-element"
    role="region"
    aria-labelledby="payment-info-title"
    aria-describedby="payment-info-description"
    tabIndex={-1}
  >
    <h2 id="payment-info-title" className="sr-only">
      <FormattedMessage
        id="eligibility-modal.info-title"
        defaultMessage="Comment procéder au paiement"
      />
    </h2>{' '}
    <ol className={s.listContainer} id="payment-info-description">
      <li className={s.listItem}>
        <div className={cx(s.bullet, STATIC_CUSTOMISATION_CLASSES.bullet)}>1</div>
        <div className={STATIC_CUSTOMISATION_CLASSES.infoMessage}>
          {isCurrentPlanP1X ? (
            <FormattedMessage
              id="eligibility-modal.p1x-bullet-1"
              defaultMessage="Choisissez <strong>Alma - Payer maintenant</strong> au moment du paiement."
              values={{ strong: StrongText }}
            />
          ) : (
            <FormattedMessage
              id="eligibility-modal.bullet-1"
              defaultMessage="Choisissez <strong>Alma</strong> au moment du paiement."
              values={{ strong: StrongText }}
            />
          )}
        </div>
      </li>
      <li className={s.listItem}>
        <div className={cx(s.bullet, STATIC_CUSTOMISATION_CLASSES.bullet)}>2</div>
        <div className={STATIC_CUSTOMISATION_CLASSES.infoMessage}>
          {isCurrentPlanP1X ? (
            <FormattedMessage
              id="eligibility-modal.p1x-bullet-2"
              defaultMessage="Renseignez les informations de votre <strong>carte bancaire.</strong>"
              values={{ strong: StrongText }}
            />
          ) : (
            <FormattedMessage
              id="eligibility-modal.bullet-2"
              defaultMessage="Laissez-vous guider et validez votre paiement en <strong>2 minutes.</strong>"
              values={{ strong: StrongText }}
            />
          )}
        </div>
      </li>
      <li className={s.listItem}>
        <div className={cx(s.bullet, STATIC_CUSTOMISATION_CLASSES.bullet)}>3</div>
        <div className={STATIC_CUSTOMISATION_CLASSES.infoMessage}>
          {isCurrentPlanP1X ? (
            <FormattedMessage
              id="eligibility-modal.p1x-bullet-3"
              defaultMessage="<strong>La validation </strong> de votre paiement est instantanée !"
              values={{ strong: StrongText }}
            />
          ) : (
            <FormattedMessage
              id="eligibility-modal.bullet-3"
              defaultMessage="<strong>Gardez le contrôle</strong> en avançant ou reculant vos échéances à votre rythme."
              values={{ strong: StrongText }}
            />
          )}
        </div>
      </li>
    </ol>
  </div>
)

export default Info
