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
}

export default STATIC_CUSTOMISATION_CLASSES
