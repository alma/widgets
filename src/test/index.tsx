import { render } from '@testing-library/react'
import IntlProvider from 'intl/IntlProvider'
import React from 'react'
import { Locale } from 'types'

type Props = { locale: Locale }

const renderWithProviders = (
  ui: React.ReactNode,
  { locale }: Props = { locale: Locale.fr },
): React.ReactNode => {
  return render(<IntlProvider locale={locale}>{ui}</IntlProvider>)
}

export default renderWithProviders
