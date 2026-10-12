import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import postcss from 'postcss'
import type { AtRule, ChildNode, Declaration, Rule } from 'postcss'
import { describe, expect } from 'vitest'

import inventory from './inventory.json'
import { it } from './support/contract-test'
import { readBundleFile } from './support/load-bundle'

const GOLDEN_PATH = resolve(__dirname, 'fixtures/css-output.json')

const FILES = ['widgets.css', 'widgets.min.css'] as const

type CssRule = {
  // The at-rules and the parent rules that wrap the rule, outermost first.
  context: string[]
  selector: string
  // `property: value`, with ` !important` when the declaration has it.
  declarations: string[]
}

// Vite names a CSS-module class and its keyframes `_<local name>_<5 or 6 character hash>_<line>`.
const CSS_MODULE_NAME = /(?<![\w-])_([A-Za-z]\w*?)_[0-9a-z]{5,6}_\d+(?![\w-])/g

const reduceHashes = (text: string) => text.replace(CSS_MODULE_NAME, '_$1')

const squash = (text: string) => text.replace(/\s+/g, ' ').trim()

const selectorOf = (text: string) => squash(reduceHashes(text)).replace(/\s*([>+~,])\s*/g, '$1')

const atRuleLabel = (node: AtRule) => squash(reduceHashes(`@${node.name} ${node.params}`))

const declarationOf = ({ prop, value, important }: Declaration) =>
  `${prop}: ${squash(reduceHashes(value))}${important ? ' !important' : ''}`

const isDeclaration = (node: ChildNode): node is Declaration => node.type === 'decl'

/**
 * The rules of a stylesheet in order: the at-rules around each one, its selector and its
 * declarations. A nested rule comes after the rule that holds it, with that rule in its context.
 */
const rulesOf = (css: string): CssRule[] => {
  const rules: CssRule[] = []
  const walk = (nodes: ChildNode[], context: string[]) => {
    nodes.forEach((node) => {
      if (node.type === 'rule') {
        const rule = node as Rule
        const selector = selectorOf(rule.selector)
        rules.push({
          context,
          selector,
          declarations: rule.nodes.filter(isDeclaration).map(declarationOf),
        })
        walk(rule.nodes, [...context, selector])
      } else if (node.type === 'atrule') {
        const atRule = node as AtRule
        const label = atRuleLabel(atRule)
        const children = atRule.nodes ?? []
        if (children.some(isDeclaration)) {
          // @font-face: declarations directly in the at-rule.
          rules.push({
            context,
            selector: label,
            declarations: children.filter(isDeclaration).map(declarationOf),
          })
        } else {
          walk(children, [...context, label])
        }
      }
    })
  }
  walk(postcss.parse(css).nodes, [])
  return rules
}

/** One rule per line, so that a change to one rule shows as one line in a diff. */
const toGolden = (byFile: Record<string, CssRule[]>) => {
  const files = Object.entries(byFile).map(
    ([file, rules]) =>
      `  ${JSON.stringify(file)}: [\n${rules.map((rule) => `    ${JSON.stringify(rule)}`).join(',\n')}\n  ]`,
  )
  return `{\n${files.join(',\n')}\n}\n`
}

const readGolden = (): Record<string, CssRule[]> => JSON.parse(readFileSync(GOLDEN_PATH, 'utf8'))

const current = () =>
  Object.fromEntries(FILES.map((file) => [file, rulesOf(readBundleFile(file))])) as Record<
    string,
    CssRule[]
  >

describe('widgets.css and widgets.min.css', () => {
  it('match the golden lists of rules', async () => {
    await expect(toGolden(current())).toMatchFileSnapshot(GOLDEN_PATH)
  })

  // A rule that disappears from the build has to change the list.
  it('fail the comparison when a rule is removed from a copy of widgets.css', () => {
    const golden = readGolden()['widgets.css']
    const css = readBundleFile('widgets.css')
    const firstRuleEnd = css.indexOf('}', css.indexOf('@font-face')) + 1
    expect(firstRuleEnd).toBeGreaterThan(0)
    const withoutRule = `${css.slice(0, css.indexOf('@font-face'))}${css.slice(firstRuleEnd)}`
    expect(rulesOf(withoutRule)).not.toEqual(golden)
    expect(rulesOf(css)).toEqual(golden)
  })

  describe.each(FILES)('%s', (file) => {
    it('declares one :root rule with the custom properties of the inventory', () => {
      const roots = rulesOf(readBundleFile(file)).filter(
        ({ context, selector }) => context.length === 0 && selector === ':root',
      )
      expect(roots).toHaveLength(1)
      const names = roots[0].declarations.map((declaration) => declaration.split(':')[0])
      expect(names).toHaveLength(27)
      expect([...names].sort()).toEqual([...inventory.rootCustomProperties].sort())
    })

    // The fonts stay linked from Alma's CDN and Adobe Fonts, as on master.
    it('keeps the @font-face URLs on cdn.almapay.com and use.typekit.net', () => {
      const urls = rulesOf(readBundleFile(file))
        .filter(({ selector }) => selector === '@font-face')
        .flatMap(({ declarations }) => declarations.join(';').match(/url\(([^)]+)\)/g) ?? [])
      expect(urls.length).toBeGreaterThan(0)
      urls.forEach((url) =>
        expect(url).toMatch(/^url\(https:\/\/(cdn\.almapay\.com|use\.typekit\.net)\//),
      )
      expect(urls.some((url) => url.includes('cdn.almapay.com'))).toBe(true)
      expect(urls.some((url) => url.includes('use.typekit.net'))).toBe(true)
    })
  })

  // Vite keeps native CSS nesting in widgets.css: the skip links' focus style sits inside the
  // rule of the skip link. CleanCSS drops that nested rule from widgets.min.css, so the minified
  // file has no style for a focused skip link.
  it('keeps the native nesting of the skip links in widgets.css only', () => {
    const nested = (file: string) =>
      rulesOf(readBundleFile(file)).filter(({ selector }) => selector.startsWith('&'))
    expect(nested('widgets.css').map(({ context, selector }) => [...context, selector])).toEqual([
      ['._skipLink', '&:focus'],
    ])
    expect(nested('widgets.min.css')).toEqual([])
  })
})
