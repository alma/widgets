import React, { FunctionComponent } from 'react'

import cx from 'classnames'

import s from 'components/LoadingIndicator/LoadingIndicator.module.css'

export const LoadingIndicator: FunctionComponent<{ className?: string }> = ({ className }) => (
  <div className={cx(s.loadingIndicator, className)} data-testid="loader">
    <svg
      width="120"
      height="134"
      viewBox="0 0 120 134"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M83.8164 41.0325C79.1708 22.8241 69.3458 17 59.9939 17C50.642 17 40.8171 22.8241 36.1715 41.0325L16 117H35.8804C39.119 104.311 49.1016 97.2436 59.9939 97.2436C70.8863 97.2436 80.8689 104.324 84.1075 117H104L83.8164 41.0325ZM59.9939 79.5428C53.6623 79.5428 47.925 82.0552 43.6918 86.1283L55.0936 41.9207C56.1853 37.6953 57.7985 36.3503 60.0061 36.3503C62.2136 36.3503 63.8269 37.6953 64.9185 41.9207L76.3082 86.1283C72.075 82.0552 66.3256 79.5428 59.9939 79.5428Z"
        fill="#FA5022"
      />
    </svg>
  </div>
)
