/**
 * Prefix classes to avoid name collisions.
 */
const prefix = 'alma-payment-plans'

/**
 * Class names for the **payment plans** widget.
 * Those classes are intended to be used by the **merchant developer**.
 */
const STATIC_CUSTOMISATION_CLASSES = {
  container: `${prefix}-container`,
  eligibilityLine: `${prefix}-eligibility-line`,
  eligibilityOptions: `${prefix}-eligibility-options`,
  notEligibleOption: `${prefix}-not-eligible-option`,
  paymentInfo: `${prefix}-payment-info`,
  activeOption: `${prefix}-active-option`,
  knowMoreAction: `${prefix}-know-more-action`,
}

export default STATIC_CUSTOMISATION_CLASSES

// Frozen for 4.x: another 4.x bundle on the page may have defined it.
export const PAYMENT_PLANS_TAG = 'alma-payment-plans'
