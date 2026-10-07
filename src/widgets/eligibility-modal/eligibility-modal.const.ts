/**
 * Prefix classes to avoid name collisions.
 */
const prefix = 'alma-eligibility-modal'

/**
 * Class names for the **eligibility modale** widget.
 * Those classes are intended to be used by the **merchant developer**.
 */
const STATIC_CUSTOMISATION_CLASSES = {
  desktopModal: `${prefix}-desktop-modal`,
  mobileModal: `${prefix}-mobile-modal`,
  leftSide: `${prefix}-left-side`,
  bullet: `${prefix}-bullet`,
  rightSide: `${prefix}-right-side`,
  title: `${prefix}-title`,
  info: `${prefix}-info`,
  infoMessage: `${prefix}-info-message`,
  eligibilityOptions: `${prefix}-eligibility-options`,
  activeOption: `${prefix}-active-option`,
  closeButton: `${prefix}-close-button`,
  scheduleDetails: `${prefix}-schedule-details`,
  scheduleTotal: `${prefix}-schedule-total`,
  scheduleCredit: `${prefix}-schedule-credit`,
  cardContainer: `${prefix}-card-logos`,
  summary: `${prefix}-summary`,
}

export default STATIC_CUSTOMISATION_CLASSES
