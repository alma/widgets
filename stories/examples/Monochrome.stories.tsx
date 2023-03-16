import React, { useEffect, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Alma from '../../dist/widgets.umd.js'
import { Story } from '@storybook/react'
import '../../dist/widgets.umd.css'
export default {
  title: 'Examples/Monochrome',
}

export const Monochrome: Story = (args) => {
  const widgets = Alma.Widgets.initialize('11gKoO333vEXacMNMUMUSc4c4g68g2Les4', Alma.ApiMode.TEST)

  const [isMonochrome, setIsMonochrome] = useState(true)
  const [copyFeedback, setCopyFeedback] = useState(false)

  useEffect(() => {
    widgets.add(Alma.Widgets.PaymentPlans, {
      container: '#alma-widget',
      purchaseAmount: args.amount,
      locale: args.locale,
      monochrome: isMonochrome,
    })
  }, [args, isMonochrome])

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
      locale: "${args.locale}",
      monochrome: ${isMonochrome},
    })`
  return (
    <div>
      <p> This is an example of the widgets when set in Monochrome or not.</p>
      <h2>Live example</h2>
      <div> Example for a purchase of {args.amount / 100} € : </div>
      <br />
      <div>
        <label>Chose boolean for parameter monochrome </label>
        <select id={'monochrome'} onChange={(e) => setIsMonochrome(e.target.value === 'true')}>
          <option value={'true'}>true</option>
          <option value={'false'}>false</option>
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
Monochrome.argTypes = {
  locale: {
    control: 'select',
    options: [
      'en',
      'fr',
      'fr-FR',
      'de',
      'de-DE',
      'it',
      'it-IT',
      'es',
      'es-ES',
      'pt',
      'pt-PT',
      'nl',
      'nl-NL',
      'nl-BE',
    ],
  },
}
Monochrome.args = {
  amount: 500_00,
  locale: 'en',
}
