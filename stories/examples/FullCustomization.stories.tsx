import React, { useEffect, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Alma from '../../dist/widgets.umd.js'
import { Story } from '@storybook/react'
import '../../dist/widgets.umd.css'
import { ConfigPlan, EligibilityPlan } from '../../src/types'
import dedent from 'ts-dedent'
export default {
  title: 'Examples/FullCustomization',
}

export const FullCustomization: Story = (args) => {
  const [plans, setPlans] = useState<ConfigPlan[]>([])
  const [selectedPLans, setSelectedPlans] = useState<ConfigPlan[]>([])
  const [merchantId, setMerchantId] = useState('11gKoO333vEXacMNMUMUSc4c4g68g2Les4')
  const [purchaseAmount, setPurchaseAmount] = useState(500_00)
  const [isMonochrome, setIsMonochrome] = useState(true)
  const [copyFeedback, setCopyFeedback] = useState(false)

  const addOrRemovePlan = (checked: boolean, plan: ConfigPlan) => {
    if (checked) {
      if (!selectedPLans.includes(plan)) {
        setSelectedPlans([...selectedPLans, plan])
      }
    } else {
      setSelectedPlans([...selectedPLans.filter((selectedPlan) => selectedPlan !== plan)])
    }
  }

  // Get plans to create check boxes
  useEffect(() => {
    let isSubscribed = true
    if (isSubscribed) {
      // TODO : FIX - Keep that for POC
      // Can't perform a React state update on an unmounted component.
      // This is a no-op, but it indicates a memory leak in your application.
      // To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
      void fetch('https://api.sandbox.getalma.eu/v2/payments/eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Alma-Merchant-Auth ${merchantId}`,
        },
        body: JSON.stringify({ purchase_amount: purchaseAmount }),
      })
        .then((res) => res.json())
        .then((data) => {
          setPlans(
            data.map((eligiblePlan: EligibilityPlan) => ({
              installmentsCount: eligiblePlan.installments_count,
              deferredDays: eligiblePlan.deferred_days,
              deferredMonths: eligiblePlan.deferred_months,
              minAmount: 10_00,
              maxAmount: 3000_00,
            })),
          )
        })
    }

    return () => {
      isSubscribed = false
    }
  }, [merchantId])

  useEffect(() => {
    const widgets = Alma.Widgets.initialize(merchantId, Alma.ApiMode.TEST)
    widgets.add(Alma.Widgets.PaymentPlans, {
      container: '#alma-widget',
      purchaseAmount: purchaseAmount,
      monochrome: isMonochrome,
      plans: selectedPLans.length ? selectedPLans : undefined,
    })
  }, [args, isMonochrome, merchantId, purchaseAmount])

  const copy = (snippet: string) => {
    if (copyFeedback) return
    void navigator.clipboard
      .write([new ClipboardItem({ 'text/plain': new Blob([snippet], { type: 'text/plain' }) })])
      .then(() => {
        setCopyFeedback(true)
        setTimeout(() => setCopyFeedback(false), 1000)
      })
  }

  const snippet = dedent`widgets.add(Alma.Widgets.PaymentPlans, {
      container: '#alma-widget',
      purchaseAmount: ${purchaseAmount},
      monochrome: ${isMonochrome},
      ${selectedPLans.length ? `plans: ${JSON.stringify(selectedPLans, null, 2)}` : ''}
    })`.replace(/(^[ \t]*\n)/gm, '')

  return (
    <div className="split-screen">
      <div className="unfixed">
        <p>
          This example lets you fully customize the widgets and provides a snippet that can help you
          for your configuration. Please use this on a desktop for a better experience.
        </p>
        <h2>Customize</h2>
        <div className="flex-column container-column">
          <div className="flex-column">
            <label htmlFor="merchant_id">(Optional) Try with your sandbox merchant id :</label>
            <input
              id="merchant_id"
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="ex: merchant_11vnnlH3jlLPIHUQ8NJiY9bZUgrG5ApG2h"
            />
          </div>
          <hr className="split-row" />
          <div className="flex-column">
            <h3>Purchase amount</h3>
            <div className="explanation">
              <p>Purchase amount is required for the widgets to work correctly. </p>{' '}
              <p>
                In this example we pre-set the purchase amount to "50000", which is 500€ (in cents).
              </p>
              <p>
                You can try different purchase amount here. To be easier, the field accepts directly
                euros and not cents. To try 1000€, just fill "1000".
              </p>
            </div>
            <label htmlFor="purchase_amount">Chose a purchase amount (in €) :</label>
            <input
              id="purchase_amount"
              onChange={(e) => setPurchaseAmount(Number(e.target.value) * 100)}
              placeholder="ex: 999.99"
            />
          </div>
          <div className="flex-column">
            <h3>Plans</h3>
            <div className="explanation">
              <p>
                Plans is optional, if you chose to fill this property, the Widgets will only show
                the desired plans.
              </p>
              <p>
                In this example no plans were set so the Widgets display all the eligible plans for
                the configured merchant id.
              </p>
              <p>
                You can try to select plans to display in this list, and pay attention to the
                snippet to know how to configure the plans in real-life.
              </p>
            </div>
            <label htmlFor="plans">Chose a plan to display :</label>
            {plans.map((plan, i) => {
              const id = `${plan.installmentsCount}x_days+${plan.deferredDays}_months+${plan.deferredMonths}`
              return (
                <div key={`${id}-${i}`} className="flex-row container-column">
                  <label htmlFor={id}>{id.replace(/_/g, ' ')}</label>
                  <input
                    type="checkbox"
                    id={id}
                    onChange={(e) => addOrRemovePlan(e.target.checked, plan)}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex-column">
            <label>Chose boolean for parameter monochrome </label>
            <select id={'monochrome'} onChange={(e) => setIsMonochrome(e.target.value === 'true')}>
              <option value={'true'}>true</option>
              <option value={'false'}>false</option>
            </select>
          </div>
        </div>
        <br />
      </div>
      <hr className="split-column" />
      <div className="fixed">
        <h2>Result</h2>
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
    </div>
  )
}
FullCustomization.argTypes = {
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
