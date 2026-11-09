import { screen } from '@testing-library/dom'

import { Locale } from '@/shared/i18n/i18n.const'
import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

describe('Change language', () => {
  it(`into ${Locale.en}`, async () => {
    server.use(eligibilityPlans(mockButtonPlans))
    await mountWidget('PaymentPlans', {
      monochrome: false,
      purchaseAmount: 40000,
      locale: Locale.en,
    })
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText(/to pay the/)).toBeInTheDocument()
    expect(screen.getByText(/\(free of charge\)/)).toBeInTheDocument()
  })

  it(`into ${Locale.de}`, async () => {
    server.use(eligibilityPlans(mockButtonPlans))
    await mountWidget('PaymentPlans', {
      monochrome: false,
      purchaseAmount: 40000,
      locale: Locale.de,
    })
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText(/zu zahlen am/)).toBeInTheDocument()
    expect(screen.getByText(/\(0% Finanzierung\)/)).toBeInTheDocument()
  })

  it(`into ${Locale.es}`, async () => {
    server.use(eligibilityPlans(mockButtonPlans))
    await mountWidget('PaymentPlans', {
      monochrome: false,
      purchaseAmount: 40000,
      locale: Locale.es,
    })
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText(/a pagar el/)).toBeInTheDocument()
    expect(screen.getByText(/\(sin intereses\)/)).toBeInTheDocument()
  })

  it(`into ${Locale.it}`, async () => {
    server.use(eligibilityPlans(mockButtonPlans))
    await mountWidget('PaymentPlans', {
      monochrome: false,
      purchaseAmount: 40000,
      locale: Locale.it,
    })
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText(/da pagare il/)).toBeInTheDocument()
    expect(screen.getByText(/\(senza interessi\)/)).toBeInTheDocument()
  })

  it(`into ${Locale['it-IT']}`, async () => {
    server.use(eligibilityPlans(mockButtonPlans))
    await mountWidget('PaymentPlans', {
      monochrome: false,
      purchaseAmount: 40000,
      locale: Locale['it-IT'],
    })
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText(/da pagare il/)).toBeInTheDocument()
    expect(screen.getByText(/\(senza interessi\)/)).toBeInTheDocument()
  })

  it(`into ${Locale.nl}`, async () => {
    server.use(eligibilityPlans(mockButtonPlans))
    await mountWidget('PaymentPlans', {
      monochrome: false,
      purchaseAmount: 40000,
      locale: Locale.nl,
    })
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText(/te betalen op/)).toBeInTheDocument()
    expect(screen.getByText(/\(zonder extra kosten\)/)).toBeInTheDocument()
  })

  it(`into ${Locale.pt}`, async () => {
    server.use(eligibilityPlans(mockButtonPlans))
    await mountWidget('PaymentPlans', {
      monochrome: false,
      purchaseAmount: 40000,
      locale: Locale.pt,
    })
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText(/a pagar em/)).toBeInTheDocument()
    expect(screen.getByText(/\(sem encargos\)/)).toBeInTheDocument()
  })
})
