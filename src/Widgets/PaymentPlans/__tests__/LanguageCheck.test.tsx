import React from 'react'

import { screen } from '@testing-library/react'

import { ApiMode } from '@/consts'
import render from '@/test'
import { Locale } from '@/types'
import { mockButtonPlans } from 'test/fixtures'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockButtonPlans,
}))

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
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText(/to pay the/)).toBeInTheDocument()
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
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText(/zu zahlen am/)).toBeInTheDocument()
    expect(screen.getByText(/\(0% Finanzierung\)/)).toBeInTheDocument()
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
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
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
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText(/da pagare il/)).toBeInTheDocument()
    expect(screen.getByText(/\(senza interessi\)/)).toBeInTheDocument()
  })

  it(`into ${Locale['it-IT']}`, async () => {
    render(
      <PaymentPlanWidget
        monochrome={false}
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
      {
        locale: Locale['it-IT'],
      },
    )
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
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
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
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
    await screen.findByTestId('widget-container')

    expect(screen.getByText('M+1')).toBeInTheDocument()
    expect(screen.getByText(/a pagar em/)).toBeInTheDocument()
    expect(screen.getByText(/\(sem encargos\)/)).toBeInTheDocument()
  })
})
