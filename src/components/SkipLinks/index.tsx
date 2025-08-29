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

  const handleSkipLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute('href')
    if (href && href.startsWith('#')) {
      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        // Small delay to allow browser to scroll first
        setTimeout(() => {
          targetElement.focus()
        }, 0)
      }
    }
  }

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
            <a href={href} className={s.skipLink} onClick={handleSkipLinkClick}>
              <FormattedMessage id={labelId} defaultMessage={defaultMessage} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkipLinks
