import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import postcss from 'postcss'
import type { AtRule, ChildNode, Rule } from 'postcss'
import { afterEach, beforeAll, beforeEach, describe, expect } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import type { EligibilityReply } from './support/api-mock'
import { it } from './support/contract-test'
import { loadUmd, readBundleFile } from './support/load-bundle'
import { addWidget, closeButton, container, planButtons, tick, useFakeClock } from './support/page'
import { DESKTOP_WIDTH, MOBILE_WIDTH, setViewportWidth } from './support/viewport'

// The order of the CSS modules in widgets.css only decides a tie: two rules of two modules that
// match one element with the same specificity and set the same property. This test renders the
// widget and the modal in their states and finds such ties. With none, the module order can't
// change what the page shows, so css-output.test.ts compares the rules module by module.

const fixture = (name: string) =>
  JSON.parse(readFileSync(resolve(__dirname, `fixtures/eligibility/${name}.json`), 'utf8'))

const fourPlans = fixture('eligible-4x-2x-10x-credit-3x')
const onePlan = fixture('eligible-3x')
const notEligible = fixture('ineligible-amount-2x-3x-4x')
const planKinds = fixture('pay-now-deferred-15-days-30-days-1-month-2x-3x-4x-10x-credit')

const plan = (installmentsCount: number, extra: Record<string, number> = {}) => ({
  installmentsCount,
  minAmount: 100,
  maxAmount: 200000,
  ...extra,
})

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

// ---- rules of widgets.css -------------------------------------------------------------------

// Vite names a CSS-module class `_<local name>_<hash of the module file>_<line>`.
const MODULE_HASH = /(?<![\w-])_[A-Za-z]\w*?_([0-9a-z]{5,6})_\d+(?![\w-])/

// They depend on the pointer or the focus, so a rule with one could apply to any element.
const STATE_PSEUDO_CLASSES = /:(hover|focus-visible|focus|active)(?![\w-])/g
const PSEUDO_ELEMENTS = /::?(before|after|placeholder|selection|marker)(?![\w-])/g

type Entry = {
  module: string
  selector: string
  // [ids, classes, types]
  specificity: [number, number, number]
  pseudoElement: string
  media: string[]
  declarations: Array<{ property: string; important: boolean }>
}

const specificityOf = (selector: string): Entry['specificity'] => {
  let rest = selector
  const count = (pattern: RegExp) => {
    const found = rest.match(pattern)?.length ?? 0
    rest = rest.replace(pattern, ' ')
    return found
  }
  const elements = count(PSEUDO_ELEMENTS)
  const ids = count(/#[\w-]+/g)
  const classes = count(/\.[\w-]+|\[[^\]]*\]|:[\w-]+(\([^)]*\))?/g)
  const types = elements + (rest.match(/(?<![\w-])[a-z][\w-]*/gi)?.length ?? 0)
  return [ids, classes, types]
}

const entriesOf = (css: string): Entry[] => {
  const entries: Entry[] = []
  const walk = (nodes: ChildNode[], media: string[], parents: string[]) => {
    nodes.forEach((node) => {
      if (node.type === 'atrule') {
        const atRule = node as AtRule
        // Keyframes and @font-face hold no selector of an element.
        if (atRule.name === 'media') walk(atRule.nodes ?? [], [...media, atRule.params], parents)
        return
      }
      if (node.type !== 'rule') return
      const rule = node as Rule
      const selectors = rule.selectors.flatMap((selector) =>
        parents.length === 0 ? [selector] : parents.map((parent) => selector.replace(/&/g, parent)),
      )
      const declarations = (rule.nodes ?? [])
        .filter((child) => child.type === 'decl')
        .map((child) => ({
          property: (child as postcss.Declaration).prop,
          important: (child as postcss.Declaration).important,
        }))
        .filter(({ property }) => !property.startsWith('--'))
      selectors.forEach((selector) => {
        const module = MODULE_HASH.exec(selector)?.[1]
        // main.css comes first on both builds, so only the module rules can move.
        if (!module || declarations.length === 0) return
        entries.push({
          module,
          selector,
          specificity: specificityOf(selector),
          pseudoElement: selector.match(PSEUDO_ELEMENTS)?.join('') ?? '',
          media,
          declarations,
        })
      })
      walk(rule.nodes ?? [], media, selectors)
    })
  }
  walk(postcss.parse(css).nodes, [], [])
  return entries
}

// The state pseudo-classes and the pseudo-elements come out, so the rule counts as matching
// whenever its element matches.
const matcherOf = (selector: string) =>
  selector.replace(PSEUDO_ELEMENTS, '').replace(STATE_PSEUDO_CLASSES, '')

// The jsdom page has no width, so min-width follows the width of the case. A motion preference may
// hold at any width.
const mediaApplies = (media: string[], width: number) =>
  media.every((query) => {
    const min = /\(min-width:\s*(\d+)px\)/.exec(query)
    const max = /\(max-width:\s*(\d+)px\)/.exec(query)
    return (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]))
  })

const overlap = (a: string, b: string) => a === b || a.startsWith(`${b}-`) || b.startsWith(`${a}-`)

const sameSpecificity = (a: Entry, b: Entry) =>
  a.specificity.every((value, index) => value === b.specificity[index])

/** One line per tie: the two selectors and the property they both set. */
const tiesOn = (entries: Entry[], width: number): string[] => {
  const ties = new Set<string>()
  const roots = [container(), document.querySelector('.ReactModalPortal')].filter(
    (root): root is HTMLElement => root !== null,
  )
  const elements = roots.flatMap((root) => [root, ...Array.from(root.querySelectorAll('*'))])
  const applying = entries.filter((entry) => mediaApplies(entry.media, width))
  elements.forEach((element) => {
    const matching = applying.filter((entry) => element.matches(matcherOf(entry.selector)))
    matching.forEach((a, index) => {
      matching.slice(index + 1).forEach((b) => {
        if (a.module === b.module || a.pseudoElement !== b.pseudoElement) return
        if (!sameSpecificity(a, b)) return
        a.declarations.forEach((first) => {
          b.declarations.forEach((second) => {
            if (first.important !== second.important) return
            if (!overlap(first.property, second.property)) return
            const pair = [a.selector, b.selector].sort().join(' | ')
            ties.add(`${pair} | ${first.property}, ${second.property}`)
          })
        })
      })
    })
  })
  return Array.from(ties)
}

// ---- states ---------------------------------------------------------------------------------

let Alma: ReturnType<typeof loadUmd>
let entries: Entry[]
beforeAll(() => {
  Alma = loadUmd()
  entries = entriesOf(readBundleFile('widgets.css'))
})

useFakeClock()

beforeEach(() => {
  vi.stubGlobal('scroll', () => {})
})

afterEach(async () => {
  ;(closeButton() as HTMLElement | null)?.click()
  await tick(1000)
})

const renderPlans = async (reply: EligibilityReply, options: Record<string, unknown> = {}) => {
  mockEligibilityApi(reply)
  addWidget(Alma, Alma.Widgets.PaymentPlans, options)
  await tick(1000)
}

const modalPlanButtons = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>('.alma-eligibility-modal-eligibility-options button'),
  )

const WIDTHS = [
  { name: 'desktop', width: DESKTOP_WIDTH },
  { name: 'mobile', width: MOBILE_WIDTH },
] as const

describe.each(WIDTHS)('rules of two CSS modules at $name width', ({ width }) => {
  beforeEach(() => {
    setViewportWidth(width)
  })

  it('reads rules from more than one module', () => {
    expect(new Set(entries.map(({ module }) => module)).size).toBeGreaterThan(1)
  })

  // A check that finds nothing has to show that it would find a tie.
  it('finds a tie between two modules, and none when the specificity differs', () => {
    document.body.innerHTML =
      '<div id="alma-widget"><p class="_a_aaaaa_1 _b_bbbbb_1"><span class="_c_ccccc_1"></span></p></div>'
    const css = (second: string) => `._a_aaaaa_1 { margin: 0 } ${second}`

    expect(tiesOn(entriesOf(css('._b_bbbbb_1 { margin-top: 1px }')), width)).toEqual([
      '._a_aaaaa_1 | ._b_bbbbb_1 | margin, margin-top',
    ])
    expect(tiesOn(entriesOf(css('._b_bbbbb_1:hover { margin-top: 1px }')), width)).toEqual([])
    expect(tiesOn(entriesOf(css('p._b_bbbbb_1 { margin-top: 1px }')), width)).toEqual([])
  })

  it('never tie on an element of the widget', async () => {
    const ties: string[] = []
    const replies: EligibilityReply[] = [
      { pending: true },
      { json: fourPlans },
      { json: onePlan },
      { json: notEligible },
    ]
    for (const reply of replies) {
      // eslint-disable-next-line no-await-in-loop
      await renderPlans(reply)
      ties.push(...tiesOn(entries, width))
    }
    expect([...new Set(ties)]).toEqual([])
  })

  it('never tie on an element of the modal, with each plan selected in turn', async () => {
    const ties: string[] = []
    await renderPlans({ json: planKinds }, { plans: planKindsConfig })
    planButtons()[0].click()
    await tick(500)
    ties.push(...tiesOn(entries, width))
    const count = modalPlanButtons().length
    for (let index = 1; index < count; index += 1) {
      modalPlanButtons()[index].click()
      // eslint-disable-next-line no-await-in-loop
      await tick(500)
      ties.push(...tiesOn(entries, width))
    }
    expect([...new Set(ties)]).toEqual([])
  })

  it('never tie on an element of the standalone modal in each state', async () => {
    const ties: string[] = []
    const replies: EligibilityReply[] = [
      { pending: true },
      { json: fourPlans },
      { json: notEligible },
      { networkError: true },
    ]
    for (const reply of replies) {
      mockEligibilityApi(reply)
      const handle = addWidget(Alma, Alma.Widgets.Modal, {
        plans: [plan(2), plan(3), plan(4), plan(10)],
      }) as { open: () => void }
      handle.open()
      // eslint-disable-next-line no-await-in-loop
      await tick(500)
      ties.push(...tiesOn(entries, width))
      ;(closeButton() as HTMLElement | null)?.click()
      // eslint-disable-next-line no-await-in-loop
      await tick(1000)
    }
    expect([...new Set(ties)]).toEqual([])
  })
})
