import React, { useEffect, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Alma from '../../dist/widgets.umd.js'
import { Story } from '@storybook/react'
import '../../dist/widgets.umd.css'
export default {
  title: 'Examples/Locales',
}

export const Locales: Story = (args) => {
  const widgets = Alma.Widgets.initialize('11gKoO333vEXacMNMUMUSc4c4g68g2Les4', Alma.ApiMode.TEST)
  const [locale, setLocale] = useState('en')
  const [copyFeedback, setCopyFeedback] = useState(false)
  useEffect(() => {
    widgets.add(Alma.Widgets.PaymentPlans, {
      container: '#alma-widget',
      purchaseAmount: args.amount,
      locale,
    })
  }, [args, locale])

  const copy = (snippet: string) => {
    if (copyFeedback) return
    void navigator.clipboard
      .write([new ClipboardItem({ 'text/plain': new Blob([snippet], { type: 'text/plain' }) })])
      .then(() => {
        setCopyFeedback(true)
        setTimeout(() => setCopyFeedback(false), 1000)
      })
  }

  const snippet = `widgets.add(Alma.Widgets.PaymentPlans, {
      container: '#alma-widget',
      purchaseAmount: ${args.amount / 100},
      locale: "${locale}",
    })`
  return (
    <div>
      <p>
        {' '}
        This is an example of the widgets in different languages. Only the language of the widget
        will be updated, the language of the descriptions, and the rest of the simulated page will
        stay in english.
      </p>
      <h2>Live example</h2>
      <div> Example for a purchase of {args.amount / 100} € : </div>
      <br />
      <div>
        <label>Chose a locale </label>
        <select id={'select-language'} onChange={(e) => setLocale(e.target.value)}>
          <option value={'en'}>"en"</option>
          <option value={'fr'}>"fr"</option>
          <option value={'fr-FR'}>"fr-FR"</option>
          <option value={'de'}>"de"</option>
          <option value={'de-DE'}>"de-DE"</option>
          <option value={'it'}>"it"</option>
          <option value={'it-IT'}>"it-IT"</option>
          <option value={'es'}>"es"</option>
          <option value={'es-ES'}>"es-ES"</option>
          <option value={'pt'}>"pt"</option>
          <option value={'pt-PT'}>"pt-PT"</option>
          <option value={'nl'}>"nl"</option>
          <option value={'nl-NL'}>"nl-NL"</option>
          <option value={'nl-BE'}>"nl-BE"</option>
        </select>
      </div>
      <br />
      <div id="alma-widget"></div>
      <h2>Snippet of configuration</h2>
      <div>
        <pre>
          <code>{snippet}</code>
        </pre>
        <button className="copyButton" onClick={() => copy(snippet)}>
          Copy Snippet
        </button>
      </div>
    </div>
  )
}

Locales.args = {
  amount: 500_00,
}
