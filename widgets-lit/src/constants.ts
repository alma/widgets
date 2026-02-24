export enum ApiMode {
  TEST = 'https://api.sandbox.getalma.eu',
  LIVE = 'https://api.getalma.eu',
}

export const API_ENDPOINTS = {
  ELIGIBILITY: '/v1/payments/eligibility',
} as const

export const DEFAULT_LOCALE = 'en'

export const AVAILABLE_LOCALES = [
  'en',
  'fr',
  'fr-FR',
  'de',
  'de-DE',
  'it',
  'it-IT',
  'es',
  'es-ES',
  'pt',
  'pt-PT',
  'nl',
  'nl-NL',
  'nl-BE',
] as const

// Widget Configuration Constants
export const WIDGET_CONFIG = {
  // Animation timing defaults
  DEFAULT_TRANSITION_DELAY: 5500, // milliseconds between plan rotations
  MIN_TRANSITION_DELAY: 1000, // minimum delay for usability
  ANIMATION_DISABLED: -1, // special value to disable auto-animation

  // Storage & caching
  SESSION_CACHE_PREFIX: 'alma_eligibility_',

  // DOM generation
  AUTO_MODAL_CONTAINER_PREFIX: 'alma-modal-',
  GLOBAL_CONFIG_KEY: '__ALMA_WIDGET_CONFIG__',

  // Error handling
  DEFAULT_ERROR_TIMEOUT: 5000, // milliseconds
} as const

// User Agent string for API requests
export const USER_AGENT = 'Alma Widgets Lit/1.0.0' as const
