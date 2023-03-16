import React, { VoidFunctionComponent } from 'react'

export const PlansDoc: VoidFunctionComponent = () => (
  <div id="plans-options">
    <h2>Plans options</h2>
    <div>
      <p>By default, the widget will display all your available payment plans. </p>
      <p>
        But, if you want to only display some of the plans, you can customize the displayed plans
        with this parameter. You can hide a plan that would be displayed otherwise by adding the
        other plans with this information:
      </p>
    </div>
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
          <td>installmentsCount</td>
          <td>number</td>
          <td>true</td>
          <td>The number of installment in the plan</td>
        </tr>
        <tr>
          <td>minAmount</td>
          <td>number</td>
          <td>true</td>
          <td>The minimum purchase amount allowed to activate the plan (in euro cents)</td>
        </tr>
        <tr>
          <td>maxAmount</td>
          <td>number</td>
          <td>true</td>
          <td>The maximum purchase amount allowed to activate the plan (in euro cents)</td>
        </tr>
        <tr>
          <td>deferredDays</td>
          <td>number</td>
          <td>false</td>
          <td>The number of days by which the first payment will be deferred</td>
        </tr>
        <tr>
          <td>deferredMonths</td>
          <td>number</td>
          <td>false</td>
          <td>The number of months by which the first payment will be deferred</td>
        </tr>
      </tbody>
    </table>
    <h3>Example</h3>
    <pre>
      <code>
        {`widgets.add(Alma.Widgets.PaymentPlans, {
          container: '#alma-widget-payment-plans',
          purchaseAmount: 20000,
          plans: [
            {
              installmentsCount: 4,
              minAmount: 5000,
              maxAmount: 90000,
            },
            {
              installmentsCount: 10,
              minAmount: 5000,
              maxAmount: 90000,
            },
          ],
        })
      }`}
      </code>
    </pre>
  </div>
)
