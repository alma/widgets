import { render } from '@testing-library/react'
import IntlProvider from 'intl/IntlProvider'
import React from 'react'
import { Locale } from 'types'
import ReactQueryProvider from '../providers/ReactQuery'

type Props = { locale: Locale }

const renderWithProviders = (
  ui: React.ReactNode,
  { locale }: Props = { locale: Locale.fr },
): React.ReactNode =>
  render(
    <IntlProvider locale={locale}>
      <ReactQueryProvider>{ui}</ReactQueryProvider>,
    </IntlProvider>,
  )

export default renderWithProviders
