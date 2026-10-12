// Proves that the message and date fixtures match what master's react-intl and date-fns give. It
// loads both libraries from .ref-worktree/node_modules (run `npm run build:ref` first), runs the
// inputs recorded in the fixtures through them and exits with code 1 on any difference.
// Run it by hand, not in CI, once for each change of scripts/generate-message-fixture.mjs.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixturesDir = resolve(root, 'tests/integration/contract/fixtures')
const refModules = resolve(root, '.ref-worktree/node_modules')

const LC_ALL = 'en_US.UTF-8'
const SECONDS_IN_MILLISECONDS = 1000

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const describeError = (error) => `${error.name}: ${error.message}`
const asString = (output) => (Array.isArray(output) ? output.join('') : output)
const attempt = (fn) => {
  try {
    return fn()
  } catch (error) {
    return { throws: describeError(error) }
  }
}

if (!existsSync(refModules)) {
  console.error('.ref-worktree/node_modules is missing. Run `npm run build:ref` first.')
  process.exit(1)
}
const requireRef = createRequire(resolve(refModules, 'package.json'))
const datesFixture = readJson(resolve(fixturesDir, 'dates.json'))

const zoneArgument = process.argv.find((argument) => argument.startsWith('--zone='))?.slice(7)

// Node reads TZ and LC_ALL at startup, so a process that doesn't have them starts itself again.
const expectedTz = zoneArgument ?? 'UTC'
if (process.env.TZ !== expectedTz || process.env.LC_ALL !== LC_ALL) {
  const again = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit',
    env: { ...process.env, TZ: expectedTz, LC_ALL },
  })
  process.exit(again.status ?? 1)
}

// Master's `isToday` reads the clock through Date.now, which its tests fix.
const realNow = Date.now
Date.now = () => datesFixture.now
const { isToday } = requireRef('date-fns')
const { createIntl, createIntlCache } = requireRef('react-intl')

const datesOfZone = () => {
  const intls = Object.fromEntries(
    ['fr', 'en'].map((locale) => [locale, createIntl({ locale, defaultLocale: 'en' })]),
  )
  return Object.fromEntries(
    datesFixture.dueDates.map((due) => {
      const milliseconds = due * SECONDS_IN_MILLISECONDS
      return [
        due,
        {
          isToday: isToday(milliseconds),
          fr: intls.fr.formatDate(milliseconds, datesFixture.formatOptions),
          en: intls.en.formatDate(milliseconds, datesFixture.formatOptions),
        },
      ]
    }),
  )
}

if (zoneArgument) {
  process.stdout.write(JSON.stringify(datesOfZone()))
  process.exit(0)
}
Date.now = realNow

const messagesFixture = readJson(resolve(fixturesDir, 'messages.output.json'))
const { inputs } = messagesFixture
const differences = []
const compare = (path, expected, actual) => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    differences.push(
      `${path}\n    fixture:  ${JSON.stringify(expected)}\n    react-intl or date-fns: ${JSON.stringify(actual)}`,
    )
  }
}

const valuesOf = (spec, numericValue) => ({
  ...Object.fromEntries(spec.textArguments.map((name) => [name, `[${name}]`])),
  ...Object.fromEntries(spec.numericArguments.map((name) => [name, numericValue])),
  ...Object.fromEntries(
    spec.tags.map((tag) => [tag, (chunks) => `<${tag}>${chunks.join('')}</${tag}>`]),
  ),
})

let outputCount = 0
Object.entries(messagesFixture.locales).forEach(([tag, expected]) => {
  const errorCodes = new Set()
  let intl
  try {
    intl = createIntl(
      {
        locale: tag,
        defaultLocale: 'en',
        messages: readJson(resolve(root, `src/intl/messages/messages.${expected.catalogue}.json`)),
        onError: (error) => errorCodes.add(error.code),
      },
      createIntlCache(),
    )
  } catch (error) {
    compare(`${tag}: throws`, expected.throws, describeError(error))
    return
  }
  compare(`${tag}: throws`, expected.throws, undefined)

  Object.entries(inputs.messages).forEach(([id, spec]) => {
    const format = (numericValue) =>
      attempt(() =>
        asString(
          intl.formatMessage(
            { id, defaultMessage: spec.defaultMessage },
            valuesOf(spec, numericValue),
          ),
        ),
      )
    const actual = spec.numericArguments.length
      ? Object.fromEntries(inputs.pluralValues.map((value) => [value, format(value)]))
      : format()
    outputCount += spec.numericArguments.length ? inputs.pluralValues.length : 1
    compare(`${tag}: ${id}`, expected.messages[id], actual)
  })

  inputs.callSites.forEach((site) => {
    const actual = Object.fromEntries(
      site.inputs.map((input) => [input, attempt(() => intl[site.call](input, site.options))]),
    )
    outputCount += site.inputs.length
    compare(`${tag}: ${site.id}`, expected.callSites[site.id], actual)
  })
  compare(`${tag}: error codes`, expected.errorCodes, [...errorCodes])
})

Object.entries(datesFixture.zones).forEach(([zone, expected]) => {
  const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), `--zone=${zone}`], {
    encoding: 'utf8',
    env: { ...process.env, TZ: zone, LC_ALL },
  })
  if (child.status !== 0) {
    differences.push(`${zone}: the child process failed\n${child.stderr}`)
    return
  }
  const actual = JSON.parse(child.stdout)
  outputCount += Object.keys(actual).length
  Object.keys(expected).forEach((due) => compare(`${zone}: ${due}`, expected[due], actual[due]))
})

const versions = {
  'react-intl': requireRef('react-intl/package.json').version,
  'date-fns': requireRef('date-fns/package.json').version,
}
console.log(`react-intl ${versions['react-intl']}, date-fns ${versions['date-fns']}`)
if (differences.length) {
  console.error(`${differences.length} difference(s):\n\n${differences.join('\n\n')}`)
  process.exit(1)
}
console.log(
  `No difference: ${outputCount} outputs of ${Object.keys(messagesFixture.locales).length} tags and ` +
    `${Object.keys(datesFixture.zones).length} time zones match the fixtures`,
)
