import React, { VoidFunctionComponent } from 'react'

export const PaymentPlansDoc: VoidFunctionComponent = () => (
  <div>
    <h2 id="add-payment-plans">Add PaymentPlans</h2>
    <pre>
      <code>{`add(widget: Alma.Widgets.PaymentPlans, options: PaymentPlansOptions)`}</code>
    </pre>
    Add a button with the eligibles payment plans for the given purchase amount
    <h3>PaymentPlansOptions</h3>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Required</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>container</td>
          <td>string</td>
          <td>true</td>
          <td>Your container's selector</td>
        </tr>
        <tr>
          <td>purchaseAmount</td>
          <td>number</td>
          <td>true</td>
          <td>The purchase amount (in euro cents)</td>
        </tr>
        <tr>
          <td>plans</td>
          <td>
            Plan[] -{' '}
            <a href="stories/subDocs#plans-options" target="_self">
              Learn more about Plans
            </a>
          </td>
          <td>false</td>
          <td>
            An array of the plans you want to display. If not provided, the widget returns all your
            available payment plans.
          </td>
        </tr>
        <tr>
          <td>transitionDelay</td>
          <td>number</td>
          <td>
            false (default is <span>5500</span>)
          </td>
          <td>The amount of time in between button animations in ms.</td>
        </tr>
        <tr>
          <td>
            locale -{' '}
            <a href="stories/subDocs#locale-options" target="_self">
              Learn more about locale
            </a>
          </td>
          <td>local-country format</td>
          <td>
            false (default is <span>en</span>)
          </td>
          <td>Defines the language displayed on the widgets.</td>
        </tr>
        <tr>
          <td>hideIfNotEligible</td>
          <td>boolean</td>
          <td>
            false (default is <span>false</span>)
          </td>
          <td>Totally hides the widget if set to true and no plan matches the purchase amount.</td>
        </tr>
        <tr>
          <td>monochrome</td>
          <td>boolean</td>
          <td>
            false (default is <span>true</span>)
          </td>
          <td>
            If set to <span>false</span>, Alma's logo and the active payments plan will be in orange
            :
            <div className="flex-row">
              <div className={'colorShow'} /> #FA5022.
            </div>
          </td>
        </tr>
        <tr>
          <td>suggestedPaymentPlan</td>
          <td>number | number[]</td>
          <td>false</td>
          <td>
            Allow to choose which payment plan's tab will be displayed by default. It will have
            effect only if the selected plan is eligible. If an array is provided, it will select
            the first eligible plan from this array.
          </td>
        </tr>
        <tr>
          <td>customerBillingCountry</td>
          <td>
            string (e.g <span>fr|es|it|de|nl|pt|en</span>)
          </td>
          <td>false</td>
          <td>Customer's billing country</td>
        </tr>
        <tr>
          <td>customerShippingCountry</td>
          <td>
            string (e.g <span>fr|es|it|de|nl|pt|en</span>)
          </td>
          <td>false</td>
          <td>
            <div>Customer's shipping country.</div>
            <br />
            <div>Allow to display fee plans specific for a country.</div>
            <div>
              Example: you're selling in France and Germany, the credit options are only available
              in France, so you can specify this option to <span>fr</span> to show credits on the
              widget for french customers.
            </div>
            <br />
            <div>
              Both <span>customerBillingCountry</span> and <span>customerShippingCountry</span>{' '}
              options offer the same result, they allow to simplify the integration if there is no
              information about customer's shipping address.
            </div>
          </td>
        </tr>
        <tr>
          <td>hideBorder</td>
          <td>boolean</td>
          <td>
            false (default is <span>false</span>)
          </td>
          <td>Hide the border if set to true, set to false as default</td>
        </tr>
        <tr>
          <td>cards</td>
          <td>cb|visa|amex|mastercard as array</td>
          <td>false</td>
          <td>Display card logos in the modal</td>
        </tr>
      </tbody>
    </table>
    <h3>Example</h3>
    <pre>
      <code>
        {`
widgets.add(Alma.Widgets.PaymentPlans, {
    container: '#alma-widget-payment-plans',
    purchaseAmount: 20000
})
`}
      </code>
    </pre>
  </div>
)
