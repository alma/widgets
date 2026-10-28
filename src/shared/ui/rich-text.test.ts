import { html, render } from 'lit'

import { createIntl } from '@/shared/i18n/create-intl'
import { formatRichText, type RichText } from '@/shared/ui/rich-text'
import {
  legalMentionsMessages,
  infoMessages,
} from '@/widgets/eligibility-modal/eligibility-modal.messages'

// Master's markup.
const strong = (chunks: RichText) => html`<strong>${chunks}</strong>`
const link = (chunks: RichText) =>
  html`<a href="https://almapay.com" target="_blank" rel="noopener noreferrer">${chunks}</a>`
const mail = (chunks: RichText) => html`<a href="mailto:support@almapay.com">${chunks}</a>`

const renderToDiv = (content: RichText) => {
  const container = document.createElement('div')
  render(html`${content}`, container)
  return container
}

describe('formatRichText', () => {
  it('renders a <strong> tag as a <strong> element', () => {
    const container = renderToDiv(
      formatRichText(createIntl('fr'), infoMessages.bullet1, { strong }),
    )

    expect(container.textContent).toBe('Choisissez Alma au moment du paiement.')
    expect(container.querySelector('strong')?.textContent).toBe('Alma')
  })

  it("renders the disclaimer's links with master's attributes", () => {
    const container = renderToDiv(
      formatRichText(createIntl('en'), legalMentionsMessages.disclaimer, { link, mail }),
    )
    const [almapay, support] = container.querySelectorAll('a')

    expect(almapay.textContent).toBe('almapay.com')
    expect(almapay.getAttribute('href')).toBe('https://almapay.com')
    expect(almapay.getAttribute('target')).toBe('_blank')
    expect(almapay.getAttribute('rel')).toBe('noopener noreferrer')
    expect(support.textContent).toBe('support@almapay.com')
    expect(support.getAttribute('href')).toBe('mailto:support@almapay.com')
  })

  it('renders a formatted message as the value of another', () => {
    const intl = createIntl('en')
    const disclaimer = formatRichText(intl, legalMentionsMessages.disclaimer, { link, mail })

    const container = renderToDiv(
      formatRichText(intl, legalMentionsMessages.creditOrPnxWithoutFees, {
        financedAmount: '€100.00',
        customerLendingRate: '5%',
        creditDurationInMonths: 10,
        initialDeposit: '€10.00',
        purchaseAmount: '€110.00',
        disclaimer,
      }),
    )

    expect(container.textContent).toMatch(/of €110\.00\. Subject to approval by Alma SAS/)
    expect(container.querySelectorAll('a')).toHaveLength(2)
  })

  it('escapes the text of a value instead of parsing it as HTML', () => {
    const container = renderToDiv(
      formatRichText(createIntl('en'), legalMentionsMessages.creditOrPnxWithoutFees, {
        financedAmount: '<img src=x>',
        customerLendingRate: '5%',
        creditDurationInMonths: 10,
        initialDeposit: '€10.00',
        purchaseAmount: '€110.00',
        disclaimer: '',
      }),
    )

    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('<img src=x>')
  })

  it('returns a message without tags as one string', () => {
    expect(formatRichText(createIntl('fr'), infoMessages.infoTitle, {})).toEqual([
      'Comment procéder au paiement',
    ])
  })
})
