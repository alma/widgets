import * as axeMatchers from 'vitest-axe/matchers'

import { resetWarnOnce } from '@/shared/lib/errors'

// Master's "today": 1 December 2021, 09:26:02 UTC.
const TODAY = 1638350762000

expect.extend(axeMatchers)

beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(TODAY)
})

// Light DOM elements and the modal portal leave their DOM in <body>, so each test starts from an
// empty page.
afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
  document.body.replaceChildren()
  document.body.classList.remove('ReactModal__Body--open')
  sessionStorage.clear()
  resetWarnOnce()
})
