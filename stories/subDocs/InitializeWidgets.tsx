import React, { VoidFunctionComponent } from 'react'
export const InitializeWidgets: VoidFunctionComponent = () => (
  <div>
    <h2 id="initialize-widget">Initialize the widget</h2>
    <pre>
      <code>{`initialize(merchantId: string, domain: Alma.ApiMode.TEST | Alma.ApiMode.LIVE)`}</code>
    </pre>
    <h3>Parameters</h3>
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
          <td>merchantId</td>
          <td>string</td>
          <td>true</td>
          <td>Your merchant id as it is found in the dashboard</td>
        </tr>
        <tr>
          <td>domain</td>
          <td>Alma.ApiMode.TEST | Alma.ApiMode.LIVE</td>
          <td>true</td>
          <td>
            <span>Alma.ApiMode.TEST</span>: used to test the widget. Data will match what is
            provided in your sandbox dashboard. <br />
            <span>Alma.ApiMode.LIVE</span>: used in production mode. Data will match what is
            provided in your production dashboard.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)
