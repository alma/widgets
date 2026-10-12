import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeAll, beforeEach, describe, expect } from 'vitest'

import { type EligibilityReply, mockEligibilityApi } from './support/api-mock'
import { cacheKey } from './support/cache-key'
import { it } from './support/contract-test'
import { containerChildren } from './support/dom'
import { collectEscapes, expectNoMoreEscaped } from './support/escaped-errors'
import { loadUmd } from './support/load-bundle'
import { addWidget, MERCHANT_ID, tick, useFakeClock } from './support/page'

const fixture = (name: string) =>
  JSON.parse(readFileSync(resolve(__dirname, `fixtures/eligibility/${name}.json`), 'utf8'))

const threePlans = fixture('eligible-2x-3x-4x')

let Alma: ReturnType<typeof loadUmd>
beforeAll(() => {
  Alma = loadUmd()
})

useFakeClock()

const realSessionStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')

beforeEach(() => {
  vi.stubGlobal('scroll', () => {})
})

// setup.ts clears sessionStorage after each test, and a throwing getter would make it fail.
afterEach(() => {
  if (realSessionStorage) Object.defineProperty(globalThis, 'sessionStorage', realSessionStorage)
  vi.restoreAllMocks()
})

const keyFor = (purchaseAmount: number | string = 45000) =>
  cacheKey({
    domain: 'https://api.sandbox.getalma.eu',
    merchantId: MERCHANT_ID,
    purchaseAmount,
  })

type Outcome = {
  requests: number
  bodies: Array<Record<string, unknown>>
  /** The keys of sessionStorage, read once the storage works again. */
  keys: string[]
  /** The type of each escaped error. Messages differ between the builds, so they are never compared. */
  escaped: string[]
  warnings: unknown[][]
  /** Whether the container holds anything. A host element of the Lit build doesn't count. */
  rendered: boolean
  options: number
  text: string
}

type Reply = EligibilityReply | { html: string; status: number }

type Case = {
  reply?: Reply
  options?: Record<string, unknown>
  widget?: 'PaymentPlans' | 'Modal'
  /** Breaks the page before add(). The test restores the storage afterwards. */
  before?: () => void
  /** Runs after add(), with what add() returned. */
  after?: (returned: unknown) => void | Promise<void>
}

const sessionKeys = () =>
  Array.from(
    { length: sessionStorage.length },
    (_, index) => sessionStorage.key(index) ?? '',
  ).sort()

const rawFetch = (calls: Array<Record<string, unknown>>, response: () => Response) =>
  vi.stubGlobal('fetch', (_url: string, init: RequestInit) => {
    calls.push(JSON.parse(String(init.body)))
    return Promise.resolve(response())
  })

/**
 * Adds a widget to a page, lets 5 s pass on the fake clock and reports what is left. A throw from
 * add() or from a timer, a window `error` event and an unhandled rejection all count as escaped.
 */
const observe = async ({
  reply = { json: threePlans },
  options = {},
  widget = 'PaymentPlans',
  before,
  after,
}: Case = {}): Promise<Outcome> => {
  sessionStorage.clear()
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const escapes = collectEscapes()
  const htmlCalls: Array<Record<string, unknown>> = []
  let api: ReturnType<typeof mockEligibilityApi> | undefined
  if ('html' in reply) {
    rawFetch(htmlCalls, () => new Response(reply.html, { status: reply.status }))
  } else {
    api = mockEligibilityApi(reply)
  }

  try {
    before?.()
  } catch (error) {
    // A broken test must not keep Vitest's listeners away.
    await escapes.stop()
    throw error
  }
  let returned: unknown
  try {
    returned = addWidget(Alma, Alma.Widgets[widget], options)
  } catch (error) {
    escapes.record(error)
  }
  try {
    await after?.(returned)
    await tick(5000)
  } catch (error) {
    escapes.record(error)
  }
  const escaped = await escapes.stop()

  // A broken storage has to work again before the test can read it.
  if (realSessionStorage) Object.defineProperty(globalThis, 'sessionStorage', realSessionStorage)
  const target = document.querySelector('#alma-widget') as HTMLElement | null
  const calls = api ? api.calls.map(({ body }) => body as Record<string, unknown>) : htmlCalls
  const outcome: Outcome = {
    requests: calls.length,
    bodies: calls,
    keys: sessionKeys(),
    escaped,
    warnings: warn.mock.calls,
    rendered: target ? containerChildren(target).length > 0 : false,
    options: document.querySelectorAll('[role="option"]').length,
    text: target?.textContent ?? '',
  }
  warn.mockRestore()
  return outcome
}

/** The console rule: at most one warning per case, and it starts with `[Alma widgets]`. Master logs none. */
const expectConsoleRule = ({ warnings }: Outcome) => {
  expect(warnings.length).toBeLessThanOrEqual(1)
  warnings.forEach(([message]) => {
    expect(String(message).startsWith('[Alma widgets]')).toBe(true)
  })
}

/** The case after 5 s on master: nothing in the container, one request, nothing escaped. */
const expectFailedQuietly = (outcome: Outcome, keys: string[] = []) => {
  expect(outcome.rendered).toBe(false)
  expect(outcome.requests).toBe(1)
  expect(outcome.keys).toEqual(keys)
  expectNoMoreEscaped(outcome.escaped, [])
  expectConsoleRule(outcome)
}

/** What both builds share when the Lit build differs on purpose. */
const expectSharedBehaviour = (outcome: Outcome, masterEscaped: string[]) => {
  expect(outcome.options).toBe(0)
  expectNoMoreEscaped(outcome.escaped, masterEscaped)
  expectConsoleRule(outcome)
}

describe('API failures', () => {
  it('shows nothing for a rejected fetch', async () => {
    expectFailedQuietly(await observe({ reply: { networkError: true } }))
  })

  it('shows nothing for a 500 with an HTML body', async () => {
    expectFailedQuietly(
      await observe({
        reply: { html: '<!doctype html><title>Oops</title><p>Bad gateway</p>', status: 500 },
      }),
    )
  })

  it('shows nothing for an error_code body', async () => {
    expectFailedQuietly(
      await observe({ reply: { json: fixture('error-unauthorized'), status: 401 } }),
    )
  })

  it('shows nothing for an errors body', async () => {
    expectFailedQuietly(await observe({ reply: { json: fixture('errors-empty'), status: 400 } }))
  })

  // An empty array is a valid answer, so the cache gets written and nothing shows.
  it('shows nothing for an empty array and caches it', async () => {
    expectFailedQuietly(await observe({ reply: { json: fixture('empty') } }), [keyFor()])
  })

  // Master leaves its loader on the page for a 200 `{}` and leaks a TypeError rejection. The Lit
  // build shows nothing and warns, so only the shared behaviour is pinned.
  it('shows no plan for a 200 with an empty object', async () => {
    expectSharedBehaviour(await observe({ reply: { json: fixture('empty-object') } }), [
      'TypeError',
    ])
  })
})

describe('storage failures', () => {
  const throwingGetter = () =>
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      get() {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      },
    })

  it('shows no plan when the sessionStorage getter throws', async () => {
    expectSharedBehaviour(await observe({ before: throwingGetter }), [
      'SecurityError',
      'SecurityError',
    ])
  })

  it('shows no plan when setItem hits the quota', async () => {
    const outcome = await observe({
      before: () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
        })
      },
    })
    expectSharedBehaviour(outcome, [])
  })

  it('shows no plan for a cache entry that is not JSON', async () => {
    const outcome = await observe({
      before: () => sessionStorage.setItem(keyFor(), '{not json'),
    })
    expectSharedBehaviour(outcome, ['SyntaxError', 'SyntaxError'])
  })
})

describe('option failures', () => {
  const baseline = async () => observe()

  it('renders the English text for the locale xx', async () => {
    const english = await baseline()
    const outcome = await observe({ options: { locale: 'xx' } })

    expect(outcome.options).toBe(3)
    expect(outcome.text).toBe(english.text)
    expect(outcome.requests).toBe(1)
    expect(outcome.keys).toEqual([keyFor()])
    expectNoMoreEscaped(outcome.escaped, [])
    expectConsoleRule(outcome)
  })

  // On master `locale: 'FR'` is not a catalogue, so the text is English, but Intl formats the
  // number for French: `225,00 €` where English gives `€225.00`.
  it('renders English text with a French price for the locale FR', async () => {
    const english = await baseline()
    const outcome = await observe({ options: { locale: 'FR' } })

    expect(outcome.options).toBe(3)
    // The space before the euro sign is a no-break space.
    expect(outcome.text).toMatch(/225,00\s€/)
    expect(outcome.text.replace(/225,00\s€/, '€225.00')).toBe(english.text)
    expectNoMoreEscaped(outcome.escaped, [])
    expectConsoleRule(outcome)
  })

  // Master throws a RangeError, because Intl rejects the underscore. The Lit build warns.
  it('shows no plan for the locale fr_FR', async () => {
    const outcome = await observe({ options: { locale: 'fr_FR' } })
    expectSharedBehaviour(outcome, ['RangeError'])
  })

  // JSON.stringify turns NaN into null, and the cache key spells it `NaN`.
  it('sends a null amount for purchaseAmount NaN', async () => {
    const outcome = await observe({ options: { purchaseAmount: NaN } })

    expect(outcome.requests).toBe(1)
    expect(outcome.bodies[0].purchase_amount).toBeNull()
    expect(outcome.keys).toEqual([keyFor('NaN')])
    expect(outcome.options).toBe(3)
    expectNoMoreEscaped(outcome.escaped, [])
    expectConsoleRule(outcome)
  })

  // Master throws a TypeError on `plans.map`, before it sends a request.
  it('shows no plan when plans is an object', async () => {
    const outcome = await observe({ options: { plans: { installmentsCount: 3 } } })
    expectSharedBehaviour(outcome, ['TypeError'])
  })

  // `document.querySelector('#')` throws a SyntaxError DOMException out of add() on master.
  it('shows no plan when the container is #', async () => {
    const outcome = await observe({ options: { container: '#' } })
    expectSharedBehaviour(outcome, ['SyntaxError'])
  })

  it('shows no plan when the container is #nope', async () => {
    const outcome = await observe({ options: { container: '#nope' } })

    expect(outcome.requests).toBe(0)
    expect(outcome.keys).toEqual([])
    expect(outcome.options).toBe(0)
    expectNoMoreEscaped(outcome.escaped, [])
    expectConsoleRule(outcome)
  })

  it('gives a handle to a Modal on #nope, and open() does nothing', async () => {
    let handle: { open: () => void; close: (event: Event) => void } | undefined
    const outcome = await observe({
      widget: 'Modal',
      options: { container: '#nope' },
      after: (returned) => {
        handle = returned as typeof handle
        handle?.open()
        handle?.close(new Event('click'))
      },
    })

    expect(handle).toEqual({ open: expect.any(Function), close: expect.any(Function) })
    expect(outcome.requests).toBe(0)
    expect(outcome.keys).toEqual([])
    expectNoMoreEscaped(outcome.escaped, [])
    expectConsoleRule(outcome)
  })

  it('shows no modal when the container of a Modal is #', async () => {
    const outcome = await observe({ widget: 'Modal', options: { container: '#' } })
    expectSharedBehaviour(outcome, ['SyntaxError'])
  })
})

describe('the exception check', () => {
  it('accepts fewer escaped errors than master', () => {
    expect(() => expectNoMoreEscaped([], ['TypeError'])).not.toThrow()
    expect(() => expectNoMoreEscaped(['TypeError'], ['TypeError', 'TypeError'])).not.toThrow()
  })

  it('accepts the same escaped errors as master', () => {
    expect(() => expectNoMoreEscaped(['TypeError'], ['TypeError'])).not.toThrow()
  })

  it('fails on more escaped errors than master', () => {
    expect(() => expectNoMoreEscaped(['TypeError'], [])).toThrow()
    expect(() => expectNoMoreEscaped(['TypeError', 'TypeError'], ['TypeError'])).toThrow()
  })

  it('fails on an error type that master does not throw', () => {
    expect(() => expectNoMoreEscaped(['RangeError'], ['TypeError'])).toThrow()
  })
})

describe('the unhandled rejections', () => {
  it('collects an expected rejection, and gives the listeners back to Vitest', async () => {
    const before = process.listeners('unhandledRejection')
    const escapes = collectEscapes()
    expect(process.listeners('unhandledRejection')).toHaveLength(1)

    void Promise.reject(new RangeError('expected'))
    const types = await escapes.stop()

    expect(types).toEqual(['RangeError'])
    expect(process.listeners('unhandledRejection')).toEqual(before)
    expect(before.length).toBeGreaterThan(0)
  })
})
