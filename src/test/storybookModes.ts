// Added to the desktop mode of .storybook/preview.ts. Renaming a mode drops its baselines.

export const MOBILE_MODES = {
  mobile: { viewport: 'mobile', merchantCss: 'off' },
}

export const MERCHANT_CSS_MODES = {
  'desktop merchant-css': { viewport: 'desktop', merchantCss: 'on' },
  'desktop customized': { viewport: 'desktop', merchantCss: 'customized' },
}

// For the modal, which has its own mobile layout
export const MOBILE_MERCHANT_CSS_MODES = {
  'mobile merchant-css': { viewport: 'mobile', merchantCss: 'on' },
  'mobile customized': { viewport: 'mobile', merchantCss: 'customized' },
}
