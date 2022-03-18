import React, { FC } from 'react'

import LogoIcon from 'assets/Logo'

import s from './Logo.module.css'

const Logo: FC = () => (
  <div className={s.logo}>
    <LogoIcon underlineColor="#FF414D" />
  </div>
)

export default Logo
