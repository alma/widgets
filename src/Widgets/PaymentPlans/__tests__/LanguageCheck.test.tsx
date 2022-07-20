import { screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import render from 'test'
import { Locale } from 'types'
import PaymentPlanWidget from '..'
import { mockButtonPlans } from 'test/fixtures'

jest.mock('utils/fetch', () => {
  return {
    fetchFromApi: async () => mockButtonPlans,
  }
})

describe('Change language', () => {
  it(`into ${Locale.en}`, async () => {
    render(
      <PaymentPlanWidget
        monochrome={false}
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
      {
        locale: Locale.en,
      },
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())

    expect(screen.getByText('T+30')).toBeInTheDocument()
    expect(screen.getByText(/to be paid on/)).toBeInTheDocument()
    expect(screen.getByText(/\(free of charge\)/)).toBeInTheDocument()
  })

  it(`into ${Locale.de}`, async () => {
    render(
      <PaymentPlanWidget
        monochrome={false}
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
      {
        locale: Locale.de,
      },
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())

    expect(screen.getByText('T+30')).toBeInTheDocument()
    expect(screen.getByText(/zu zahlen am/)).toBeInTheDocument()
    expect(screen.getByText(/\(gebührenfrei\)/)).toBeInTheDocument()
  })

  it(`into ${Locale.es}`, async () => {
    render(
      <PaymentPlanWidget
        monochrome={false}
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
      {
        locale: Locale.es,
      },
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())

    expect(screen.getByText('D+30')).toBeInTheDocument()
    expect(screen.getByText(/a pagar el/)).toBeInTheDocument()
    expect(screen.getByText(/\(sin intereses\)/)).toBeInTheDocument()
  })

  it(`into ${Locale.it}`, async () => {
    render(
      <PaymentPlanWidget
        monochrome={false}
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
      {
        locale: Locale.it,
      },
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())

    expect(screen.getByText('G+30')).toBeInTheDocument()
    expect(screen.getByText(/da pagare il/)).toBeInTheDocument()
    expect(screen.getByText(/\(senza interessi\)/)).toBeInTheDocument()
  })

  it(`into ${Locale.nl}`, async () => {
    render(
      <PaymentPlanWidget
        monochrome={false}
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
      {
        locale: Locale.nl,
      },
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())

    expect(screen.getByText('D+30')).toBeInTheDocument()
    expect(screen.getByText(/te betalen op/)).toBeInTheDocument()
    expect(screen.getByText(/\(zonder kosten\)/)).toBeInTheDocument()
  })

  it(`into ${Locale.pt}`, async () => {
    render(
      <PaymentPlanWidget
        monochrome={false}
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
      {
        locale: Locale.pt,
      },
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())

    expect(screen.getByText('D+30')).toBeInTheDocument()
    expect(screen.getByText(/a pagar em/)).toBeInTheDocument()
    expect(screen.getByText(/\(sem encargos\)/)).toBeInTheDocument()
  })
})
