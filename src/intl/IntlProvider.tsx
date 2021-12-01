import React, { FC, ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { Locale } from 'types'
import { getTranslationsByLocale } from './utils'

type Props = { children: ReactNode; locale: Locale }

const Provider: FC<Props> = ({ children, locale }) => (
  <IntlProvider messages={getTranslationsByLocale(locale)} locale={locale} defaultLocale="en">
    {children}
  </IntlProvider>
)

export default Provider
