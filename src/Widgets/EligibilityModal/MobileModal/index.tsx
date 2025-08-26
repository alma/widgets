import React, { FC, PropsWithChildren } from 'react'

import cx from 'classnames'

import { Card } from '@/types'
import { AlmaLogo } from 'assets/almaLogo'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'
import Cards from 'Widgets/EligibilityModal/components/Cards'
import Info from 'Widgets/EligibilityModal/components/Info'
import Title from 'Widgets/EligibilityModal/components/Title'
import s from 'Widgets/EligibilityModal/MobileModal/MobileModal.module.css'

type Props = {
  isCurrentPlanP1X: boolean
  isSomePlanDeferred: boolean
  cards?: Card[]
} & PropsWithChildren
const MobileModal: FC<Props> = ({ children, isSomePlanDeferred, cards, isCurrentPlanP1X }) => (
  <div
    className={cx(s.container, STATIC_CUSTOMISATION_CLASSES.mobileModal)}
    data-testid="modal-container"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <Title isSomePlanDeferred={isSomePlanDeferred} isCurrentPlanP1X={isCurrentPlanP1X} />
    {children}
    <Info id="payment-info" isCurrentPlanP1X={isCurrentPlanP1X} />
    {cards && <Cards cards={cards} />}
    <AlmaLogo className={s.logo} width="75" />
  </div>
)

export default MobileModal
