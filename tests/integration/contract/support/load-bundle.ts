import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { JSDOM } from 'jsdom'

const repoRoot = resolve(__dirname, '../../../..')

// The folder of the bundle under test: dist-ref/ (master's React build) or dist/ (the Lit build).
export const distDir = resolve(repoRoot, process.env.WIDGETS_DIST ?? 'dist')

export const isReferenceBuild = distDir.endsWith('dist-ref')

const BUILD_COMMAND = isReferenceBuild ? 'npm run build:ref' : 'npm run build:contract'

// The BUILD_VERSION of both builds, which the X-Alma-Agent header carries.
export const CONTRACT_VERSION = 'contract-test'

export const bundlePath = (file: string): string => {
  const path = resolve(distDir, file)
  if (!existsSync(path)) {
    throw new Error(`${path} does not exist. Run "${BUILD_COMMAND}" first.`)
  }
  return path
}

export const readBundleFile = (file: string): string => readFileSync(bundlePath(file), 'utf8')

type AlmaBundle = {
  Widgets: {
    initialize: (
      merchantId: string,
      mode: string,
    ) => { add: (widget: string, options: Record<string, unknown>) => unknown }
    PaymentPlans: string
    Modal: string
  }
  Utils: Record<string, (...args: number[]) => unknown>
  ApiMode: { LIVE: string; TEST: string }
}

/**
 * Runs widgets.umd.js like a classic <script>. An indirect eval runs the code in the global scope
 * of the test, so the bundle sees the same fetch mock and sessionStorage as the test. A <script>
 * element would run in jsdom's own window object, where the test globals don't exist.
 *
 * With a `version`, it runs the bundle as if built with that BUILD_VERSION.
 */
export const loadUmd = ({ version }: { version?: string } = {}): AlmaBundle => {
  const source = readBundleFile('widgets.umd.js')
  if (version !== undefined && !source.includes(CONTRACT_VERSION)) {
    throw new Error(`widgets.umd.js has no "${CONTRACT_VERSION}" version. Run "${BUILD_COMMAND}".`)
  }
  // eslint-disable-next-line no-eval
  ;(0, eval)(version === undefined ? source : source.replaceAll(CONTRACT_VERSION, () => version))
  return (window as unknown as { Alma: AlmaBundle }).Alma
}

// A new window reads these from the test's window, so the fake clock, the matchMedia stub,
// sessionStorage and the console spies of the test also apply to it.
const SHARED_VALUES = ['Date', 'sessionStorage', 'console']
const SHARED_FUNCTIONS = [
  'scroll',
  'matchMedia',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]

type AnyFunction = (...args: unknown[]) => unknown

/**
 * Runs the scripts, then widgets.umd.js, in a new jsdom window, as a page that loads other
 * libraries before the widget. The window has its own built-ins, so a script that patches them
 * leaves those of the test runner alone.
 */
export const loadUmdInNewWindow = (scriptsBefore: string[]) => {
  const { window } = new JSDOM('', { runScripts: 'outside-only' })
  SHARED_VALUES.forEach((name) => {
    Object.defineProperty(window, name, {
      configurable: true,
      get: () => Reflect.get(globalThis, name),
    })
  })
  // Called on globalThis, because jsdom's own functions throw when called on another window.
  SHARED_FUNCTIONS.forEach((name) => {
    Object.defineProperty(window, name, {
      configurable: true,
      writable: true,
      value: (...args: unknown[]) =>
        Reflect.apply(Reflect.get(globalThis, name) as AnyFunction, globalThis, args),
    })
  })
  // The fetch mock builds its Response in the test's realm. Parsing the body in the page's realm
  // gives the bundle arrays and objects with the page's patched prototypes, as a real page does.
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    writable: true,
    value: async (...args: unknown[]) => {
      const response = (await Reflect.apply(globalThis.fetch, globalThis, args)) as Response
      const json = (window as unknown as { JSON: JSON }).JSON
      response.json = async () => json.parse(await response.text())
      return response
    },
  })
  scriptsBefore.forEach((script) => window.eval(script))
  window.eval(readBundleFile('widgets.umd.js'))
  return { window, Alma: (window as unknown as { Alma: AlmaBundle }).Alma }
}

/** Imports widgets.js, the ES module build. */
export const importEsm = async (): Promise<AlmaBundle> =>
  import(/* @vite-ignore */ pathToFileURL(bundlePath('widgets.js')).href)
