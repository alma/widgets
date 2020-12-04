import cx from 'classnames'
import { IInstallment } from '@alma/client/dist/types/entities/eligibility'
import { Amount } from '@/components/Amount'
import { humanizedDate } from '@/utils'

type InstallmentProps = {
  installment: IInstallment
}

export function Placeholder({ label }: { label: string }): JSX.Element {
  return (
    <div className="atw-flex atw-flex-row atw-justify-between">
      <span className="atw-capitalize">{label}</span>
      <span>
        <span className="atw-inline-block atw-w-8 atw-bg-orange-900 atw-rounded-sm atw-opacity-25">
          &nbsp;
        </span>
        &nbsp;€
      </span>
    </div>
  )
}

export function Installment({ installment }: InstallmentProps): JSX.Element {
  const fullAmount = installment.purchase_amount + installment.customer_fee

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
