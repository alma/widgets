import cx from 'classnames'
import { IInstallment } from '@alma/client/dist/types/entities/eligibility'
import { Amount } from '@/components/Amount'
import { humanizedDate } from '@/utils'

type InstallmentProps = {
  installment: IInstallment
}

export function Installment({ installment }: InstallmentProps): JSX.Element {
  const fullAmount =
    installment.purchase_amount + installment.customer_fee + installment.customer_interest

  const installmentClasses = cx('atw-flex', 'atw-flex-row', 'atw-justify-between', {
    'atw-pb-4': installment.customer_fee === 0,
  })

  let fees = null
  if (installment.customer_fee > 0) {
    fees = (
      <div className="atw-flex atw-flex-row atw-justify-end atw-pb-4">
        <span className="atw-text-xs">
          Dont frais : <Amount cents={installment.customer_fee} />
        </span>
      </div>
    )
  }

  return (
    <>
      <div className={installmentClasses}>
        <span className="atw-capitalize">
          {humanizedDate(new Date(installment.due_date * 1000), true)}
        </span>
        <Amount className="alma-title-text" cents={fullAmount} />
      </div>
      {fees}
    </>
  )
}
