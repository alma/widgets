import React, { FC } from 'react'
import Info from '../components/Info'
import Logo from '../components/Logo'
import Title from '../components/Title'
import s from './MobileModal.module.css'

const MobileModal: FC = ({ children }) => (
  <div className={s.container} data-testid="modal-container">
    <Title />
    {children}
    <Info />
    <Logo />
  </div>
)

export default MobileModal
