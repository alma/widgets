import React, { FC } from 'react'
import Info from '../components/Info'
import Logo from '../components/Logo'
import Title from '../components/Title'
import s from './MobileModal.module.css'

const MobileModal: FC<{ isSomePlanDeferred: boolean }> = ({ children, isSomePlanDeferred }) => (
  <div className={s.container} data-testid="modal-container">
    <Title isSomePlanDeferred={isSomePlanDeferred} />
    {children}
    <Info />
    <Logo />
  </div>
)

export default MobileModal
