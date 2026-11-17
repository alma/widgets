// Installs the npm tarball of @alma/widgets in a temp copy of this project, bundles it with
// webpack and Babel, then checks that the page renders the plans in Chromium.
// Needs a built dist/ (npm run build) and Chromium (npm run test:browser:install).
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, lstatSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '../../..')
const eligibility = readFileSync(
  join(repo, 'tests/integration/contract/fixtures/eligibility/all-eligible.json'),
)
const ELIGIBILITY_URL = 'https://api.sandbox.getalma.eu/v2/payments/eligibility'
// A fake origin, so the page and the API are cross-origin as on a merchant site.
const ORIGIN = 'http://consumer.test'
const SELECTOR = '#alma-widget-payment-plans-main-container [role="option"]'
const CONTENT_TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }

const run = (command, args, cwd) =>
  execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })

if (!existsSync(join(repo, 'dist/widgets.js'))) {
  throw new Error('dist/ is missing: run `npm run build` first.')
}

const work = mkdtempSync(join(tmpdir(), 'alma-consumer-webpack-'))
try {
  for (const file of ['package.json', 'package-lock.json', 'webpack.config.js', 'index.html']) {
    cpSync(join(here, file), join(work, file))
  }
  cpSync(join(here, 'src'), join(work, 'src'), { recursive: true })

  // --ignore-scripts skips `prepare`, which installs the git hooks.
  const [{ filename }] = JSON.parse(
    run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', work], repo),
  )
  run('npm', ['ci', '--no-audit', '--no-fund'], work)
  // --no-save keeps the lockfile free of the tarball's hash, which changes with every build.
  const install = ['install', '--no-save', '--ignore-scripts', '--no-audit', '--no-fund']
  run('npm', [...install, join(work, filename)], work)
  if (lstatSync(join(work, 'node_modules/@alma/widgets')).isSymbolicLink()) {
    throw new Error('@alma/widgets is a link, not the installed tarball.')
  }
  run('npm', ['run', 'build'], work)

  const errors = []
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    page.on('pageerror', (error) => errors.push(`page error: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console error: ${message.text()}`)
    })

    await page.route('**/*', async (route) => {
      const request = route.request()
      const url = request.url()
      if (url.startsWith(`${ORIGIN}/`)) {
        const file = join(work, new URL(url).pathname)
        if (!file.startsWith(work) || !existsSync(file)) return route.fulfill({ status: 404 })
        return route.fulfill({
          body: readFileSync(file),
          contentType: CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
        })
      }
      if (url === ELIGIBILITY_URL) {
        const cors = {
          'Access-Control-Allow-Origin': ORIGIN,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': '*',
        }
        if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
        return route.fulfill({ body: eligibility, contentType: 'application/json', headers: cors })
      }
      // widgets.css loads the Venn fonts from Alma's CDN. The check needs no network.
      if (url.startsWith('https://cdn.almapay.com/fonts/')) {
        return route.fulfill({ status: 204 })
      }
      errors.push(`unexpected request: ${request.method()} ${url}`)
      return route.abort()
    })

    await page.goto(`${ORIGIN}/index.html`)
    try {
      await page.locator(SELECTOR).first().waitFor({ timeout: 10_000 })
    } catch (error) {
      throw new Error([error.message, ...errors].join('\n'))
    }
    const options = await page.locator(SELECTOR).count()
    // Errors can come after the first render: let the requests settle and the plans cycle once,
    // past the default transitionDelay of 5500 ms.
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(6000)
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`webpack-babel: ${options} plan options rendered, no errors.`)
  } finally {
    await browser.close()
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
