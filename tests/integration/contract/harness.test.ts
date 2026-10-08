import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect } from 'vitest'

import inventory from './inventory.json'
import { mockEligibilityApi } from './support/api-mock'
import { it } from './support/contract-test'
import { containerChildren, domOutline, outlineToText } from './support/dom'
import { importEsm, loadUmd, readBundleFile } from './support/load-bundle'

const contractDir = resolve(__dirname)
const allEligible = JSON.parse(
  readFileSync(resolve(contractDir, 'fixtures/eligibility/all-eligible.json'), 'utf8'),
)

type Bundle = Awaited<ReturnType<typeof importEsm>>

const checkBundle = (getBundle: () => Bundle) => {
  it('exposes Widgets, Utils and ApiMode', () => {
    const bundle = getBundle()
    expect(bundle.Widgets).toBeDefined()
    expect(bundle.Utils).toBeDefined()
    expect(bundle.ApiMode).toBeDefined()
  })

  it('renders a PaymentPlans widget and sends one eligibility request', async () => {
    const { Widgets, ApiMode, ...rest } = getBundle()
    expect(rest.Utils).toBeDefined()
    const api = mockEligibilityApi({ json: allEligible })
    document.body.innerHTML = '<div id="alma-widget"></div>'
    const container = document.querySelector('#alma-widget') as HTMLElement

    Widgets.initialize('merchant_contract_test', ApiMode.TEST).add(Widgets.PaymentPlans, {
      container: '#alma-widget',
      purchaseAmount: 45000,
    })

    await vi.waitFor(() =>
      expect(container.querySelector('[data-testid="widget-container"]')).not.toBeNull(),
    )
    expect(containerChildren(container).length).toBeGreaterThan(0)
    expect(api.calls).toHaveLength(1)
    expect(api.calls[0].url).toBe('https://api.sandbox.getalma.eu/v2/payments/eligibility')
    expect(api.calls[0].method).toBe('POST')
    expect(api.calls[0].headers['x-alma-agent']).toBe('Alma Widget/contract-test')
    expect(api.calls[0].headers.authorization).toBe('Alma-Merchant-Auth merchant_contract_test')
  })
}

describe('UMD bundle', () => {
  let bundle: Bundle
  beforeAll(() => {
    bundle = loadUmd()
  })
  checkBundle(() => bundle)
})

describe('ES module bundle', () => {
  let bundle: Bundle
  beforeAll(async () => {
    bundle = await importEsm()
  })
  checkBundle(() => bundle)
})

describe('inventory', () => {
  const { classes, ids, dataTestIds, rootCustomProperties, locales, catalogues } = inventory

  it('has the counts of master', () => {
    expect(classes.paymentPlans).toHaveLength(7)
    expect(classes.modal).toHaveLength(16)
    expect([...classes.paymentPlans, ...classes.modal]).toHaveLength(23)
    expect(ids.contract).toHaveLength(4)
    expect(dataTestIds).toHaveLength(13)
    expect(rootCustomProperties).toHaveLength(27)
    expect(locales).toHaveLength(14)
    expect(catalogues).toHaveLength(7)
  })

  it('declares every root custom property in widgets.css', () => {
    const css = readBundleFile('widgets.css')
    const missing = rootCustomProperties.filter((name) => !new RegExp(`${name}\\s*:`).test(css))
    expect(missing).toEqual([])
  })
})

describe('expected failures', () => {
  const failures: Record<string, string> = JSON.parse(
    readFileSync(resolve(contractDir, 'expected-failures.json'), 'utf8'),
  )

  it('is sorted by key', () => {
    const keys = Object.keys(failures)
    expect(keys).toEqual([...keys].sort())
  })

  it('names an existing test file and a ticket for each entry', () => {
    Object.entries(failures).forEach(([key, ticket]) => {
      expect(existsSync(resolve(contractDir, key.split(' > ')[0])), key).toBe(true)
      expect(ticket, key).toMatch(/^LIT-\d+$/)
    })
  })

  it('has fixtures that parse', () => {
    const dir = resolve(contractDir, 'fixtures/eligibility')
    readdirSync(dir).forEach((file) => {
      expect(() => JSON.parse(readFileSync(resolve(dir, file), 'utf8')), file).not.toThrow()
    })
  })
})

describe('DOM outline', () => {
  const build = (html: string) => {
    const root = document.createElement('div')
    root.innerHTML = html
    return root
  }

  it('looks through host elements and skips text and comments', () => {
    const plain = build('<p class="a">text<!-- c --></p>')
    const hosted = build(
      '<alma-payment-plans><!----><p class="a">text<!-- c --></p></alma-payment-plans>',
    )
    expect(domOutline(hosted)).toEqual(domOutline(plain))
    expect(domOutline(plain)).toEqual([
      { tag: 'div', depth: 0, attributes: [] },
      { tag: 'p', depth: 1, attributes: [['class', 'a']] },
    ])
    expect(containerChildren(hosted).map((el) => el.localName)).toEqual(['p'])
  })

  it('sorts attributes, reduces CSS-module classes and keeps other tokens', () => {
    const root = build(
      '<span id="x" class="_title_145uq_102 alma-title undefined" aria-label="y"></span>',
    )
    expect(outlineToText(domOutline(root))).toBe(
      '<div>\n  <span aria-label="y" class="alma-title title undefined" id="x">',
    )
  })

  it('skips the children of an svg', () => {
    const root = build('<svg><g><path/></g></svg><b></b>')
    expect(domOutline(root).map((entry) => entry.tag)).toEqual(['div', 'svg', 'b'])
  })
})
