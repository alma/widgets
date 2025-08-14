import React, { FC } from 'react'

import cx from 'classnames'
import { FormattedMessage, useIntl } from 'react-intl'

import s from 'components/SkipLinks/SkipLinks.module.css'

type Props = {
  skipLinks: Array<{
    href: string
    labelId: string
    defaultMessage: string
  }>
  className?: string
}

const SkipLinks: FC<Props> = ({ skipLinks, className }) => {
  const intl = useIntl()

  return (
    <div
      className={cx(s.skipLinks, className)}
      role="navigation"
      aria-label={intl.formatMessage({
        id: 'accessibility.skip-links.navigation.aria-label',
        defaultMessage: 'Navigation rapide',
      })}
    >
      <ul className={s.skipLinksList}>
        {skipLinks.map(({ href, labelId, defaultMessage }) => (
          <li key={href} className={s.skipLinkItem}>
            <a href={href} className={s.skipLink}>
              <FormattedMessage id={labelId} defaultMessage={defaultMessage} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkipLinks
