import React, { FC } from 'react'

import cx from 'classnames'
import { isToday } from 'date-fns'
import { FormattedDate, FormattedMessage, FormattedNumber } from 'react-intl'

import { PaymentPlan } from '@/types'
import s from 'components/Installments/Installment/Installment.module.css'

type Props = {
  installment: PaymentPlan
  index: number
}

const Installment: FC<Props> = ({ installment, index }) => (
  <div className={s.installment} data-testid={`installment-${index}`}>
    <div className={s.date}>
      <div className={cx(s.dot, { [s.isCurrent]: index === 0 })} />
      {isToday(installment.due_date * 1000) ? (
        <FormattedMessage id="installments.today" defaultMessage="Aujourd'hui" tagName="strong" />
      ) : (
        <FormattedDate
          value={installment.due_date * 1000}
          day="numeric"
          month="long"
          year="numeric"
        />
      )}
    </div>
    <div className={cx({ [s.bold]: index === 0 })}>
      <FormattedNumber value={installment.total_amount / 100} style="currency" currency="EUR" />
    </div>
  </div>
)

export default Installment
