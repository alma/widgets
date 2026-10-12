import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeAll, beforeEach, describe, expect } from 'vitest'

import inventory from './inventory.json'
import { mockEligibilityApi } from './support/api-mock'
import type { EligibilityReply } from './support/api-mock'
import { it } from './support/contract-test'
import { containerChildren, outlineToText, widgetOutline } from './support/dom'
import { loadUmd } from './support/load-bundle'
import { addWidget, closeButton, container, planButtons, tick, useFakeClock } from './support/page'
import { DESKTOP_WIDTH, MOBILE_WIDTH, setViewportWidth } from './support/viewport'

const fixture = (name: string) =>
  JSON.parse(readFileSync(resolve(__dirname, `fixtures/eligibility/${name}.json`), 'utf8'))

const goldenPath = (name: string) => resolve(__dirname, `fixtures/golden/dom/${name}.txt`)

const threePlans = fixture('eligible-2x-3x-4x')
const fourPlans = fixture('eligible-4x-2x-10x-credit-3x')
const onePlan = fixture('eligible-3x')
const notEligible = fixture('ineligible-amount-2x-3x-4x')

let Alma: ReturnType<typeof loadUmd>
beforeAll(() => {
  Alma = loadUmd()
})

useFakeClock()

// jsdom doesn't implement window.scroll, which master calls on close through no-scroll.
beforeEach(() => {
  vi.stubGlobal('scroll', () => {})
})

// A modal that a test leaves open stays mounted after setup.ts empties <body>, and would put its
// body trap back in the next test's page.
const closeModal = async () => {
  ;(closeButton() as HTMLElement | null)?.click()
  await tick(1000)
}
afterEach(closeModal)

type Handle = { open: () => void }
type Options = Record<string, unknown>

const WIDTHS = [
  { name: 'desktop', width: DESKTOP_WIDTH },
  { name: 'mobile', width: MOBILE_WIDTH },
] as const

const plan = (installmentsCount: number) => ({
  installmentsCount,
  minAmount: 100,
  maxAmount: 200000,
})

const TOP_LEVEL_CLASS = 'alma-payment-plans-container'

/** Adds a PaymentPlans widget and lets the response, the effects and the first frames run. */
const renderPlans = async (reply: EligibilityReply, options: Options = {}) => {
  const api = mockEligibilityApi(reply)
  addWidget(Alma, Alma.Widgets.PaymentPlans, options)
  await tick(1000)
  return api
}

/** Adds a PaymentPlans widget and clicks the plan at an index to open the modal. */
const renderModalFromWidget = async (index: number, options: Options = {}) => {
  await renderPlans({ json: fourPlans }, options)
  planButtons()[index].click()
  await tick(500)
}

/** Adds a standalone modal and opens it. */
const renderStandaloneModal = async (reply: EligibilityReply, options: Options = {}) => {
  mockEligibilityApi(reply)
  const handle = addWidget(Alma, Alma.Widgets.Modal, options) as Handle
  handle.open()
  await tick(500)
}

const portal = () => document.querySelector('.ReactModalPortal') as HTMLElement
const dialog = () => document.querySelector('#alma-widget-modal-main-container') as HTMLElement

/** Compares the outline of the container and of the portal with a golden file. */
const expectGolden = async (name: string) => {
  await expect(`${outlineToText(widgetOutline(container()))}\n`).toMatchFileSnapshot(
    goldenPath(name),
  )
}

const classes = (element: Element) => Array.from(element.classList)
const labels = () => planButtons().map((button) => button.textContent)
const infoText = () => document.querySelector('#payment-info-text') as HTMLElement

describe('PaymentPlans states', () => {
  describe.each([
    { name: 'loading', options: {} },
    { name: 'loading-hide-border', options: { hideBorder: true } },
  ])('$name', ({ name, options }) => {
    it('matches the golden outline', async () => {
      await renderPlans({ pending: true }, options)
      await expectGolden(`payment-plans-${name}`)
    })

    // The loader has no ID and no alma-* class: a merchant has nothing to select it by.
    it('holds one div with no ID and no alma class around the loader', async () => {
      await renderPlans({ pending: true }, options)
      const [only, ...others] = containerChildren(container())
      expect(others).toEqual([])
      expect(only.localName).toBe('div')
      expect(only.id).toBe('')
      expect(classes(only).filter((token) => token.startsWith('alma-'))).toEqual([])
      expect(only.querySelector(':scope > [data-testid="loader"]')).not.toBeNull()
    })
  })

  it('matches the golden outline for several plans', async () => {
    await renderPlans({ json: fourPlans })
    await expectGolden('payment-plans-several-plans')
  })

  it('matches the golden outline for one plan', async () => {
    await renderPlans({ json: onePlan })
    await expectGolden('payment-plans-one-plan')
  })

  it('matches the golden outline when no plan is eligible', async () => {
    await renderPlans({ json: notEligible })
    await expectGolden('payment-plans-all-not-eligible')
  })

  it('matches the golden outline of a hidden widget', async () => {
    await renderPlans({ json: notEligible }, { hideIfNotEligible: true })
    await expectGolden('payment-plans-hidden')
  })

  it('matches the golden outline when the response has no plan', async () => {
    await renderPlans({ json: fixture('empty') })
    await expectGolden('payment-plans-no-plan')
  })

  it('matches the golden outline when the request fails', async () => {
    await renderPlans({ networkError: true })
    await expectGolden('payment-plans-failed')
  })
})

describe.each(WIDTHS)('modal states at $name width', ({ name, width }) => {
  beforeEach(() => {
    setViewportWidth(width)
  })

  it('matches the golden outline when opened from the widget', async () => {
    await renderModalFromWidget(1)
    await expectGolden(`payment-plans-modal-open-${name}`)
  })

  describe.each([
    { state: 'pending', reply: { pending: true } as EligibilityReply },
    { state: 'success', reply: { json: fourPlans } as EligibilityReply },
    { state: 'no-eligibility', reply: { json: notEligible } as EligibilityReply },
    { state: 'failed', reply: { networkError: true } as EligibilityReply },
  ])('standalone modal, $state', ({ state, reply }) => {
    it('matches the golden outline', async () => {
      await renderStandaloneModal(reply)
      await expectGolden(`modal-${state}-${name}`)
    })
  })
})

describe('PaymentPlans markup', () => {
  it('holds the root and the announcement div, and nothing else', async () => {
    await renderPlans({ json: threePlans })
    const [root, announcement, ...others] = containerChildren(container())

    expect(others).toEqual([])
    expect(root.localName).toBe('div')
    expect(root.id).toBe('alma-widget-payment-plans-main-container')
    expect(classes(root)).toContain(TOP_LEVEL_CLASS)
    expect(root.getAttribute('data-testid')).toBe('widget-container')
    expect(announcement.matches('div[role="alert"][aria-live="assertive"]')).toBe(true)
  })

  it('lists the plans by installment count, whatever the order of the response', async () => {
    await renderPlans({ json: fourPlans })
    expect(labels()).toEqual(['2x', '3x', '4x', '10x'])
  })

  it('marks the first plan as active', async () => {
    await renderPlans({ json: threePlans })
    const [first, ...others] = planButtons()

    expect(classes(first)).toContain('alma-payment-plans-active-option')
    expect(first.getAttribute('aria-selected')).toBe('true')
    others.forEach((button) => {
      expect(classes(button)).not.toContain('alma-payment-plans-active-option')
      expect(button.getAttribute('aria-selected')).toBe('false')
    })
  })

  it('shows one active plan when only one plan comes back', async () => {
    await renderPlans({ json: onePlan })
    expect(planButtons()).toHaveLength(1)
    expect(planButtons()[0].getAttribute('aria-selected')).toBe('true')
  })

  it('marks every plan as not eligible and keeps the first one active', async () => {
    await renderPlans({ json: notEligible })
    expect(planButtons()).toHaveLength(3)
    planButtons().forEach((button) => {
      expect(classes(button)).toContain('alma-payment-plans-not-eligible-option')
      expect(button.getAttribute('aria-disabled')).toBe('true')
      expect(button.getAttribute('tabindex')).toBe('-1')
    })
    expect(planButtons()[0].getAttribute('aria-selected')).toBe('true')
    expect(classes(planButtons()[0])).toContain('alma-payment-plans-active-option')
  })

  it('marks an eligible plan as enabled and focusable', async () => {
    await renderPlans({ json: threePlans })
    planButtons().forEach((button) => {
      expect(classes(button)).not.toContain('alma-payment-plans-not-eligible-option')
      expect(button.getAttribute('aria-disabled')).toBe('false')
      expect(button.getAttribute('tabindex')).toBe('0')
    })
  })

  describe('#payment-info-text', () => {
    const isButton = () =>
      infoText().getAttribute('role') === 'button' &&
      infoText().getAttribute('tabindex') === '0' &&
      infoText().getAttribute('aria-haspopup') === 'dialog'
    const hasNoButtonAttribute = () =>
      !infoText().hasAttribute('role') &&
      !infoText().hasAttribute('tabindex') &&
      !infoText().hasAttribute('aria-haspopup')

    it('is a button when the active plan needs the legal disclosure', async () => {
      await renderPlans({ json: fourPlans })
      expect(isButton()).toBe(true)
    })

    it('is a plain div when the active plan is pay now', async () => {
      await renderPlans({ json: fixture('all-eligible') }, { plans: [plan(1)] })
      expect(labels()).toHaveLength(1)
      expect(hasNoButtonAttribute()).toBe(true)
    })

    it('is a plain div when the active plan is not eligible', async () => {
      await renderPlans({ json: notEligible })
      expect(hasNoButtonAttribute()).toBe(true)
      expect(classes(infoText())).toContain('alma-payment-plans-not-eligible-option')
    })
  })
})

describe.each([
  {
    state: 'hidden',
    reply: { json: notEligible } as EligibilityReply,
    options: { hideIfNotEligible: true },
  },
  { state: 'no plan', reply: { json: fixture('empty') } as EligibilityReply, options: {} },
  { state: 'failed', reply: { networkError: true } as EligibilityReply, options: {} },
])('PaymentPlans, $state', ({ reply, options }) => {
  it('leaves the container with no element child', async () => {
    await renderPlans(reply, options)
    expect(containerChildren(container())).toEqual([])
  })
})

const sentinels = () => document.querySelectorAll('[data-react-modal-body-trap]')
const modalContainer = () =>
  document.querySelector('[data-testid="modal-container"]') as HTMLElement
const within = (selector: string) => portal().querySelectorAll(selector)

const STANDALONE_STATES = [
  { state: 'pending', reply: { pending: true } as EligibilityReply },
  { state: 'success', reply: { json: fourPlans } as EligibilityReply },
  { state: 'no eligibility', reply: { json: notEligible } as EligibilityReply },
  { state: 'failed', reply: { networkError: true } as EligibilityReply },
]

/** What every way to open the modal shares: the portal, the page traps and the dialog. */
const expectModalShell = () => {
  const { body, documentElement } = document

  expect(portal()).not.toBeNull()
  expect(body.lastElementChild).toBe(portal())
  expect(sentinels()).toHaveLength(2)
  expect(body.firstElementChild).toBe(sentinels()[0])
  expect(portal().previousElementSibling).toBe(sentinels()[1])
  sentinels().forEach((sentinel) => {
    expect(sentinel.localName).toBe('div')
    expect(sentinel.getAttribute('tabindex')).toBe('0')
  })
  expect(body.classList.contains('ReactModal__Body--open')).toBe(true)
  expect(documentElement.getAttribute('style')).toBe(
    'width: 100%; position: fixed; top: 0px; overflow: hidden;',
  )

  const overlay = portal().firstElementChild as HTMLElement
  expect(portal().children).toHaveLength(1)
  expect(classes(overlay)).toEqual(
    expect.arrayContaining(['ReactModal__Overlay', 'ReactModal__Overlay--after-open']),
  )
  expect(overlay.children).toHaveLength(1)
  expect(overlay.firstElementChild).toBe(dialog())
  expect(classes(dialog())).toEqual(
    expect.arrayContaining(['ReactModal__Content', 'ReactModal__Content--after-open']),
  )
  expect(dialog().localName).toBe('div')
  expect(dialog().getAttribute('role')).toBe('dialog')
  expect(dialog().getAttribute('aria-modal')).toBe('true')
  expect(dialog().getAttribute('tabindex')).toBe('-1')
  expect(dialog().getAttribute('aria-labelledby')).toBe('modal-title')
  // This names a data-testid, not an ID: no element has the ID `modal-info-element`, and the
  // attribute points at nothing. Merchants and screen readers get the same today.
  expect(dialog().getAttribute('aria-describedby')).toBe('modal-info-element')
  expect(document.getElementById('modal-info-element')).toBeNull()
  expect(dialog().querySelector('[data-testid="modal-info-element"]')).not.toBeNull()

  // The header holds the close button, then the content holds the skip links and the modal.
  expect(
    dialog().querySelector(
      ':scope > div:first-child > button.alma-eligibility-modal-close-button[data-testid="modal-close-button"]',
    ),
  ).not.toBeNull()
  const skipLinks = dialog().querySelectorAll(':scope > div > nav a')
  expect(Array.from(skipLinks).map((link) => link.getAttribute('href'))).toEqual([
    '#payment-plans',
    '#payment-info',
    '#payment-schedule',
  ])
  // The inner container repeats role="dialog" and aria-modal="true" of the outer one, so a page
  // has two nested dialogs.
  expect(modalContainer().getAttribute('role')).toBe('dialog')
  expect(modalContainer().getAttribute('aria-modal')).toBe('true')
  expect(modalContainer().getAttribute('aria-labelledby')).toBe('modal-title')
  expect(dialog().contains(modalContainer())).toBe(true)
}

/** The children of the modal container, as `tag.alma-class` pairs. */
const childrenOf = (element: Element) =>
  Array.from(element.children).map((child) =>
    [child.localName, ...classes(child).filter((token) => token.startsWith('alma-'))].join('.'),
  )

/** The layout of the modal at a width, from its title and the state content. */
const expectLayout = (name: string) => {
  const sideClasses = ['alma-eligibility-modal-left-side', 'alma-eligibility-modal-right-side']
  if (name === 'desktop') {
    expect(classes(modalContainer())).toContain('alma-eligibility-modal-desktop-modal')
    expect(classes(modalContainer())).not.toContain('alma-eligibility-modal-mobile-modal')
    expect(childrenOf(modalContainer())).toEqual(
      ['div.alma-eligibility-modal-left-side'].concat(['div.alma-eligibility-modal-right-side']),
    )
    sideClasses.forEach((token) => expect(within(`.${token}`)).toHaveLength(1))
  } else {
    expect(classes(modalContainer())).toContain('alma-eligibility-modal-mobile-modal')
    expect(classes(modalContainer())).not.toContain('alma-eligibility-modal-desktop-modal')
    sideClasses.forEach((token) => expect(within(`.${token}`)).toHaveLength(0))
  }
}

describe.each(WIDTHS)('modal at $name width', ({ name, width }) => {
  beforeEach(() => {
    setViewportWidth(width)
  })

  describe('opened from the widget by a click on the second plan', () => {
    beforeEach(async () => {
      await renderModalFromWidget(1, { cards: ['cb', 'visa'] })
    })

    it('has the shell, the layout and the clicked plan active', () => {
      expectModalShell()
      expectLayout(name)
      expect(within('.alma-eligibility-modal-active-option')).toHaveLength(1)
      expect(within('.alma-eligibility-modal-active-option')[0].textContent).toBe('3x')
      expect(planButtons()[1].getAttribute('aria-selected')).toBe('true')
    })

    it('keeps the widget in the container', () => {
      expect(containerChildren(container())).toHaveLength(2)
      expect(container().querySelector('#alma-widget-payment-plans-main-container')).not.toBeNull()
    })

    // The widget and the modal each render these headings, so both IDs are on the page twice.
    it('repeats the ID of two headings', () => {
      expect(document.querySelectorAll('#payment-plans-title')).toHaveLength(2)
      expect(document.querySelectorAll('#payment-info-title')).toHaveLength(2)
    })
  })

  describe.each(STANDALONE_STATES)('standalone modal, $state', ({ state, reply }) => {
    beforeEach(async () => {
      await renderStandaloneModal(reply, { cards: ['cb', 'visa'] })
    })

    it('has the shell and the layout', () => {
      expectModalShell()
      expectLayout(name)
    })

    it('leaves the container with no element child', () => {
      expect(containerChildren(container())).toEqual([])
    })

    it('shows the content of its state', () => {
      const statuses = within('[role="status"]')
      const alerts = within('[role="alert"]')
      const loaders = within('[data-testid="loader"]')
      const planButtonsInModal = within('#payment-plans button')

      if (state === 'pending') {
        expect(statuses).toHaveLength(1)
        expect(statuses[0].getAttribute('aria-live')).toBe('polite')
        expect(statuses[0].querySelector('[data-testid="loader"]')).not.toBeNull()
        expect(loaders).toHaveLength(1)
      } else {
        expect(statuses).toHaveLength(0)
        expect(loaders).toHaveLength(0)
      }
      expect(alerts).toHaveLength(state === 'no eligibility' ? 1 : 0)
      expect(planButtonsInModal).toHaveLength(state === 'success' ? 4 : 0)
      expect(within('#payment-schedule')).toHaveLength(state === 'success' ? 1 : 0)
    })
  })

  describe('standalone modal with cards and a credit plan', () => {
    it('shows the schedule, the summary and the legal mentions', async () => {
      await renderStandaloneModal({ json: fourPlans }, { cards: ['cb', 'visa'] })
      const group = within('#payment-plans')[0]
      const schedule = within('#payment-schedule')[0]

      expect(group.localName).toBe('div')
      expect(group.getAttribute('role')).toBe('group')
      expect(classes(group)).toContain('alma-eligibility-modal-eligibility-options')
      expect(schedule.getAttribute('role')).toBe('region')
      expect(
        schedule.querySelector(
          'ul.alma-eligibility-modal-schedule-details[data-testid="modal-installments-element"]',
        ),
      ).not.toBeNull()
      expect(schedule.querySelector('[data-testid="installment-0"]')).not.toBeNull()
      expect(
        schedule.querySelector('div.alma-eligibility-modal-summary[data-testid="modal-summary"]'),
      ).not.toBeNull()
      expect(schedule.querySelector('p.alma-eligibility-modal-schedule-total')).not.toBeNull()
      expect(schedule.querySelector('p.alma-eligibility-modal-schedule-credit')).not.toBeNull()
      expect(schedule.querySelector('[data-testid="legal-mentions"]')).not.toBeNull()
    })
  })
})

describe('matchMedia stub', () => {
  it('matches min-width: 800px at desktop width only, and never reduced motion', () => {
    const matches = (query: string) => window.matchMedia(query).matches
    const reduced = '(prefers-reduced-motion: reduce)'

    expect(matches('(min-width: 800px)')).toBe(false)
    setViewportWidth(DESKTOP_WIDTH)
    expect(matches('(min-width: 800px)')).toBe(true)
    expect(matches(reduced)).toBe(false)
    setViewportWidth(MOBILE_WIDTH)
    expect(matches('(min-width: 800px)')).toBe(false)
    expect(matches(reduced)).toBe(false)
  })
})

type Seen = { tag: string; id: string; testId: string | null; classes: string[] }

/** Every element of the container and of the portal. */
const seenNow = (): Seen[] =>
  [container(), portal()]
    .filter((root): root is HTMLElement => root !== null)
    .flatMap((root) => [root, ...Array.from(root.querySelectorAll('*'))])
    .map((element) => ({
      tag: element.localName,
      id: element.id,
      testId: element.getAttribute('data-testid'),
      classes: classes(element),
    }))

/** Renders each state in turn on a clean page and keeps what every one of them showed. */
const seenInStates = async (width: number, renders: Array<() => Promise<unknown>>) => {
  setViewportWidth(width)
  const seen: Seen[] = []
  for (let index = 0; index < renders.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await renders[index]()
    seen.push(...seenNow())
    // eslint-disable-next-line no-await-in-loop
    await closeModal()
    document.body.replaceChildren()
    sessionStorage.clear()
  }
  return seen
}

const cards = { cards: ['cb', 'visa', 'mastercard', 'amex'] }
const everyState = (width: number) =>
  seenInStates(width, [
    () => renderPlans({ pending: true }),
    () => renderPlans({ json: fourPlans }),
    () => renderPlans({ json: notEligible }),
    () => renderModalFromWidget(3, cards),
    () => renderStandaloneModal({ json: fourPlans }, cards),
    () => renderStandaloneModal({ pending: true }),
  ])

// The element type that each contract name sits on, on master. Every key must be in
// inventory.json and every name of the inventory must be a key, so a renamed name fails here.
const CLASS_ELEMENTS: Record<string, string[]> = {
  'alma-payment-plans-container': ['div'],
  'alma-payment-plans-eligibility-line': ['div'],
  'alma-payment-plans-eligibility-options': ['div'],
  'alma-payment-plans-not-eligible-option': ['button', 'div'],
  'alma-payment-plans-payment-info': ['div'],
  'alma-payment-plans-active-option': ['button'],
  'alma-payment-plans-know-more-action': ['button'],
  'alma-eligibility-modal-desktop-modal': ['div'],
  'alma-eligibility-modal-mobile-modal': ['div'],
  'alma-eligibility-modal-left-side': ['div'],
  'alma-eligibility-modal-bullet': ['div'],
  'alma-eligibility-modal-right-side': ['div'],
  'alma-eligibility-modal-title': ['div'],
  'alma-eligibility-modal-info': ['div'],
  'alma-eligibility-modal-info-message': ['div'],
  'alma-eligibility-modal-eligibility-options': ['div'],
  'alma-eligibility-modal-active-option': ['button'],
  'alma-eligibility-modal-close-button': ['button'],
  'alma-eligibility-modal-schedule-details': ['ul'],
  'alma-eligibility-modal-schedule-total': ['p'],
  'alma-eligibility-modal-schedule-credit': ['p'],
  'alma-eligibility-modal-card-logos': ['div'],
  'alma-eligibility-modal-summary': ['div'],
}

const ID_ELEMENTS: Record<string, string[]> = {
  'alma-widget-payment-plans-main-container': ['div'],
  'alma-widget-modal-main-container': ['div'],
  'payment-plans-title': ['div'],
  'payment-info-text': ['div'],
  'payment-info-title': ['div'],
  'modal-title': ['div'],
  'payment-plans': ['div'],
  'payment-info': ['div'],
  'payment-info-description': ['ol'],
  'payment-schedule': ['div'],
  'payment-schedule-title': ['div'],
  'payment-schedule-description': ['div'],
}

// `{card}` and `{index}` stand for any value.
const TEST_ID_ELEMENTS: Record<string, string[]> = {
  'widget-container': ['div'],
  'Alma-Logo': ['svg'],
  loader: ['div'],
  'modal-container': ['div'],
  'modal-close-button': ['button'],
  'modal-title-element': ['div'],
  'modal-info-element': ['div'],
  'modal-installments-element': ['ul'],
  'modal-summary': ['div'],
  'legal-mentions': ['div'],
  'card-logos': ['div'],
  'card-logo-{card}': ['div'],
  'installment-{index}': ['div'],
}

const testIdPattern = (name: string) => new RegExp(`^${name.replace(/\{\w+\}/g, '.+')}$`)

describe('inventory on the page', () => {
  let desktop: Seen[]
  let mobile: Seen[]
  beforeAll(async () => {
    desktop = await everyState(DESKTOP_WIDTH)
    mobile = await everyState(MOBILE_WIDTH)
  })

  const tagsOf = (seen: Seen[], matches: (item: Seen) => boolean) => [
    ...new Set(seen.filter(matches).map(({ tag }) => tag)),
  ]

  it('lists the same names as the inventory', () => {
    expect(Object.keys(CLASS_ELEMENTS).sort()).toEqual(
      [...inventory.classes.paymentPlans, ...inventory.classes.modal].sort(),
    )
    expect(Object.keys(ID_ELEMENTS).sort()).toEqual(
      [...inventory.ids.contract, ...inventory.ids.internal].sort(),
    )
    expect(Object.keys(TEST_ID_ELEMENTS).sort()).toEqual([...inventory.dataTestIds].sort())
  })

  const CLASS_NAMES = [...inventory.classes.paymentPlans, ...inventory.classes.modal]
  const ID_NAMES = [...inventory.ids.contract, ...inventory.ids.internal]

  CLASS_NAMES.forEach((name) => {
    it(`puts the class ${name} on the element type of master`, () => {
      const tags = tagsOf([...desktop, ...mobile], ({ classes: tokens }) => tokens.includes(name))
      expect(tags.length).toBeGreaterThan(0)
      tags.forEach((tag) => expect(CLASS_ELEMENTS[name]).toContain(tag))
    })
  })

  ID_NAMES.forEach((name) => {
    it(`puts the ID ${name} on the element type of master`, () => {
      const tags = tagsOf([...desktop, ...mobile], ({ id }) => id === name)
      expect(tags.length).toBeGreaterThan(0)
      tags.forEach((tag) => expect(ID_ELEMENTS[name]).toContain(tag))
    })
  })

  inventory.dataTestIds.forEach((name) => {
    it(`puts the data-testid ${name} on the element type of master`, () => {
      const pattern = testIdPattern(name)
      const tags = tagsOf(
        [...desktop, ...mobile],
        ({ testId }) => testId !== null && pattern.test(testId),
      )
      expect(tags.length).toBeGreaterThan(0)
      tags.forEach((tag) => expect(TEST_ID_ELEMENTS[name]).toContain(tag))
    })
  })

  it('shows the left and right side classes at desktop width only', () => {
    const sides = ['alma-eligibility-modal-left-side', 'alma-eligibility-modal-right-side']
    const mobileOnly = 'alma-eligibility-modal-mobile-modal'
    sides.forEach((side) => {
      expect(desktop.some(({ classes: tokens }) => tokens.includes(side))).toBe(true)
      expect(mobile.some(({ classes: tokens }) => tokens.includes(side))).toBe(false)
    })
    expect(desktop.some(({ classes: tokens }) => tokens.includes(mobileOnly))).toBe(false)
    expect(mobile.some(({ classes: tokens }) => tokens.includes(mobileOnly))).toBe(true)
  })

  // On master only a unit test sets `alma-logo`, so no widget state carries it.
  it('matches nothing for the lowercase alma-logo test ID', () => {
    expect([...desktop, ...mobile].filter(({ testId }) => testId === 'alma-logo')).toEqual([])
  })

  it('has no class token undefined', () => {
    expect(
      [...desktop, ...mobile].filter(({ classes: tokens }) => tokens.includes('undefined')),
    ).toEqual([])
  })
})
