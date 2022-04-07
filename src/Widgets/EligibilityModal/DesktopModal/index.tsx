import cx from 'classnames'
import React, { FC } from 'react'
import Info from '../components/Info'
import Logo from '../components/Logo'
import Title from '../components/Title'
import s from './DesktopModal.module.css'

const DesktopModal: FC = ({ children }) => (
  <div className={s.container} data-testid="modal-container">
    <div className={cx([s.block, s.left])}>
      <Title />
      <Info />
      <Logo />
    </div>
    <div className={s.block}>{children}</div>
  </div>
)

export default DesktopModal
