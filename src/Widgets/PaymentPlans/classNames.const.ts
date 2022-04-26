/**
 * Prefix classes to avoid name collisions.
 */
const prefix = 'alma-PaymentPlans'

/**
 * Class names for the **payment plans** widget.
 * Thoses classes are intended to be used by the **merchant developer**.
 */
const STATIC_CUSTOMISATION_CLASSES = {
  container: prefix + '-container',
  eligibilityLine: prefix + '-eligibility-line',
  eligibilityOptions: prefix + '-eligibility-options',
  notEligibleOptions: prefix + '-not-eligible-options',
  paymentInfo: prefix + '-payment-info',
  activeOption: prefix + '-active-option',
}

export default STATIC_CUSTOMISATION_CLASSES
