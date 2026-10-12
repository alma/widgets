import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeAll, beforeEach, describe, expect } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import type { EligibilityReply } from './support/api-mock'
import { it } from './support/contract-test'
import { loadUmd } from './support/load-bundle'
import { addWidget, closeButton, planButtons, tick, useFakeClock } from './support/page'
import { DESKTOP_WIDTH, MOBILE_WIDTH, setViewportWidth } from './support/viewport'

// What this file pins, and what a reader of a golden file should know:
//
// - The golden files hold the text that master's react-intl build renders, one file per `Locale`.
//   They are written from dist-ref/ only. Run `npm run build:ref` first, then
//   `WIDGETS_DIST=dist-ref npx vitest run --project contract --update rendered-text` to rewrite them
//   after a master sync. ICU data changes number and date output between Node versions, so the
//   capture and the comparison run on the Node version of .nvmrc, which CI uses.
// - `pt` formats `€ 225,00` and `pt-PT` formats `225,00 €`. Both are master's output.
// - A widget whose plans are all not eligible and that has no `plans` option shows `Until €0.00`
//   in `en`, because the missing merchant config gives a maximum of 0. The port keeps it.
// - Master never renders `accessibility.animation-control-instructions`, so no golden file has it.
// - U+202F and U+00A0, which `Intl` puts in numbers and dates depending on the locale and on the
//   ICU version, are turned into plain spaces before the comparison.
// - Everything is captured at 1638350762000 in UTC (vitest.config.ts sets TZ), 500 ms after the
//   eligibility response, while master's first announcement (cleared after 1000 ms) still shows.

const contractDir = resolve(__dirname)
const repoRoot = resolve(__dirname, '../../..')

const fixture = (name: string) =>
  JSON.parse(readFileSync(resolve(contractDir, `fixtures/eligibility/${name}.json`), 'utf8'))

const goldenPath = (locale: string) => resolve(contractDir, `fixtures/golden/text/${locale}.txt`)

// The 14 values of the Locale enum of src/shared/i18n.
const LOCALES = [
  'en',
  'fr-FR',
  'fr',
  'de-DE',
  'de',
  'it',
  'it-IT',
  'es',
  'es-ES',
  'pt',
  'pt-PT',
  'nl',
  'nl-NL',
  'nl-BE',
] as const

const fourPlans = fixture('eligible-4x-2x-10x-credit-3x')
const planKinds = fixture('pay-now-deferred-15-days-30-days-1-month-2x-3x-4x-10x-credit')
const noFeesThenFees = fixture('eligible-2x-3x-4x')
const withFeesOnly = fixture('eligible-3x')
const belowMin = fixture('ineligible-amount-2x-3x-4x')
const aboveMax = fixture('ineligible-above-max-4x')

const plan = (installmentsCount: number, extra: Record<string, number> = {}) => ({
  installmentsCount,
  minAmount: 100,
  maxAmount: 200000,
  ...extra,
})

// One config plan for each plan of the planKinds response.
const planKindsConfig = [
  plan(1),
  plan(1, { deferredDays: 15 }),
  plan(1, { deferredDays: 30 }),
  plan(1, { deferredMonths: 1 }),
  plan(2),
  plan(3),
  plan(4),
  plan(10),
]

const withCountry = (response: Array<Record<string, unknown>>, country: string) =>
  response.map((entry) => ({ ...entry, transaction_country: country }))

// ---- text capture ---------------------------------------------------------------------------

const SPACES = /[\u202f\u00a0\s]+/g
const SPECIAL_SPACES = /[\u202f\u00a0]/g
const ATTRIBUTES = ['aria-label', 'title', 'alt'] as const

/** Turns U+202F, U+00A0 and every run of white space into one plain space. */
export const normalizeText = (text: string): string => text.replace(SPACES, ' ').trim()

const ownText = (element: Element): string =>
  normalizeText(
    Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent ?? '')
      .join(' '),
  )

/**
 * Each element's `aria-label`, `title` and `alt`, then its own text, in document order. Elements
 * with none of these leave no line. A line starts with the attribute name, or with `text`.
 */
const textLines = (root: Element): string[] =>
  [root, ...Array.from(root.querySelectorAll('*'))].flatMap((element) => {
    if (['script', 'style'].includes(element.localName)) return []
    const lines = ATTRIBUTES.flatMap((name) => {
      const value = normalizeText(element.getAttribute(name) ?? '')
      return value ? [`${name}: ${value}`] : []
    })
    const text = ownText(element)
    return text ? [...lines, `text: ${text}`] : lines
  })

/** The text of the container and of the modal portal, which react-modal appends to <body>. */
const renderedText = (): string => {
  const roots = [
    document.querySelector('#alma-widget'),
    document.querySelector('.ReactModalPortal'),
  ]
  return roots.flatMap((root) => (root ? textLines(root) : [])).join('\n')
}

// ---- page helpers ---------------------------------------------------------------------------

let Alma: ReturnType<typeof loadUmd>
beforeAll(() => {
  Alma = loadUmd()
})

useFakeClock()

// jsdom doesn't implement window.scroll, which master calls on close through no-scroll.
beforeEach(() => {
  vi.stubGlobal('scroll', () => {})
})

type Options = Record<string, unknown>
type Handle = { open: () => void }

const closeModal = async () => {
  ;(closeButton() as HTMLElement | null)?.click()
  await tick(1000)
}
afterEach(closeModal)

/** The time after the response at which every case captures its text. */
const CAPTURE_DELAY = 500

const renderPlans = async (reply: EligibilityReply, options: Options) => {
  mockEligibilityApi(reply)
  addWidget(Alma, Alma.Widgets.PaymentPlans, options)
  await tick(CAPTURE_DELAY)
}

const renderStandaloneModal = async (reply: EligibilityReply, options: Options) => {
  mockEligibilityApi(reply)
  const handle = addWidget(Alma, Alma.Widgets.Modal, options) as Handle
  handle.open()
  await tick(CAPTURE_DELAY)
}

const modalPlanButtons = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>('.alma-eligibility-modal-eligibility-options button'),
  )

// ---- cases ----------------------------------------------------------------------------------

type Case = { name: string; width?: number; run: (locale: string) => Promise<string[]> }

/** A case that captures once after it renders. */
const single = (
  name: string,
  render: (locale: string) => Promise<void>,
  width = MOBILE_WIDTH,
): Case => ({
  name,
  width,
  run: async (locale) => {
    await render(locale)
    return [renderedText()]
  },
})

const json = (response: unknown): EligibilityReply => ({ json: response })

const WIDGET_CASES: Case[] = [
  single('payment-plans loading', (locale) => renderPlans({ pending: true }, { locale })),
  single('payment-plans several plans', (locale) => renderPlans(json(fourPlans), { locale })),
  single('payment-plans one plan', (locale) => renderPlans(json(withFeesOnly), { locale })),
  // No `plans` option: every plan is not eligible, and the sentence reads `Until €0.00` in `en`.
  single('payment-plans all not eligible without plans', (locale) =>
    renderPlans(json(belowMin), { locale }),
  ),
  single('payment-plans not eligible below minAmount', (locale) =>
    renderPlans(json(belowMin), { locale, plans: [plan(2), plan(3), plan(4)] }),
  ),
  single('payment-plans not eligible above maxAmount', (locale) =>
    renderPlans(json(aboveMax), { locale, plans: [plan(4)] }),
  ),
]

/**
 * Plan kinds: the widget with each plan active in turn, which opens the modal on it, then the
 * modal with each plan selected in turn (schedule, totals, fees, credit cost, legal mentions).
 */
const planKindCases = (size: string, width: number): Case => ({
  name: `plan kinds, widget and modal with each plan selected in turn, ${size}`,
  width,
  run: async (locale) => {
    const captures: string[] = []
    await renderPlans(json(planKinds), { locale, plans: planKindsConfig })
    captures.push(`-- widget\n${renderedText()}`)

    // Hovering a plan makes it the active one, and its sentence replaces the previous one.
    for (let index = 1; index < planButtons().length; index += 1) {
      planButtons()[index].dispatchEvent(new MouseEvent('mouseenter'))
      // eslint-disable-next-line no-await-in-loop
      await tick(CAPTURE_DELAY)
      captures.push(`-- widget, plan ${index + 1} hovered\n${renderedText()}`)
    }
    planButtons()[0].dispatchEvent(new MouseEvent('mouseenter'))
    await tick(CAPTURE_DELAY)

    planButtons()[0].click()
    await tick(CAPTURE_DELAY)
    captures.push(`-- modal opened on plan 1\n${renderedText()}`)

    const count = modalPlanButtons().length
    for (let index = 1; index < count; index += 1) {
      modalPlanButtons()[index].click()
      // eslint-disable-next-line no-await-in-loop
      await tick(CAPTURE_DELAY)
      captures.push(`-- modal, plan ${index + 1} selected\n${renderedText()}`)
    }
    return captures
  },
})

const MODAL_CASES: Case[] = [
  ...[
    { name: 'pending', reply: { pending: true } as EligibilityReply },
    { name: 'success', reply: json(fourPlans) },
    { name: 'no eligibility', reply: json(belowMin) },
    { name: 'failed', reply: { networkError: true } as EligibilityReply },
  ].flatMap(({ name, reply }) =>
    [
      { size: 'desktop', width: DESKTOP_WIDTH },
      { size: 'mobile', width: MOBILE_WIDTH },
    ].map(({ size, width }) =>
      single(
        `standalone modal, ${name}, ${size}`,
        (locale) =>
          renderStandaloneModal(reply, { locale, plans: [plan(2), plan(3), plan(4), plan(10)] }),
        width,
      ),
    ),
  ),
  planKindCases('desktop', DESKTOP_WIDTH),
  planKindCases('mobile', MOBILE_WIDTH),
]

// The warning is keyed by transaction_country only. Each country gets the first plan of
// `eligible-2x-3x-4x` (a 2x without fees), plus NL with a 3x that has fees.
const COUNTRIES = ['FR', 'LU', 'BE', 'NL', 'IT', 'DE', 'PT', 'ES', 'GB', 'UK', 'US']

const WARNING_CASES: Case[] = [
  ...COUNTRIES.map((country) =>
    single(
      `warning, ${country}, without customer_fee`,
      (locale) =>
        renderStandaloneModal(json(withCountry(noFeesThenFees, country)), {
          locale,
          plans: [plan(2), plan(3), plan(4)],
        }),
      DESKTOP_WIDTH,
    ),
  ),
  single(
    'warning, NL, with customer_fee',
    (locale) =>
      renderStandaloneModal(json(withCountry(withFeesOnly, 'NL')), { locale, plans: [plan(3)] }),
    DESKTOP_WIDTH,
  ),
]

const CASES: Case[] = [...WIDGET_CASES, ...MODAL_CASES, ...WARNING_CASES]

const capture = async (locale: string): Promise<string> => {
  const sections: string[] = []
  for (const testCase of CASES) {
    sessionStorage.clear()
    vi.setSystemTime(1638350762000)
    setViewportWidth(testCase.width ?? MOBILE_WIDTH)
    // eslint-disable-next-line no-await-in-loop
    const captures = await testCase.run(locale)
    sections.push(`=== ${testCase.name}\n${captures.join('\n')}`)
    // eslint-disable-next-line no-await-in-loop
    await closeModal()
  }
  return `${sections.join('\n\n')}\n`
}

describe('rendered text of each locale', () => {
  LOCALES.forEach((locale) => {
    it(`${locale} matches the golden text`, async () => {
      const captured = await capture(locale)
      // A golden file that only differs by U+202F or U+00A0 where the capture has a plain space
      // still passes, so a hand edit or an ICU update of those characters isn't a failure.
      const golden = existsSync(goldenPath(locale)) ? readFileSync(goldenPath(locale), 'utf8') : ''
      const sameText = golden.replace(SPECIAL_SPACES, ' ') === captured
      await expect(sameText ? golden : captured).toMatchFileSnapshot(goldenPath(locale))
    })
  })
})

describe('text normalization', () => {
  it('treats U+202F, U+00A0 and a plain space alike', () => {
    expect(normalizeText('225\u202f€ \u00a0 de\u00a0plus')).toBe('225 € de plus')
  })

  it('reads the own text, aria-label, title and alt of each element in document order', () => {
    document.body.innerHTML =
      '<div id="alma-widget"><p aria-label="a" title="b">one <strong>two</strong> three</p><img alt="c"></div>'
    expect(renderedText()).toBe(
      ['aria-label: a', 'title: b', 'text: one three', 'text: two', 'alt: c'].join('\n'),
    )
  })
})

// ---- coverage of the message keys -----------------------------------------------------------

const catalogue = (language: string): Record<string, string> =>
  JSON.parse(readFileSync(resolve(repoRoot, `src/intl/messages/messages.${language}.json`), 'utf8'))

const KEY_PREFIXES = ['payment-plan-strings.', 'legal-mentions.', 'warning-message.']

/** Keys that master never renders, and why. Each one must stay absent from the golden files. */
const NEVER_RENDERED: Record<string, string> = {}

/** The literal text of an ICU message, with the arguments and the tags taken out. */
const literals = (message: string): string[] => {
  const found: string[] = []
  let text = ''
  const flush = () => {
    found.push(...text.split(/<\/?\w+>/))
    text = ''
  }
  for (let index = 0; index < message.length; index += 1) {
    if (message[index] !== '{') {
      text += message[index]
    } else {
      flush()
      let depth = 1
      const start = index + 1
      while (depth > 0) {
        index += 1
        if (message[index] === '{') depth += 1
        if (message[index] === '}') depth -= 1
      }
      const body = message.slice(start, index)
      // `{name, plural, one {…} other {…}}`: the branches hold literal text.
      if (/^\s*\w+\s*,\s*(plural|select|selectordinal)\s*,/.test(body)) {
        const branches = body.replace(/^[^,]*,[^,]*,/, '')
        const parts = branches.match(/\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g) ?? []
        parts.forEach((part) => found.push(...literals(part.slice(1, -1))))
      }
    }
  }
  flush()
  return found.map(normalizeText).filter((piece) => /\p{L}/u.test(piece))
}

const messageKeys = (): string[] =>
  Object.keys(JSON.parse(readFileSync(resolve(repoRoot, 'src/intl/messages.json'), 'utf8'))).filter(
    (key) => KEY_PREFIXES.some((prefix) => key.startsWith(prefix)),
  )

describe('message keys', () => {
  const language = (locale: string) => locale.slice(0, 2)
  const golden = (locale: string) => normalizeText(readFileSync(goldenPath(locale), 'utf8'))

  LOCALES.forEach((locale) =>
    it(`${locale} renders every key, or the key says why it never does`, () => {
      const source = JSON.parse(readFileSync(resolve(repoRoot, 'src/intl/messages.json'), 'utf8'))
      const messages = catalogue(language(locale))
      const text = golden(locale)

      const missing = messageKeys().filter((key) => {
        const message: string = messages[key] ?? source[key]
        const rendered = literals(message).some((piece) => text.includes(piece))
        if (key in NEVER_RENDERED) {
          expect(rendered, `${key} is listed as never rendered but appears in ${locale}.txt`).toBe(
            false,
          )
          return false
        }
        return !rendered
      })

      expect(missing).toEqual([])
    }),
  )
})
