import React, { FunctionComponent } from 'react'

import cx from 'classnames'

import s from 'components/Loader/Loader.module.css'

const Loader: FunctionComponent<{ className?: string }> = ({ className }) => (
  <div className={cx(s.loadingIndicator, className)} data-testid="loader">
    <div className={s.line1} />
    <div className={s.line2} />
  </div>
)

export default Loader
