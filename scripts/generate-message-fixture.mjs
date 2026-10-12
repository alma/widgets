// Generates the message and date fixtures that the Lit intl runtime and the date helpers must match.
// They record what master's react-intl and date-fns output, through @formatjs/intl, the core that
// react-intl wraps. scripts/check-fixture-parity.mjs proves that both give the same output.
//
//   npm run fixtures:messages            writes the two files in tests/integration/contract/fixtures/
//   npm run fixtures:messages -- --check exits with code 1 when a fresh run differs from the files
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parse, TYPE } from '@formatjs/icu-messageformat-parser'
import { createIntl, createIntlCache } from '@formatjs/intl'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixturesDir = resolve(root, 'tests/integration/contract/fixtures')
const messagesFile = resolve(fixturesDir, 'messages.output.json')
const datesFile = resolve(fixturesDir, 'dates.json')

// The tag `xx` formats with the process default locale, which Node reads from LC_ALL at startup.
const LC_ALL = 'en_US.UTF-8'
// The `Date.now` of master's src/setupTests.ts.
const FIXED_NOW = 1638350762000
const ZONES = ['UTC', 'Pacific/Kiritimati', 'America/Guadeloupe']
// Midnight of the fixed now's local day in each zone, in seconds.
const DAY_STARTS = {
  UTC: 1638316800,
  'Pacific/Kiritimati': 1638266400,
  'America/Guadeloupe': 1638331200,
}
const SECONDS_IN_DAY = 86400

// The 14 `Locale` values of master's src/types.ts, then the tags that stress the setup.
const TAGS = [
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
  'FR',
  'fr_FR',
  'xx',
]
const CATALOGUE_NAMES = ['en', 'fr', 'es', 'it', 'de', 'pt', 'nl']
const PLURAL_VALUES = [0, 1, 2]
const TEXT_VALUE = (name) => `[${name}]`
const RICH_TEXT_TAGS = ['strong', 'link', 'mail']

const CURRENCY = { style: 'currency', currency: 'EUR' }
const PRECISE_CURRENCY = { minimumFractionDigits: 2, maximumFractionDigits: 2, ...CURRENCY }
const LONG_DATE = { day: 'numeric', month: 'long', year: 'numeric' }

const AMOUNTS = [0, 1.35, 150, 1234.5, 12345.67]
const RATES = [0, 0.0525, 0.172, 0.17205]
const DATES = [1638350762000, 1640995199000, 1640995200000]

const INSTALLMENT = 'src/components/Installments/Installment/index.tsx'
const LEGAL_MENTIONS = 'src/components/Installments/LegalMentions/index.tsx'
const TOTAL_BLOCK = 'src/components/Installments/TotalBlock/index.tsx'
const PLAN_STRINGS = 'src/utils/paymentPlanStrings.tsx'

// Where master's code calls FormattedNumber, FormattedDate, formatNumber and formatDate. The
// generator calls intl.formatNumber and intl.formatDate where React rendered the components,
// because they render the same strings.
const number = (id, file, options, inputs = AMOUNTS) => ({
  id,
  file,
  call: 'formatNumber',
  options,
  inputs,
})
const date = (id, file) => ({ id, file, call: 'formatDate', options: LONG_DATE, inputs: DATES })
const CALL_SITES = [
  number('installment.amount', INSTALLMENT, CURRENCY),
  date('installment.date', INSTALLMENT),
  number('legal-mentions.price', LEGAL_MENTIONS, CURRENCY),
  number('legal-mentions.total-due', LEGAL_MENTIONS, PRECISE_CURRENCY),
  number(
    'legal-mentions.customer-lending-rate',
    LEGAL_MENTIONS,
    { style: 'percent', maximumFractionDigits: 2 },
    RATES,
  ),
  date('legal-mentions.due-date', LEGAL_MENTIONS),
  number('total-block.total', TOTAL_BLOCK, CURRENCY),
  number('total-block.credit-cost', TOTAL_BLOCK, CURRENCY),
  number('total-block.credit-cost-in-message', TOTAL_BLOCK, CURRENCY),
  number(
    'total-block.annual-percentage-rate',
    TOTAL_BLOCK,
    { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 },
    RATES,
  ),
  number('payment-plan-strings.ineligible-max-amount', PLAN_STRINGS, CURRENCY),
  number('payment-plan-strings.ineligible-min-amount', PLAN_STRINGS, CURRENCY),
  number('payment-plan-strings.deferred-total-amount', PLAN_STRINGS, CURRENCY),
  date('payment-plan-strings.deferred-due-date', PLAN_STRINGS),
  number('payment-plan-strings.pay-now-total-amount', PLAN_STRINGS, CURRENCY),
  number('payment-plan-strings.same-amount-total-amount', PLAN_STRINGS, CURRENCY),
  number('payment-plan-strings.first-installment-amount', PLAN_STRINGS, CURRENCY),
  number('payment-plan-strings.others-installment-amount', PLAN_STRINGS, CURRENCY),
]

const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const serialize = (value) => `${JSON.stringify(value, null, 2)}\n`
const describeError = (error) => `${error.name}: ${error.message}`

const intlVersion = readJson('node_modules/@formatjs/intl/package.json').version
const meta = () => ({
  formatjsIntl: intlVersion,
  node: process.version,
  icu: process.versions.icu,
  cldr: process.versions.cldr,
  TZ: process.env.TZ,
  LC_ALL: process.env.LC_ALL,
})

// Master's src/intl/utils.ts: the first two letters pick the catalogue, case-sensitive, and `en`
// is the fallback, so `FR` gets the `en` catalogue.
const catalogueNameFor = (tag) => {
  const prefix = tag.slice(0, 2)
  return CATALOGUE_NAMES.includes(prefix) ? prefix : 'en'
}

// Finds the arguments of an ICU message: those that plural, selectordinal and number elements read
// take 0, 1 and 2, the others take a string, and each rich-text tag is a function.
const analyse = (message, into) => {
  const walk = (elements) => {
    elements.forEach((element) => {
      switch (element.type) {
        case TYPE.number:
        case TYPE.plural:
          into.numeric.add(element.value)
          break
        case TYPE.date:
        case TYPE.time:
          throw new Error(`No fixture rule for the date or time argument "${element.value}"`)
        case TYPE.argument:
        case TYPE.select:
          into.text.add(element.value)
          break
        case TYPE.tag:
          into.tags.add(element.value)
          break
        default:
      }
      if (element.options) {
        Object.values(element.options).forEach((option) => walk(option.value))
      }
      if (element.children) walk(element.children)
    })
  }
  walk(parse(message))
}

const loadMessages = () => {
  const source = readJson('src/intl/messages.json')
  const catalogues = Object.fromEntries(
    CATALOGUE_NAMES.map((name) => [name, readJson(`src/intl/messages/messages.${name}.json`)]),
  )
  // The union over the source and the catalogues, so that a translation that uses another
  // argument still gets a value.
  const messages = Object.fromEntries(
    Object.entries(source).map(([id, defaultMessage]) => {
      const found = { numeric: new Set(), text: new Set(), tags: new Set() }
      ;[defaultMessage, ...CATALOGUE_NAMES.map((name) => catalogues[name][id])].forEach((text) => {
        if (text !== undefined) analyse(text, found)
      })
      const numericArguments = [...found.numeric].sort()
      const unknownTags = [...found.tags].filter((tag) => !RICH_TEXT_TAGS.includes(tag))
      if (unknownTags.length) throw new Error(`${id} has the unknown tags ${unknownTags}`)
      return [
        id,
        {
          defaultMessage,
          numericArguments,
          textArguments: [...found.text].filter((name) => !found.numeric.has(name)).sort(),
          tags: [...found.tags].sort(),
        },
      ]
    }),
  )
  return { catalogues, messages }
}

const valuesOf = (spec, numericValue) => ({
  ...Object.fromEntries(spec.textArguments.map((name) => [name, TEXT_VALUE(name)])),
  ...Object.fromEntries(spec.numericArguments.map((name) => [name, numericValue])),
  ...Object.fromEntries(
    spec.tags.map((tag) => [tag, (chunks) => `<${tag}>${chunks.join('')}</${tag}>`]),
  ),
})

// A rich-text message can return an array of parts. Each output is one string.
const asString = (output) => (Array.isArray(output) ? output.join('') : output)

const attempt = (fn) => {
  try {
    return fn()
  } catch (error) {
    return { throws: describeError(error) }
  }
}

const formatTag = (tag, { catalogues, messages }) => {
  const catalogue = catalogueNameFor(tag)
  const errorCodes = new Set()
  let intl
  try {
    intl = createIntl(
      {
        locale: tag,
        defaultLocale: 'en',
        messages: catalogues[catalogue],
        onError: (error) => errorCodes.add(error.code),
      },
      createIntlCache(),
    )
  } catch (error) {
    return { catalogue, errorCodes: [...errorCodes], throws: describeError(error) }
  }

  const outputs = Object.fromEntries(
    Object.entries(messages).map(([id, spec]) => {
      const format = (numericValue) =>
        attempt(() =>
          asString(
            intl.formatMessage(
              { id, defaultMessage: spec.defaultMessage },
              valuesOf(spec, numericValue),
            ),
          ),
        )
      return [
        id,
        spec.numericArguments.length
          ? Object.fromEntries(PLURAL_VALUES.map((value) => [value, format(value)]))
          : format(),
      ]
    }),
  )
  const callSites = Object.fromEntries(
    CALL_SITES.map((site) => [
      site.id,
      Object.fromEntries(
        site.inputs.map((input) => [input, attempt(() => intl[site.call](input, site.options))]),
      ),
    ]),
  )
  return { catalogue, errorCodes: [...errorCodes], messages: outputs, callSites }
}

const buildMessagesFixture = () => {
  const loaded = loadMessages()
  return {
    meta: meta(),
    inputs: {
      pluralValues: PLURAL_VALUES,
      textValue: 'The string "[name]", with the name of the argument',
      richTextTag: 'The text of a tag between <tag> and </tag>',
      messages: loaded.messages,
      callSites: CALL_SITES,
    },
    locales: Object.fromEntries(TAGS.map((tag) => [tag, formatTag(tag, loaded)])),
  }
}

const sameLocalDay = (a, b) => {
  const first = new Date(a)
  const second = new Date(b)
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

// The due dates in seconds: the fixed now, then the start and the end of its local day in each
// zone, each also one second earlier. The end is the start of the next day.
const dueDates = () => [
  FIXED_NOW / 1000,
  ...ZONES.flatMap((zone) => {
    const start = DAY_STARTS[zone]
    const end = start + SECONDS_IN_DAY
    return [start - 1, start, end - 1, end]
  }),
]

// Runs in a child process started with TZ=<zone>, because Node reads TZ once per process.
const datesOfZone = (zone) => {
  const start = DAY_STARTS[zone]
  const localMidnight = new Date(start * 1000)
  if (
    [localMidnight.getHours(), localMidnight.getMinutes(), localMidnight.getSeconds()].some(Boolean)
  ) {
    throw new Error(`${start} is not a local midnight in ${zone}`)
  }
  const intls = Object.fromEntries(
    ['fr', 'en'].map((locale) => [locale, createIntl({ locale, defaultLocale: 'en' })]),
  )
  return Object.fromEntries(
    dueDates().map((due) => [
      due,
      {
        isToday: sameLocalDay(due * 1000, FIXED_NOW),
        fr: intls.fr.formatDate(due * 1000, LONG_DATE),
        en: intls.en.formatDate(due * 1000, LONG_DATE),
      },
    ]),
  )
}

const buildDatesFixture = () => ({
  meta: {
    formatjsIntl: intlVersion,
    node: process.version,
    icu: process.versions.icu,
    cldr: process.versions.cldr,
    LC_ALL: process.env.LC_ALL,
  },
  now: FIXED_NOW,
  dueDates: dueDates(),
  formatOptions: LONG_DATE,
  zones: Object.fromEntries(
    ZONES.map((zone) => {
      const child = spawnSync(
        process.execPath,
        [fileURLToPath(import.meta.url), `--zone=${zone}`],
        {
          encoding: 'utf8',
          env: { ...process.env, TZ: zone, LC_ALL },
        },
      )
      if (child.status !== 0) throw new Error(`The ${zone} child failed:\n${child.stderr}`)
      return [zone, JSON.parse(child.stdout)]
    }),
  ),
})

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

if (zoneArgument) {
  process.stdout.write(JSON.stringify(datesOfZone(zoneArgument)))
} else {
  const generated = [
    [messagesFile, serialize(buildMessagesFixture())],
    [datesFile, serialize(buildDatesFixture())],
  ]
  if (process.argv.includes('--check')) {
    const stale = generated.filter(([file, content]) => {
      try {
        return readFileSync(file, 'utf8') !== content
      } catch {
        return true
      }
    })
    if (stale.length) {
      console.error(
        `Out of date: ${stale.map(([file]) => file.replace(`${root}/`, '')).join(', ')}.\n` +
          'Run `npm run fixtures:messages` and commit the result.',
      )
      process.exit(1)
    }
    console.log('The message and date fixtures are up to date')
  } else {
    generated.forEach(([file, content]) => writeFileSync(file, content))
    console.log(`Wrote ${generated.map(([file]) => file.replace(`${root}/`, '')).join(' and ')}`)
  }
}
