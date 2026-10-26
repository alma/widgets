import { stubDateNow } from '@/test/story-stubs'

describe('stubDateNow', () => {
  it('should fix Date.now() until its undo function runs', () => {
    const previousNow = Date.now

    const undo = stubDateNow(1000)

    expect(Date.now()).toBe(1000)

    undo()

    expect(Date.now).toBe(previousNow)
  })

  it("should default to master's today", () => {
    vi.restoreAllMocks()

    const undo = stubDateNow()

    expect(Date.now()).toBe(1638350762000)

    undo()
  })
})
