import React, { VoidFunctionComponent } from 'react'

export const ModalDoc: VoidFunctionComponent = () => (
  <div>
    <h2 id="add-modal">Add Modal</h2>
    <pre>
      <code>{`add(widget: Alma.Widgets.Modal, options: ModalOptions)`}</code>
    </pre>
    Display a modal with the eligible payment plans for the given purchase amount. Can be open with
    the <span className="code-string">clickableSelector</span> option or by calling the{' '}
    <span className="code-string">open</span> methods.
    <h3>ModalOptions</h3>
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
          <td>clickableSelector</td>
          <td>string</td>
          <td>
            false (default is <span>null</span>)
          </td>
          <td>
            If provided, the modal will open when the element matching this query selector is
            clicked.
          </td>
        </tr>
        <tr>
          <td>cards</td>
          <td>cb|visa|amex|mastercard as array</td>
          <td>false</td>
          <td>Display card logos in the modal</td>
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
      </tbody>
    </table>
    <h3>Example</h3>
    <pre>
      <code>
        {`
  const {open, close} = widgets.add(Alma.Widgets.Modal, {
    container: '#alma-widget-modal',
    purchaseAmount: 20000
  })
        `}
      </code>
    </pre>
  </div>
)
