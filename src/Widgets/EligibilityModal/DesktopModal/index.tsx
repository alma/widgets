import { AlmaLogo } from 'assets/almaLogo'
import cx from 'classnames'
import React, { FC } from 'react'
import { Card } from 'types'
import STATIC_CUSTOMISATION_CLASSES from '../classNames.const'
import Cards from '../components/Cards'
import Info from '../components/Info'
import Title from '../components/Title'
import s from './DesktopModal.module.css'

const DesktopModal: FC<{ isSomePlanDeferred: boolean; cards?: Card[] }> = ({
  children,
  isSomePlanDeferred,
  cards,
}) => (
  <div
    className={cx(s.container, STATIC_CUSTOMISATION_CLASSES.desktopModal)}
    data-testid="modal-container"
  >
    <aside className={cx([s.block, s.left, STATIC_CUSTOMISATION_CLASSES.leftSide])}>
      <Title isSomePlanDeferred={isSomePlanDeferred} />
      <Info />
      {cards && <Cards cards={cards} />}
      <AlmaLogo className={s.logo} width="75" />
    </aside>
    <div className={cx(s.block, STATIC_CUSTOMISATION_CLASSES.rightSide)}>{children}</div>
  </div>
)

export default DesktopModal
