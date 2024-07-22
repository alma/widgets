import { ConfigPlan, EligibilityPlan } from 'types'
import { hashStringForStorage } from 'utils/utilsForStorage'

type UseSessionStorageType = {
  getCache: (key: string) => EligibilityPlan[] | null
  setCache: (key: string, value: EligibilityPlan[]) => void
  clearCache: () => void
  deleteCache: (key: string) => void
  createKey: (
    amount: number,
    plans?: ConfigPlan[],
    customerBillingCountry?: string,
    customerShippingCountry?: string,
  ) => string
}

export const useSessionStorage: () => UseSessionStorageType = () => {
  const setCache = (key: string, value: EligibilityPlan[]) => {
    // Save data to sessionStorage
    sessionStorage.setItem(key, JSON.stringify(value))
  }

  const getCache = (key: string): EligibilityPlan[] | null => {
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

  const createKey = (
    amount: number,
    plans?: ConfigPlan[],
    customerBillingCountry = '',
    customerShippingCountry = '',
  ): string => {
    const stringAmount = amount.toString()
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
