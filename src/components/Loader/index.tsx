import React, { VoidFunctionComponent } from 'react'
import s from './Loader.module.css'
import cx from 'classnames'

const Loader: VoidFunctionComponent<{ className?: string }> = ({ className }) => {
  return (
    <div className={cx(s.loadingIndicator, className)} data-testid="loader">
      <div className={s.line1} />
      <div className={s.line2} />
    </div>
  )
}

export default Loader
