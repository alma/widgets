import { css } from 'lit'

/**
 * Alma Fonts - Argent and Venn families
 *
 * Note: These @font-face declarations are also injected into document <head>
 * via injectFonts() in modal.ts to ensure fonts load correctly in Shadow DOM.
 * Using woff format only for better compatibility and smaller bundle size.
 */
export const fontsStyles = css`
  @font-face {
    font-family: Argent;
    src: url('https://cdn.almapay.com/fonts/Argent/ArgentCF-DemiBold.woff') format('woff');
    font-weight: 600;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: Venn;
    src: url('https://cdn.almapay.com/fonts/Venn/Venn-Bold.woff') format('woff');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: Venn;
    src: url('https://cdn.almapay.com/fonts/Venn/Venn-Regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
`
