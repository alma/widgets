/**
 * Prefix classes to avoid name collisions.
 */
const prefix = 'alma-EligibilityModal'

/**
 * Class names for the **eligibility modale** widget.
 * Thoses classes are intended to be used by the **merchant developer**.
 */
const STATIC_CUSTOMISATION_CLASSES = {
  leftSide: prefix + '-left-side',
  rightSide: prefix + '-right-side',
  title: prefix + '-title',
  info: prefix + '-info',
  infoMessage: prefix + '-info-message',
  eligibilityOptions: prefix + '-eligibility-options',
  activeOption: prefix + '-action-option',
  closeButton: prefix + '-close-button',
  scheduleDetails: prefix + '-schedule-details',
  scheduleTotal: prefix + '-schedule-total',
  scheduleCredit: prefix + '-schedule-credit',
}

export default STATIC_CUSTOMISATION_CLASSES
