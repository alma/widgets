import React, { FC } from 'react'
import { Card } from 'types'
import Cards from '../components/Cards'
import Info from '../components/Info'
import Logo from '../components/Logo'
import Title from '../components/Title'
import s from './MobileModal.module.css'

const MobileModal: FC<{ isSomePlanDeferred: boolean, cards?: Card[] }> = ({ children, isSomePlanDeferred, cards }) => (
  <div className={s.container} data-testid="modal-container">
    <Title isSomePlanDeferred={isSomePlanDeferred} />
    {children}
    <Info />
    {cards && <Cards cards={cards}/>}      
    <Logo />
  </div>
)

export default MobileModal
