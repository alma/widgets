import React from 'react'
import { Story } from '@storybook/react'
import { InitializeWidgets } from './subDocs/InitializeWidgets'
import { LocaleDoc } from './subDocs/LocaleDoc'
import { ModalDoc } from './subDocs/ModalDoc'
import { PaymentPlansDoc } from './subDocs/PaymentPlansDoc'
import { PlansDoc } from './subDocs/PlansDoc'
export default {
  title: 'Documentation/FullDocumentation',
}

export const FullDocumentation: Story = () => (
  <div>
    <h3>Table of content</h3>
    <ul>
      <li>
        <a href="stories#initialize-widget" target="_self">
          Initialize the widget
        </a>
      </li>
      <li>
        <a href="stories#add-payment-plans" target="_self">
          Add PaymentPlans
        </a>
      </li>
      <li>
        <a href="stories#add-modal" target="_self">
          Add Modal
        </a>
      </li>
      <li>
        <a href="stories#plans-options" target="_self">
          Plans options
        </a>
      </li>
      <li>
        <a href="stories#locale-options" target="_self">
          Locale Options
        </a>
      </li>
    </ul>
    <InitializeWidgets />
    <PaymentPlansDoc />
    <ModalDoc />
    <PlansDoc />
    <LocaleDoc />
  </div>
)
