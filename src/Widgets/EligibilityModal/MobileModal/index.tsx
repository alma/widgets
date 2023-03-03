import React, { FC } from 'react'
import { Card } from 'types'
import STATIC_CUSTOMISATION_CLASSES from '../classNames.const'
import Cards from '../components/Cards'
import Info from '../components/Info'
import Title from '../components/Title'
import s from './MobileModal.module.css'
import cx from 'classnames'
import { AlmaLogo } from 'assets/almaLogo'

type Props = {
  isCurrentPlanP1X: boolean
  isSomePlanDeferred: boolean
  cards?: Card[]
}
const MobileModal: FC<Props> = ({ children, isSomePlanDeferred, cards, isCurrentPlanP1X }) => (
  <div
    className={cx(s.container, STATIC_CUSTOMISATION_CLASSES.mobileModal)}
    data-testid="modal-container"
  >
    <Title isSomePlanDeferred={isSomePlanDeferred} />
    {children}
    <Info isCurrentPlanP1X={isCurrentPlanP1X} />
    {cards && <Cards cards={cards} />}
    <AlmaLogo className={s.logo} width="75" />
  </div>
)

export default MobileModal
