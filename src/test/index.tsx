import React from 'react'

import { render, RenderResult } from '@testing-library/react'

import { Locale } from '@/types'
import IntlProvider from 'intl/IntlProvider'

type Props = { locale: Locale }

const renderWithProviders = (
  ui: React.ReactNode,
  { locale }: Props = { locale: Locale.fr },
): RenderResult => render(<IntlProvider locale={locale}>{ui}</IntlProvider>)

export default renderWithProviders
