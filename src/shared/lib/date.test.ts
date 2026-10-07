import { addDays, addMonths, fromUnixTime, getUnixTime } from '@/shared/lib/date'

// The helpers work in local time, like date-fns. Every expected date below is the output of
// date-fns 4.4.0 for the same input, in the same time zone.
const originalTimeZone = process.env.TZ

const useTimeZone = (timeZone: string) => {
  process.env.TZ = timeZone
}

const iso = (date: Date) => date.toISOString()

afterEach(() => {
  if (originalTimeZone === undefined) {
    delete process.env.TZ
  } else {
    process.env.TZ = originalTimeZone
  }
})

describe('in UTC', () => {
  beforeEach(() => {
    useTimeZone('UTC')
    expect(new Date(2022, 6, 1).getTimezoneOffset()).toBe(0)
  })

  describe('fromUnixTime', () => {
    it('should turn Unix seconds into a date', () => {
      expect(iso(fromUnixTime(1638350762))).toBe('2021-12-01T09:26:02.000Z')
    })
  })

  describe('getUnixTime', () => {
    it('should turn a date into Unix seconds', () => {
      expect(getUnixTime(new Date('2021-12-01T09:26:02.000Z'))).toBe(1638350762)
    })

    it('should drop the milliseconds', () => {
      expect(getUnixTime(new Date('2021-12-01T09:26:02.999Z'))).toBe(1638350762)
    })

    it('should truncate toward zero before 1970', () => {
      expect(getUnixTime(new Date('1969-12-31T23:59:58.500Z'))).toBe(-1)
    })

    it('should round trip with fromUnixTime', () => {
      expect(getUnixTime(fromUnixTime(1638350762))).toBe(1638350762)
    })
  })

  describe('addDays', () => {
    it('should add days', () => {
      expect(iso(addDays(new Date('2021-12-01T09:26:02Z'), 30))).toBe('2021-12-31T09:26:02.000Z')
    })

    it('should roll over to the next year', () => {
      expect(iso(addDays(new Date('2021-12-31T23:00:00Z'), 1))).toBe('2022-01-01T23:00:00.000Z')
    })

    it('should subtract days with a negative amount', () => {
      expect(iso(addDays(new Date('2022-03-01T00:00:00Z'), -1))).toBe('2022-02-28T00:00:00.000Z')
    })

    it('should return a copy for 0 days', () => {
      const date = new Date('2022-03-01T00:00:00Z')

      const result = addDays(date, 0)

      expect(result).not.toBe(date)
      expect(result.getTime()).toBe(date.getTime())
    })

    it('should not change the date it receives', () => {
      const date = new Date('2022-03-01T00:00:00Z')

      addDays(date, 10)

      expect(iso(date)).toBe('2022-03-01T00:00:00.000Z')
    })

    it('should return an Invalid Date for NaN, so a wrong amount stays visible', () => {
      expect(addDays(new Date('2022-01-31T12:00:00Z'), NaN).getTime()).toBeNaN()
    })
  })

  describe('addMonths', () => {
    it('should add months', () => {
      expect(iso(addMonths(new Date('2021-12-15T12:00:00Z'), 2))).toBe('2022-02-15T12:00:00.000Z')
    })

    it.each([
      ['31 January plus one month gives 28 February', '2022-01-31T12:00:00Z', 1, '2022-02-28'],
      [
        '31 January plus one month gives 29 February in a leap year',
        '2024-01-31T12:00:00Z',
        1,
        '2024-02-29',
      ],
      ['31 March plus one month gives 30 April', '2022-03-31T12:00:00Z', 1, '2022-04-30'],
      ['30 November plus three months gives 28 February', '2021-11-30T12:00:00Z', 3, '2022-02-28'],
      [
        '29 February plus twelve months gives 28 February',
        '2024-02-29T12:00:00Z',
        12,
        '2025-02-28',
      ],
      ['31 May plus twelve months stays on the 31st', '2022-05-31T12:00:00Z', 12, '2023-05-31'],
    ])('should clamp to the last day of the month: %s', (_label, start, months, expectedDay) => {
      expect(iso(addMonths(new Date(start), months))).toBe(`${expectedDay}T12:00:00.000Z`)
    })

    it.each([
      ['2022-03-31T12:00:00Z', -1, '2022-02-28T12:00:00.000Z'],
      ['2022-03-15T12:00:00Z', -1, '2022-02-15T12:00:00.000Z'],
      ['2022-01-15T12:00:00Z', -2, '2021-11-15T12:00:00.000Z'],
    ])('should subtract months with a negative amount: %s %i', (start, months, expected) => {
      expect(iso(addMonths(new Date(start), months))).toBe(expected)
    })

    it('should return a copy for 0 months', () => {
      const date = new Date('2022-01-31T12:00:00Z')

      const result = addMonths(date, 0)

      expect(result).not.toBe(date)
      expect(result.getTime()).toBe(date.getTime())
    })

    it('should not change the date it receives', () => {
      const date = new Date('2022-01-31T12:00:00Z')

      addMonths(date, 1)

      expect(iso(date)).toBe('2022-01-31T12:00:00.000Z')
    })

    it('should return an Invalid Date for NaN, so a wrong amount stays visible', () => {
      expect(addMonths(new Date('2022-01-31T12:00:00Z'), NaN).getTime()).toBeNaN()
    })
  })
})

describe('in Europe/Paris, where the clocks change', () => {
  beforeEach(() => {
    useTimeZone('Europe/Paris')
    expect(new Date(2022, 6, 1).getTimezoneOffset()).toBe(-120)
  })

  it('should keep the local time when addDays crosses the spring change (a 23 hour day)', () => {
    // 26 March 12:00 local is 11:00 UTC, 27 March 12:00 local is 10:00 UTC
    expect(iso(addDays(new Date('2022-03-26T11:00:00Z'), 1))).toBe('2022-03-27T10:00:00.000Z')
  })

  it('should keep the local time when addDays crosses the autumn change (a 25 hour day)', () => {
    expect(iso(addDays(new Date('2022-10-29T10:00:00Z'), 1))).toBe('2022-10-30T11:00:00.000Z')
  })

  it('should keep the local time when addMonths crosses a change', () => {
    expect(iso(addMonths(new Date('2022-02-15T11:00:00Z'), 2))).toBe('2022-04-15T10:00:00.000Z')
    expect(iso(addMonths(new Date('2022-09-30T10:00:00Z'), 1))).toBe('2022-10-30T11:00:00.000Z')
  })

  it('should not move the instant for 0 days or 0 months in the repeated hour of the autumn change', () => {
    // 02:30 happens twice on 30 October. This is the second time, 02:30 CET, at 01:30 UTC.
    const repeatedHour = new Date('2022-10-30T01:30:00Z')

    expect(addDays(repeatedHour, 0).getTime()).toBe(repeatedHour.getTime())
    expect(addMonths(repeatedHour, 0).getTime()).toBe(repeatedHour.getTime())
  })

  it('should clamp the day and keep the local time together', () => {
    expect(iso(addMonths(new Date('2022-01-31T11:00:00Z'), 2))).toBe('2022-03-31T10:00:00.000Z')
  })
})
