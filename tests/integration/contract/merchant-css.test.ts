import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import postcss from 'postcss'
import { afterEach, beforeAll, beforeEach, describe, expect } from 'vitest'

import inventory from './inventory.json'
import { mockEligibilityApi } from './support/api-mock'
import type { EligibilityReply } from './support/api-mock'
import { it } from './support/contract-test'
import { loadUmd } from './support/load-bundle'
import { MERCHANT_ID, closeButton, tick, useFakeClock } from './support/page'
import { DESKTOP_WIDTH, MOBILE_WIDTH, setViewportWidth } from './support/viewport'

const fixture = (name: string) =>
  JSON.parse(readFileSync(resolve(__dirname, `fixtures/eligibility/${name}.json`), 'utf8'))

const CSS_DIR = resolve(__dirname, 'fixtures/merchant-css')
const MATCHES_PATH = resolve(__dirname, 'fixtures/merchant-css-matches.json')

const fourPlans = fixture('eligible-4x-2x-10x-credit-3x')
const onePlan = fixture('eligible-3x')
const notEligible = fixture('ineligible-amount-2x-3x-4x')
const empty = fixture('empty')

let Alma: ReturnType<typeof loadUmd>
beforeAll(() => {
  Alma = loadUmd()
})

useFakeClock()

// jsdom doesn't implement window.scroll, which master calls on close through no-scroll.
beforeEach(() => {
  vi.stubGlobal('scroll', () => {})
})

// A modal that a test leaves open stays mounted after setup.ts empties <body>.
const closeModal = async () => {
  ;(closeButton() as HTMLElement | null)?.click()
  await tick(1000)
}
afterEach(closeModal)

type Options = Record<string, unknown>
type Handle = { open: () => void }
type Mounted = { mount: HTMLElement }

type State = {
  name: string
  width: number
  /** Adds the widget to the mount point and brings it to the state. */
  render: (mount: (options?: Options, widget?: string) => unknown) => Promise<void>
}

const showPlans =
  (reply: EligibilityReply, options: Options = {}): State['render'] =>
  async (mount) => {
    mockEligibilityApi(reply)
    mount(options)
    await tick(1000)
  }

const openModalFromWidget =
  (index: number): State['render'] =>
  async (mount) => {
    mockEligibilityApi({ json: fourPlans })
    mount({ cards: ['cb', 'visa', 'mastercard', 'amex'] })
    await tick(1000)
    document.querySelectorAll<HTMLElement>('[role="option"]')[index].click()
    await tick(500)
  }

const showStandaloneModal =
  (reply: EligibilityReply): State['render'] =>
  async (mount) => {
    mockEligibilityApi(reply)
    const handle = mount({ cards: ['cb', 'visa', 'mastercard', 'amex'] }, 'Modal') as Handle
    handle.open()
    await tick(500)
  }

const WIDTHS = [
  { name: 'desktop', width: DESKTOP_WIDTH },
  { name: 'mobile', width: MOBILE_WIDTH },
] as const

/** The DOM contract states of dom-states.test.ts. */
const STATES: State[] = [
  { name: 'loading', width: MOBILE_WIDTH, render: showPlans({ pending: true }) },
  {
    name: 'loading-hide-border',
    width: MOBILE_WIDTH,
    render: showPlans({ pending: true }, { hideBorder: true }),
  },
  { name: 'several-plans', width: MOBILE_WIDTH, render: showPlans({ json: fourPlans }) },
  { name: 'one-plan', width: MOBILE_WIDTH, render: showPlans({ json: onePlan }) },
  { name: 'all-not-eligible', width: MOBILE_WIDTH, render: showPlans({ json: notEligible }) },
  {
    name: 'hidden',
    width: MOBILE_WIDTH,
    render: showPlans({ json: notEligible }, { hideIfNotEligible: true }),
  },
  { name: 'no-plan', width: MOBILE_WIDTH, render: showPlans({ json: empty }) },
  { name: 'failed', width: MOBILE_WIDTH, render: showPlans({ networkError: true }) },
  ...WIDTHS.flatMap(({ name, width }): State[] => [
    { name: `modal-open-${name}`, width, render: openModalFromWidget(1) },
    { name: `modal-pending-${name}`, width, render: showStandaloneModal({ pending: true }) },
    { name: `modal-success-${name}`, width, render: showStandaloneModal({ json: fourPlans }) },
    {
      name: `modal-no-eligibility-${name}`,
      width,
      render: showStandaloneModal({ json: notEligible }),
    },
    { name: `modal-failed-${name}`, width, render: showStandaloneModal({ networkError: true }) },
  ]),
]

/** Renders a state on a clean page, calls what to do with it, and cleans the page. */
const inState = async <T>(
  state: State,
  markup: string,
  mountSelector: string,
  then: (page: Mounted) => T,
): Promise<T> => {
  document.body.innerHTML = markup
  setViewportWidth(state.width)
  await state.render((options = {}, widget = 'PaymentPlans') =>
    Alma.Widgets.initialize(MERCHANT_ID, Alma.ApiMode.TEST).add(
      widget === 'Modal' ? Alma.Widgets.Modal : Alma.Widgets.PaymentPlans,
      {
        container: mountSelector,
        purchaseAmount: 45000,
        ...options,
      },
    ),
  )
  const result = then({ mount: document.querySelector(mountSelector) as HTMLElement })
  await closeModal()
  document.body.replaceChildren()
  sessionStorage.clear()
  return result
}

// --- The fixtures ---

type Variant = { label: string | undefined; markup: string; mount: string }
type Fixture = { file: string; variants: Variant[]; selectors: string[]; skipped: string[] }

// The comment at the top of a fixture holds its container markup and the selector to mount into.
const readVariants = (css: string): Variant[] => {
  const markups = Array.from(css.matchAll(/^ \* Container markup(?: \(([\w-]+)\))?: (.+)$/gm))
  const mounts = Array.from(css.matchAll(/^ \* Mount: (.+)$/gm))
  return markups.map(([, label, markup], index) => ({
    label,
    markup,
    mount: mounts[index][1],
  }))
}

// The states that a selector can't depend on are out of the contract: it never matches a pseudo
// state in jsdom, and a pseudo-element is no element.
const PSEUDO = /::?(?:hover|focus-visible|focus-within|focus|active|visited|before|after)\b/g

const HASHED_MODULE_CLASS = /\._[\w-]*/

const readFixture = (file: string): Fixture => {
  const css = readFileSync(resolve(CSS_DIR, file), 'utf8')
  const selectors = new Set<string>()
  const skipped = new Set<string>()
  postcss.parse(css).walkRules((rule) => {
    const inSkippedAtRule = (() => {
      for (let node = rule.parent; node && node.type !== 'root'; node = node.parent) {
        if (
          node.type === 'atrule' &&
          /keyframes$|^font-face$/.test((node as { name: string }).name)
        )
          return true
      }
      return false
    })()
    if (inSkippedAtRule) return
    rule.selectors.forEach((selector) => {
      const stripped = selector.replace(PSEUDO, '').replace(/\s+/g, ' ').trim()
      if (HASHED_MODULE_CLASS.test(stripped)) skipped.add(stripped)
      else selectors.add(stripped)
    })
  })
  return {
    file,
    variants: readVariants(css),
    selectors: [...selectors],
    skipped: [...skipped],
  }
}

const FIXTURES = readdirSync(CSS_DIR)
  .filter((file) => file.endsWith('.css'))
  .sort()
  .map(readFixture)

// --- Why a selector matches nothing ---

const PAGE_LEVEL = 'Styles an element of the merchant page, outside the widget.'
const MOCK_ONLY =
  "Targets an ID that exists only in the static mock of the block's editor, never in the widget."
const OUTSIDE_CONTAINER =
  'Matches the wrapper around the widget container, not an element inside it.'

const reasons = (file: string, selectors: string[], reason: string): Record<string, string> =>
  Object.fromEntries(selectors.map((selector) => [`${file} :: ${selector}`, reason]))

/** The reason of each selector that matches nothing in any state, by `<file> :: <selector>`. */
const REASONS: Record<string, string> = {
  ...reasons(
    'examples-style.css',
    [
      'html',
      'body',
      'h1',
      'h3',
      '.alma-logo',
      '.body',
      '.main',
      '.menu',
      '.menu a',
      '.image',
      '.image img',
      '.product',
      '.product h1',
      '.add-to-cart',
      '.add-to-cart button',
      '.product p',
      '.open-modal-ctas',
      '.open-modal-ctas a',
    ],
    PAGE_LEVEL,
  ),
  ...reasons(
    'woocommerce-block-view.css',
    ['#alma-widget .alma-payment-plans-container'],
    'The block renders the class "alma-widget", not the ID "alma-widget", so no element has the ID.',
  ),
  ...reasons(
    'woocommerce-block-editor.css',
    [
      '#alma-payment-plans-eligibility-line',
      '#alma-payment-plans-eligibility-options',
      '#alma-payment-plans-eligibility-line button',
      '#alma-payment-plans-eligibility-line button#active',
      '.alma-default-widget',
    ],
    MOCK_ONLY,
  ),
  ...reasons('prestashop-product.css', ['.alma-pp-container.ps15'], OUTSIDE_CONTAINER),
  ...reasons(
    'prestashop-product.css',
    [
      '.alma-pp-container.ps15 .alma-paymentPlans',
      '.alma-pp-container img.logo',
      '.alma-widget-root .atw-z-50.atw-bg-black',
      '.alma-widget-root.alma-howItWorks > div',
    ],
    'Targets the markup of an older Alma widget, which this widget does not render.',
  ),
  ...reasons(
    'agency-3.css',
    ['.alma-widget-pdp.is-loading', '.alma-widget-pdp.is-hidden'],
    "A state class that the merchant's own script sets on its container, never the widget.",
  ),
}

const key = (file: string, selector: string) => `${file} :: ${selector}`

// --- The counts ---

type Counts = Record<string, string>

const countsOf = async (fixtureFile: Fixture): Promise<Record<string, Counts>> => {
  const result: Record<string, Counts> = Object.fromEntries(
    fixtureFile.selectors.map((selector) => [selector, {}]),
  )
  const variants = fixtureFile.variants.length > 0 ? fixtureFile.variants : []
  for (let v = 0; v < variants.length; v += 1) {
    const { label, markup, mount } = variants[v]
    for (let s = 0; s < STATES.length; s += 1) {
      const state = STATES[s]
      const stateKey = label ? `${label} / ${state.name}` : state.name
      // eslint-disable-next-line no-await-in-loop
      await inState(state, markup, mount, ({ mount: mountElement }) => {
        const portal = document.querySelector('.ReactModalPortal')
        fixtureFile.selectors.forEach((selector) => {
          const found = Array.from(document.querySelectorAll(selector))
          const inContainer = found.filter((element) => mountElement.contains(element)).length
          const inPortal = found.filter((element) => portal?.contains(element)).length
          result[selector][stateKey] = `${inContainer}:${inPortal}`
        })
      })
    }
  }
  return result
}

const isZero = (counts: Counts) => Object.values(counts).every((count) => count === '0:0')

type Matches = Record<
  string,
  {
    skipped: Array<{ selector: string; reason: string }>
    selectors: Record<string, { counts: Counts; reason?: string }>
  }
>

// Rendering every fixture in every state takes a while, so the tests below share one run.
let computed: Promise<Matches> | undefined
const compute = (): Promise<Matches> => {
  computed ??= (async () => {
    const matches: Matches = {}
    for (let index = 0; index < FIXTURES.length; index += 1) {
      const fixtureFile = FIXTURES[index]
      // eslint-disable-next-line no-await-in-loop
      const counts = await countsOf(fixtureFile)
      matches[fixtureFile.file] = {
        skipped: fixtureFile.skipped.map((selector) => ({
          selector,
          reason: 'Hashed CSS-module class, outside the contract.',
        })),
        selectors: Object.fromEntries(
          fixtureFile.selectors.map((selector) => {
            const reason = REASONS[key(fixtureFile.file, selector)]
            return [
              selector,
              isZero(counts[selector]) && reason
                ? { counts: counts[selector], reason }
                : { counts: counts[selector] },
            ]
          }),
        ),
      }
    }
    return matches
  })()
  return computed
}

const zeroSelectors = (matches: Matches) =>
  Object.entries(matches).flatMap(([file, { selectors }]) =>
    Object.entries(selectors)
      .filter(([, { counts }]) => isZero(counts))
      .map(([selector]) => key(file, selector)),
  )

const SLOW = 180_000

describe('merchant CSS selectors', () => {
  describe.each(FIXTURES)('$file', ({ file, variants }) => {
    it('names its source and a container to mount into', () => {
      const css = readFileSync(resolve(CSS_DIR, file), 'utf8')
      expect(css).toMatch(/^\/\*\n \* Source: /)
      expect(variants.length).toBeGreaterThan(0)
    })
  })

  // Each count is "<in the container>:<in the modal portal>". jsdom computes no style, so the
  // contract is which elements a selector reaches. A fixture count of 0 in every state needs a
  // reason, and master's counts are the golden file.
  it(
    'matches the golden counts of each selector in each state',
    async () => {
      await expect(`${JSON.stringify(await compute(), null, 2)}\n`).toMatchFileSnapshot(
        MATCHES_PATH,
      )
    },
    SLOW,
  )

  it(
    'gives a reason to every selector that matches nothing in any state',
    async () => {
      const missing = zeroSelectors(await compute()).filter((id) => !(id in REASONS))
      expect(missing).toEqual([])
    },
    SLOW,
  )

  it(
    'keeps a reason only for a selector that matches nothing',
    async () => {
      const zero = new Set(zeroSelectors(await compute()))
      expect(Object.keys(REASONS).filter((id) => !zero.has(id))).toEqual([])
    },
    SLOW,
  )
})

// --- Every class of the inventory, in at least one state ---

describe('merchant CSS classes', () => {
  it(
    'has an element for each alma-* class of the inventory in at least one state',
    async () => {
      const seen = new Set<string>()
      for (let index = 0; index < STATES.length; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        await inState(
          STATES[index],
          '<div id="alma-widget"></div>',
          '#alma-widget',
          ({ mount }) => {
            ;[mount, document.querySelector('.ReactModalPortal')]
              .filter((root): root is Element => root !== null)
              .flatMap((root) => [root, ...Array.from(root.querySelectorAll('*'))])
              .forEach((element) => element.classList.forEach((token) => seen.add(token)))
          },
        )
      }
      const names = [...inventory.classes.paymentPlans, ...inventory.classes.modal]
      expect(names.filter((name) => !seen.has(name))).toEqual([])
    },
    SLOW,
  )
})

// --- The Shopify theme block ---

type Item = { tag: string; id: string; role: string | null }

describe('Shopify theme block', () => {
  // The block makes #alma-widget a flex container. The widget host has display: contents, so the
  // flex items are the widget root and the announcement, in that order.
  it('lays out the widget root and then the announcement in the flex container', async () => {
    const shopify = FIXTURES.find(({ file }) => file === 'shopify-theme-block.css') as Fixture
    const [{ markup, mount }] = shopify.variants
    const state = STATES.find(({ name }) => name === 'several-plans') as State

    const items = await inState(state, markup, mount, ({ mount: container }): Item[] => {
      const flexItems = (parent: Element): Element[] =>
        Array.from(parent.children).flatMap((child) =>
          (child as HTMLElement).style.display === 'contents' ? flexItems(child) : [child],
        )
      return flexItems(container).map((element) => ({
        tag: element.localName,
        id: element.id,
        role: element.getAttribute('role'),
      }))
    })

    expect(items).toEqual([
      { tag: 'div', id: 'alma-widget-payment-plans-main-container', role: null },
      { tag: 'div', id: '', role: 'alert' },
    ])
  })
})
