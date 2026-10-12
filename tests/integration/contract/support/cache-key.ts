// Copy of master's `hashStringForStorage` (src/utils/utilsForStorage.ts) and of the key built in
// `createKey` (src/hooks/useSessionStorage.tsx). The cache tests compute the expected key with it,
// so they never read the key back from sessionStorage.
/* eslint-disable no-bitwise */
export const hashStringForStorage = (str: string): string =>
  str
    .split('')
    .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
    .toString()
    .replace('-', 'A')

export type CacheKeyParts = {
  domain?: string
  merchantId?: string
  purchaseAmount: number | string
  plans?: unknown
  customerBillingCountry?: string
  customerShippingCountry?: string
  merchantCoversAllFees?: boolean
  buildVersion?: string
}

/** A missing value becomes the text `undefined`, as in master's template literal. */
export const cacheKey = ({
  domain,
  merchantId,
  purchaseAmount,
  plans,
  customerBillingCountry,
  customerShippingCountry,
  merchantCoversAllFees,
  buildVersion = 'contract-test',
}: CacheKeyParts): string =>
  hashStringForStorage(
    `${domain}${merchantId}${String(purchaseAmount)}${JSON.stringify(plans)}${customerBillingCountry}${customerShippingCountry}${merchantCoversAllFees}${buildVersion}`,
  )
