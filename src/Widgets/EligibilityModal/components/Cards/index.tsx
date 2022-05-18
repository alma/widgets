import React, {FC} from 'react'
import { Card } from 'types'
import AmexCard from 'assets/cards/amex'
import VisaCard from 'assets/cards/visa'
import MasterCard from 'assets/cards/mastercard'
import CbCard from 'assets/cards/cb'
import s from './Cards.module.css'
type Props = {
  cards: Card[]
}

const Cards: FC<Props> = ({ cards }) => {
  return (
    <div className={s.cardContainer}>
      {cards.map((card: Card) => (
        <div key={card} className={s.card}>
          {card === 'cb' && <CbCard />}
          {card === 'amex' && <AmexCard />}
          {card === 'mastercard' && <MasterCard />}
          {card === 'visa' && <VisaCard />}
        </div>
      ))}
    </div>
  )
}

export default Cards
