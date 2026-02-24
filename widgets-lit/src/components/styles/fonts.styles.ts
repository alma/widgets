import { css } from 'lit'

/**
 * Alma Fonts - Argent and Inter families
 *
 * Note: Inter is loaded via Google Fonts in design tokens.
 * Argent is injected here and also via injectFonts() in modal.ts
 * to ensure it loads correctly in Shadow DOM.
 */
export const fontsStyles = css`
  @font-face {
    font-family: Argent;
    src: url('https://cdn.almapay.com/fonts/Argent/ArgentCF-DemiBold.woff') format('woff');
    font-weight: 600;
    font-style: normal;
    font-display: swap;
  }
`
