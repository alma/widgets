import React, { FC } from 'react'
import { Card } from 'types'
import STATIC_CUSTOMISATION_CLASSES from '../classNames.const'
import Cards from '../components/Cards'
import Info from '../components/Info'
import Logo from '../components/Logo'
import Title from '../components/Title'
import s from './MobileModal.module.css'
import cx from 'classnames'

const MobileModal: FC<{ isSomePlanDeferred: boolean; cards?: Card[] }> = ({
  children,
  isSomePlanDeferred,
  cards,
}) => (
  <div
    className={cx(s.container, STATIC_CUSTOMISATION_CLASSES.mobileModal)}
    data-testid="modal-container"
  >
    <Title isSomePlanDeferred={isSomePlanDeferred} />
    {children}
    <Info />
    {cards && <Cards cards={cards} />}
    <Logo />
  </div>
)

export default MobileModal
