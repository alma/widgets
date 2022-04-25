import cx from 'classnames'
import React, { FC } from 'react'
import STATIC_CUSTOMISATION_CLASSES from '../classNames.const'
import Info from '../components/Info'
import Logo from '../components/Logo'
import Title from '../components/Title'
import s from './DesktopModal.module.css'

const DesktopModal: FC = ({ children }) => (
  <div className={s.container} data-testid="modal-container">
    <div className={cx([s.block, s.left, STATIC_CUSTOMISATION_CLASSES.leftSide])}>
      <Title />
      <Info />
      <Logo />
    </div>
    <div className={cx(s.block, STATIC_CUSTOMISATION_CLASSES.rightSide)}>{children}</div>
  </div>
)

export default DesktopModal
