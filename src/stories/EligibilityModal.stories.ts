import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { waitFor } from 'storybook/test'

import { ApiMode, Widgets } from '@/index'
import {
  mockDeferredMultiInstallmentPlanWithFees,
  mockDeferredMultiInstallmentPlanWithoutFees,
} from '@/test/fixtures'
import { Locale, ModalOptions } from '@/types'

/**
 * Like the PaymentPlans stories, these mount the modal through the public API, as a merchant page
 * does, and import nothing from the widget internals.
 */

type Args = Omit<ModalOptions, 'container' | 'clickableSelector'> & {
  transactionCountry: string
  customerFees: boolean
}

const CONTAINER_ID = 'alma-modal'
const OPEN_BUTTON_ID = 'alma-modal-open'

// A single container for every render: add() unmounts the modal already mounted in it, so changing
// a control replaces the modal instead of stacking a second one on top.
const container = document.createElement('div')
container.id = CONTAINER_ID

/** Waits until the eligibility request has settled and the modal shows its final state. */
const waitForModal = () =>
  waitFor(() => {
    // The modal renders in a portal at the end of the body, outside the story canvas
    const modalIsOpen = document.querySelector('[data-testid="modal-close-button"]')
    if (!modalIsOpen || document.querySelector('[data-testid="loader"]')) {
      throw new Error('Still loading')
    }
  })

const meta = {
  title: 'Widgets/EligibilityModal',
  args: {
    purchaseAmount: 45000,
    locale: Locale.fr,
  },
  render: ({ transactionCountry, customerFees, ...options }) => {
    const openButton = document.createElement('button')
    openButton.id = OPEN_BUTTON_ID
    openButton.textContent = 'Open the modal'

    const page = document.createElement('div')
    page.append(openButton, container)

    // add() looks the container and the button up in the page, and Storybook inserts the page right
    // after render returns
    queueMicrotask(() =>
      Widgets.initialize('merchant_storybook', ApiMode.TEST)
        .add(Widgets.Modal, {
          ...options,
          container: `#${CONTAINER_ID}`,
          clickableSelector: `#${OPEN_BUTTON_ID}`,
        })
        ?.open(),
    )
    return page
  },
} satisfies Meta<Args>

export default meta

type Story = StoryObj<Args>

/**
 * The legal warning sentence under the payment schedule. It depends on the country the transaction
 * is booked in, never on the fees, and is translated into the visitor's language.
 */
export const WarningSentence: Story = {
  args: {
    transactionCountry: 'FR',
    customerFees: false,
  },
  argTypes: {
    transactionCountry: {
      description: 'Country the transaction is booked in (`transaction_country`)',
      control: 'select',
      options: ['FR', 'BE', 'LU', 'NL', 'IT', 'DE', 'PT', 'ES', 'GB'],
    },
    locale: {
      description: "Visitor's language",
      control: 'select',
      options: [Locale.fr, Locale.en, Locale.de, Locale.it, Locale.es, Locale.pt, Locale.nl],
    },
    customerFees: {
      description: 'Whether the customer pays fees on the plan',
      control: 'boolean',
    },
  },
  parameters: {
    controls: { include: ['transactionCountry', 'locale', 'customerFees'] },
    eligibility: ({ transactionCountry, customerFees }: Args) => [
      (customerFees
        ? mockDeferredMultiInstallmentPlanWithFees
        : mockDeferredMultiInstallmentPlanWithoutFees
      ).withCountry(transactionCountry),
    ],
  },
  play: waitForModal,
}
