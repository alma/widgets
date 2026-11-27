import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { type EligibilityReply, mockEligibilityApi } from './support/api-mock'
import { containerChildren, deepQueryAll } from './support/dom'
import { collectEscapes } from './support/escaped-errors'
import { loadUmd } from './support/load-bundle'
import { addWidget, tick, useFakeClock } from './support/page'

const threePlans = JSON.parse(
  readFileSync(resolve(__dirname, 'fixtures/eligibility/eligible-2x-3x-4x.json'), 'utf8'),
)

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

type Outcome = {
  requests: number
  /** The keys of sessionStorage, read once the storage works again. */
  keys: string[]
  /** The type of each escaped error. */
  escaped: string[]
  warnings: unknown[][]
  /** Whether the container holds anything. A host element doesn't count. */
  rendered: boolean
  options: number
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

const rawFetch = (calls: unknown[], response: () => Response) =>
  vi.stubGlobal('fetch', (_url: string, init: RequestInit) => {
    calls.push(init.body)
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
  const htmlCalls: unknown[] = []
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
  const outcome: Outcome = {
    requests: api ? api.calls.length : htmlCalls.length,
    keys: sessionKeys(),
    escaped,
    warnings: warn.mock.calls,
    rendered: target ? containerChildren(target).length > 0 : false,
    options: deepQueryAll(document, '[role="option"]').length,
  }
  warn.mockRestore()
  return outcome
}

/**
 * No error reaches the page, and the console gets at most one warning, prefixed
 * `[Alma widgets]`.
 */
const expectNoEscape = ({ escaped, warnings }: Outcome) => {
  expect(escaped).toEqual([])
  expect(warnings.length).toBeLessThanOrEqual(1)
  warnings.forEach(([message]) => {
    expect(String(message).startsWith('[Alma widgets]')).toBe(true)
  })
}

/** After 5 s: nothing in the container, one request, nothing cached and nothing escaped. */
const expectFailedQuietly = (outcome: Outcome) => {
  expect(outcome.rendered).toBe(false)
  expect(outcome.requests).toBe(1)
  expect(outcome.keys).toEqual([])
  expectNoEscape(outcome)
}

// Every other case checks that something is missing, so this one shows that observe() sees plans.
describe('a working page', () => {
  it('renders the three plans and caches the reply', async () => {
    const outcome = await observe()

    expect(outcome.rendered).toBe(true)
    expect(outcome.options).toBe(3)
    expect(outcome.requests).toBe(1)
    expect(outcome.keys).toHaveLength(1)
    expectNoEscape(outcome)
  })
})

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
})

describe('storage failures', () => {
  it('shows no plan when the sessionStorage getter throws', async () => {
    const outcome = await observe({
      before: () =>
        Object.defineProperty(globalThis, 'sessionStorage', {
          configurable: true,
          get() {
            throw new DOMException('The operation is insecure.', 'SecurityError')
          },
        }),
    })

    expect(outcome.options).toBe(0)
    expectNoEscape(outcome)
  })
})

describe('option failures', () => {
  // `document.querySelector('#')` throws a SyntaxError DOMException.
  it('shows no plan when the container is #', async () => {
    const outcome = await observe({ options: { container: '#' } })

    expect(outcome.options).toBe(0)
    expectNoEscape(outcome)
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
    expectNoEscape(outcome)
  })
})

// The checks above pass on an empty list, so this shows that collectEscapes catches a rejection.
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
