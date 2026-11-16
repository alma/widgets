import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeAll, beforeEach, describe, expect } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import { it } from './support/contract-test'
import { outlineToText, widgetOutline } from './support/dom'
import { withEscapes } from './support/escaped-errors'
import { CONTRACT_VERSION, isReferenceBuild, loadUmd } from './support/load-bundle'
import { addWidget, closeButton, container, tick, useFakeClock } from './support/page'

const TAGS = ['alma-payment-plans', 'alma-eligibility-modal']

const fourPlans = JSON.parse(
  readFileSync(
    resolve(__dirname, 'fixtures/eligibility/eligible-4x-2x-10x-credit-3x.json'),
    'utf8',
  ),
)

const golden = (name: string) =>
  readFileSync(resolve(__dirname, `fixtures/golden/dom/${name}.txt`), 'utf8')

useFakeClock()

// jsdom doesn't implement window.scroll, which master calls on close through no-scroll.
beforeEach(() => {
  vi.stubGlobal('scroll', () => {})
})

// A modal that a test leaves open stays mounted after setup.ts empties <body>.
afterEach(async () => {
  ;(closeButton() as HTMLElement | null)?.click()
  await tick(1000)
})

type Handle = { open: () => void }

const definitions = () => TAGS.map((tag) => customElements.get(tag))

/** Loads the bundle, then a second copy of it, as a page with two <script> tags does. */
const loadTwice = async (secondVersion: string | undefined) => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  try {
    const { result, escaped } = await withEscapes(() => {
      const first = loadUmd()
      const firstWidgets = first.Widgets
      const firstDefinitions = definitions()
      const Alma = loadUmd({ version: secondVersion })
      return { first, firstWidgets, firstDefinitions, Alma }
    })
    return { ...result, escaped, warnings: warn.mock.calls.map(([message]) => String(message)) }
  } finally {
    warn.mockRestore()
  }
}

// The custom element registry keeps the definitions of the first describe in the second one.
describe.each([
  { name: 'the same version', version: undefined, warnings: 0 },
  { name: 'another version', version: 'contract-test-2', warnings: 1 },
])('a second bundle of $name', ({ version, warnings }) => {
  let loaded: Awaited<ReturnType<typeof loadTwice>>
  beforeAll(async () => {
    loaded = await loadTwice(version)
  })

  // The UMD wrapper runs `Alma = Alma || {}`, so the second bundle overwrites the members.
  it('keeps window.Alma, replaces its members and keeps the first element definitions', () => {
    expect(loaded.escaped).toEqual([])
    expect(loaded.Alma).toBe(loaded.first)
    expect(loaded.Alma.Widgets).not.toBe(loaded.firstWidgets)
    expect(definitions()).toEqual(loaded.firstDefinitions)
    // The React build defines no custom element.
    if (isReferenceBuild) expect(loaded.firstDefinitions).toEqual([undefined, undefined])
    else expect(loaded.firstDefinitions.every((definition) => definition !== undefined)).toBe(true)
  })

  it('logs the warnings of its build', () => {
    // The React build logs none, and the Lit build logs one for another version only.
    expect(loaded.warnings).toHaveLength(isReferenceBuild ? 0 : warnings)
    loaded.warnings.forEach((message) => {
      expect(message).toMatch(/^\[Alma widgets\] /)
      expect(message).toContain(`with version ${CONTRACT_VERSION}.`)
      expect(message).toContain(`This bundle, version ${version},`)
    })
  })

  it('renders PaymentPlans through the current window.Alma', async () => {
    const { result: api, escaped } = await withEscapes(async () => {
      const recorded = mockEligibilityApi({ json: fourPlans })
      addWidget(loaded.Alma, loaded.Alma.Widgets.PaymentPlans)
      await tick(1000)
      return recorded
    })

    expect(escaped).toEqual([])
    expect(`${outlineToText(widgetOutline(container()))}\n`).toBe(
      golden('payment-plans-several-plans'),
    )
    // React sends the request from the second bundle's code. In the Lit build, the element that
    // the first bundle registered sends it, with the first bundle's version.
    const agentVersion = isReferenceBuild ? (version ?? CONTRACT_VERSION) : CONTRACT_VERSION
    expect(api.calls.map(({ headers }) => headers['x-alma-agent'])).toEqual([
      `Alma Widget/${agentVersion}`,
    ])
  })

  it('opens the modal through the current window.Alma', async () => {
    const { escaped } = await withEscapes(async () => {
      mockEligibilityApi({ json: fourPlans })
      ;(addWidget(loaded.Alma, loaded.Alma.Widgets.Modal) as Handle).open()
      await tick(500)
    })

    expect(escaped).toEqual([])
    expect(`${outlineToText(widgetOutline(container()))}\n`).toBe(golden('modal-success-mobile'))
  })
})
