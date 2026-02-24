import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'

const UNIT_PRICE = 450 * 100

declare global {
  interface Window {
    Alma?: any
  }
}

function App() {
  const [quantity, setQuantity] = useState(1)
  const amountCents = quantity * UNIT_PRICE

  useEffect(() => {
    if (!window.Alma || !window.Alma.Widgets) {
      console.error('[React Demo] Alma.Widgets UMD bundle not loaded')
      return
    }

    const widgets = window.Alma.Widgets.initialize(
      'merchant_11gKoO333vEXacMNMUMUSc4c4g68g2Les4',
      window.Alma.ApiMode.TEST,
    )

    widgets.add(window.Alma.Widgets.PaymentPlans, {
      container: '#alma-react-payment-plans',
      purchaseAmount: amountCents,
      locale: 'fr',
    })

    return () => {
      const container = document.getElementById('alma-react-payment-plans')
      if (container) container.innerHTML = ''
    }
  }, [])

  useEffect(() => {
    const el = document.querySelector('#alma-react-payment-plans alma-payment-plans') as any
    if (el) el.purchaseAmount = amountCents
  }, [amountCents])

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>React 19 + Alma Widgets (UMD)</h1>
      <p>React owns the layout, Alma owns the widget via the global UMD bundle.</p>
      <div style={{ marginTop: 24 }}>
        <label>
          Quantity:{' '}
          <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </label>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 12 }}>
        Total: {(amountCents / 100).toFixed(2)} €
      </div>
      <div id="alma-react-payment-plans" style={{ marginTop: 24 }} />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)

