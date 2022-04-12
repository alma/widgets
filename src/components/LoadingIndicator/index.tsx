import cx from 'classnames'
import React, { VoidFunctionComponent } from 'react'
import s from './LoadingIndicator.module.css'

const LoadingIndicator: VoidFunctionComponent<{ className?: string }> = ({ className }) => {
  return (
    <div className={cx(s.loadingIndicator, className)} data-testid="loader">
      <div className={s.letter}>a</div>
      <div className={s.bar} />
    </div>
  )
}

export default LoadingIndicator
