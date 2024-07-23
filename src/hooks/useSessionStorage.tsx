import { ConfigPlan, EligibilityPlan } from 'types'
import { hashStringForStorage } from 'utils/utilsForStorage'

type CreateKeyType = {
  purchaseAmount: number
  plans?: ConfigPlan[]
  customerBillingCountry?: string
  customerShippingCountry?: string
}

type StorageType = {
  value: EligibilityPlan[]
  timestamp: number
}

type UseSessionStorageType = {
  getCache: (key: string) => StorageType | null
  setCache: (key: string, value: EligibilityPlan[]) => void
  clearCache: () => void
  deleteCache: (key: string) => void
  createKey: (params: CreateKeyType) => string
}

export const useSessionStorage: () => UseSessionStorageType = () => {
  const setCache = (key: string, value: EligibilityPlan[]) => {
    // Save data to sessionStorage and create timestamp
    const timestamp = Date.now()
    sessionStorage.setItem(key, JSON.stringify({ value, timestamp }))
  }

  const getCache = (key: string): StorageType | null => {
    // Get saved data from sessionStorage
    const stringData = sessionStorage.getItem(key) || ''
    // Parse cached data to use it directly as an array of EligibilityPlan
    return stringData ? JSON.parse(stringData) : null
  }

  const deleteCache = (key: string) => {
    // Remove saved data from sessionStorage
    sessionStorage.removeItem(key)
  }

  const clearCache = () => {
    // Remove all saved data from sessionStorage
    sessionStorage.clear()
  }

  const createKey = (params: CreateKeyType): string => {
    const { purchaseAmount, plans, customerBillingCountry, customerShippingCountry } = params

    const stringAmount = purchaseAmount.toString()
    const stringPlans = JSON.stringify(plans)
    return hashStringForStorage(
      `${stringAmount}${stringPlans}${customerBillingCountry}${customerShippingCountry}`,
    )
  }

  return {
    setCache,
    getCache,
    clearCache,
    deleteCache,
    createKey,
  }
}
