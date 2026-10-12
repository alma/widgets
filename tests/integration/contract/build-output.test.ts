import { statSync } from 'node:fs'

import { JSDOM } from 'jsdom'
import { describe, expect } from 'vitest'

import { it } from './support/contract-test'
import { bundlePath, importEsm, readBundleFile } from './support/load-bundle'

const MEMBERS = ['ApiMode', 'Utils', 'Widgets']

const FILES = [
  'widgets.js',
  'widgets.umd.js',
  'widgets-wc.umd.js',
  'widgets.css',
  'widgets.min.css',
  'widgets.js.map',
  'widgets.umd.js.map',
]

type WindowWithGlobals = Window & Record<string, unknown>

/**
 * Runs a bundle in a window of its own. Unlike loadUmd(), it keeps the test file's window clean, so
 * each loading case starts without `define`, `module` or `Alma`.
 */
const runInFreshWindow = (file: string, globals: Record<string, unknown> = {}) => {
  const { window } = new JSDOM('', { runScripts: 'outside-only' })
  const freshWindow = window as unknown as WindowWithGlobals
  // The bundle reads matchMedia once, when it loads, and jsdom has none.
  freshWindow.matchMedia = () => ({ matches: false }) as never
  Object.assign(freshWindow, globals)
  window.eval(readBundleFile(file))
  return freshWindow
}

describe('files', () => {
  FILES.forEach((file) => {
    it(`ships ${file}, not empty`, () => {
      expect(statSync(bundlePath(file)).size).toBeGreaterThan(0)
    })
  })
})

describe('widgets.umd.js', () => {
  it('sets window.Alma as a classic script', () => {
    const window = runInFreshWindow('widgets.umd.js')
    expect(Object.keys(window.Alma as object).sort()).toEqual(MEMBERS)
  })

  it('calls an anonymous define once with exports under AMD, and leaves window.Alma unset', () => {
    const define = vi.fn()
    const window = runInFreshWindow('widgets.umd.js', {
      define: Object.assign(define, { amd: {} }),
    })

    expect(define).toHaveBeenCalledTimes(1)
    const args = define.mock.calls[0]
    expect(args).toHaveLength(2)
    expect(args[0]).toEqual(['exports'])
    expect(typeof args[1]).toBe('function')
    expect(window.Alma).toBeUndefined()

    const exports = {}
    args[1](exports)
    expect(Object.keys(exports).sort()).toEqual(MEMBERS)
  })

  it('fills module.exports under CommonJS, and leaves window.Alma unset', () => {
    const module = { exports: {} }
    const window = runInFreshWindow('widgets.umd.js', { module, exports: module.exports })
    const { exports } = module
    expect(Object.keys(exports).sort()).toEqual(MEMBERS)
    expect(window.Alma).toBeUndefined()
  })
})

describe('widgets-wc.umd.js', () => {
  it('sets window.Alma as a classic script', () => {
    const window = runInFreshWindow('widgets-wc.umd.js')
    expect(Object.keys(window.Alma as object).sort()).toEqual(MEMBERS)
  })
})

describe('widgets.js', () => {
  it('exports Widgets, Utils and ApiMode', async () => {
    const esm = await importEsm()
    expect(Object.keys(esm).sort()).toEqual(MEMBERS)
  })
})

describe('development build of Lit', () => {
  ;['widgets.js', 'widgets.umd.js', 'widgets-wc.umd.js'].forEach((file) => {
    it(`is not in ${file}`, () => {
      expect(readBundleFile(file)).not.toContain('Lit is in dev mode')
    })
  })
})
