import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

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

/** Imports widgets.js, the ES module build. */
export const importEsm = async (): Promise<AlmaBundle> =>
  import(/* @vite-ignore */ pathToFileURL(bundlePath('widgets.js')).href)
