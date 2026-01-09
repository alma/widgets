import { renderHook, waitFor } from '@testing-library/react'

import { ApiMode } from '@/consts'
import { statusResponse } from '@/types'
import useFetchEligibility from 'hooks/useFetchEligibility'
import { useSessionStorage } from 'hooks/useSessionStorage'
import { mockPlansAllEligible } from 'test/fixtures'
import { fetchFromApi } from 'utils/fetch'
import filterEligibility from 'utils/filterEligibility'

jest.mock('utils/fetch')
jest.mock('hooks/useSessionStorage')

describe('useFetchEligibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch eligibility data and update state', async () => {
    const mockedSessionStorage = {
      getCache: jest.fn(),
      setCache: jest.fn(),
      createKey: jest.fn().mockReturnValue('mocked_key'),
      clearCache: jest.fn(),
    }
    ;(useSessionStorage as jest.Mock).mockReturnValue(mockedSessionStorage)
    ;(fetchFromApi as jest.Mock).mockImplementation(async () => mockPlansAllEligible)

    const { result } = renderHook(() =>
      useFetchEligibility(
        45000,
        { domain: ApiMode.TEST, merchantId: 'test_id' },
        undefined,
        'FR',
        'FR',
        true,
      ),
    )
    // First the API response is pending
    expect(result.current[1]).toBe(statusResponse.PENDING)

    // The API is called
    expect(fetchFromApi).toHaveBeenCalledTimes(1)
    expect(fetchFromApi).toHaveBeenCalledWith(
      {
        purchase_amount: 45000,
        queries: undefined,
        billing_address: { country: 'FR' },
        shipping_address: { country: 'FR' },
        merchant_covers_all_fees: true,
      },
      {
        Authorization: 'Alma-Merchant-Auth test_id',
        'X-Alma-Agent': 'Alma Widget/undefined',
      },
      `${ApiMode.TEST}/v2/payments/eligibility`,
    )
    // The hooks returns the filtered result of the API response
    await waitFor(() => {
      expect(result.current[0]).toEqual(filterEligibility(mockPlansAllEligible))
    })
    // The status is successful
    expect(result.current[1]).toEqual(statusResponse.SUCCESS)
    // Cache is configured
    expect(mockedSessionStorage?.setCache).toHaveBeenCalledWith('mocked_key', mockPlansAllEligible)
  })

  it('should use cached data if available to avoid calling fetch again', async () => {
    // Not using directly mockPlansAllEligible to make sure we gather the results stored in the cache
    const newMockedResult = [mockPlansAllEligible[0]]
    const mockedSessionStorage = {
      getCache: jest.fn().mockReturnValue({ key: 'mocked_key', value: newMockedResult }),
      setCache: jest.fn(),
      createKey: jest.fn().mockReturnValue('mocked_key'),
      clearCache: jest.fn(),
    }
    ;(useSessionStorage as jest.Mock).mockReturnValue(mockedSessionStorage)

    const { result } = renderHook(() =>
      useFetchEligibility(
        45000,
        { domain: ApiMode.TEST, merchantId: 'test_id' },
        undefined,
        'FR',
        'FR',
      ),
    )

    // The status is successful
    await waitFor(() => {
      expect(result.current[1]).toBe(statusResponse.SUCCESS)
    })
    // The returned result is still the filtered response
    expect(result.current[0]).toEqual(filterEligibility(newMockedResult))
    // But the API was not called
    expect(fetchFromApi).not.toHaveBeenCalled()
  })

  it('should returns a FAILED status if the API response contains `error_code`', async () => {
    const mockedSessionStorage = {
      getCache: jest.fn(),
      setCache: jest.fn(),
      createKey: jest.fn().mockReturnValue('mocked_key'),
      clearCache: jest.fn(),
    }
    ;(useSessionStorage as jest.Mock).mockReturnValue(mockedSessionStorage)
    ;(fetchFromApi as jest.Mock).mockImplementation(async () => ({
      message: 'some error',
      error_code: '403',
    }))

    const { result } = renderHook(() =>
      useFetchEligibility(
        45000,
        { domain: ApiMode.TEST, merchantId: 'test_id' },
        undefined,
        'FR',
        'FR',
      ),
    )

    // Status should be failed
    await waitFor(() => {
      expect(result.current[1]).toBe(statusResponse.FAILED)
    })
    // The cache should not be set
    expect(mockedSessionStorage?.setCache).not.toHaveBeenCalled()
    // The hook response should be empty
    expect(result.current[0]).toEqual([])
  })
  it('should returns a FAILED status if the API response contains `errors`', async () => {
    const mockedSessionStorage = {
      getCache: jest.fn(),
      setCache: jest.fn(),
      createKey: jest.fn().mockReturnValue('mocked_key'),
      clearCache: jest.fn(),
    }
    ;(useSessionStorage as jest.Mock).mockReturnValue(mockedSessionStorage)
    ;(fetchFromApi as jest.Mock).mockImplementation(async () => ({
      errors: 'some error',
    }))

    const { result } = renderHook(() =>
      useFetchEligibility(
        45000,
        { domain: ApiMode.TEST, merchantId: 'test_id' },
        undefined,
        'FR',
        'FR',
      ),
    )

    // Status should be failed
    await waitFor(() => {
      expect(result.current[1]).toBe(statusResponse.FAILED)
    })
    // The cache should not be set
    expect(mockedSessionStorage?.setCache).not.toHaveBeenCalled()
    // The hook response should be empty
    expect(result.current[0]).toEqual([])
  })
})
