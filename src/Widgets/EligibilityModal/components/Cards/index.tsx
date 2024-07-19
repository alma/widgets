import React, { FC } from 'react'
import { Card } from 'types'
import AmexCard from 'assets/cards/amex'
import VisaCard from 'assets/cards/visa'
import MasterCard from 'assets/cards/mastercard'
import CbCard from 'assets/cards/cb'
import s from './Cards.module.css'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import cx from 'classnames'

type Props = {
  cards: Card[]
}

export const Cards: FC<Props> = ({ cards }) => {
  // We transform to a Set and back to avoid duplicate values (ex : amex, amex)
  const uniqueCards = Array.from(new Set(cards))

  return (
    <div
      data-testid="card-logos"
      className={cx(s.cardContainer, STATIC_CUSTOMISATION_CLASSES.cardContainer)}
    >
      {uniqueCards.map((card: Card) => (
        <div key={card} className={s.card} data-testid={`card-logo-${card}`}>
          {card === 'cb' && <CbCard />}
          {card === 'amex' && <AmexCard />}
          {card === 'mastercard' && <MasterCard />}
          {card === 'visa' && <VisaCard />}
        </div>
      ))}
    </div>
  )
}
