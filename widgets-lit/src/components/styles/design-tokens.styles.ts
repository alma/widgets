import { css } from 'lit'

// Design tokens for Alma widgets (scoped to each component host for shadow DOM isolation)
// Updated with new brand design system tokens
export const designTokensStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

  :host {
    /* ==========================================
       BRAND PRIMITIVES - Base Design Tokens
       ========================================== */

    /* --- Fonts --- */
    --font-family-headings: 'Argent', serif;
    --font-family-body: 'Inter', sans-serif;

    /* Legacy aliases for backward compatibility */
    --font-family-argent-cf: var(--font-family-headings);
    --font-family-venn: var(--font-family-body);
    --font-family-sans-serif: sans-serif;

    /* --- Fonts weight --- */
    --font-weight-regular: 400;
    --font-weight-demi-bold: 600;
    --font-weight-semi-bold: 700;

    /* Legacy aliases */
    --weight-normal: var(--font-weight-regular);
    --weight-medium: 500;
    --weight-semi-bold: var(--font-weight-demi-bold);
    --weight-bold: var(--font-weight-semi-bold);
    --weight-light: 300;

    /* --- Border Radius --- */
    --border-radius-xl: 100px;
    --border-radius-md: 20px;
    --border-radius-sm: 16px;
    --border-radius-xs: 12px;
    --border-radius-2xs: 8px;

    /* Legacy aliases */
    --radius-xl: var(--border-radius-xl);
    --radius-lg: var(--border-radius-md);
    --radius-md: var(--border-radius-sm);
    --radius-sm: var(--border-radius-xs);
    --radius-xs: var(--border-radius-2xs);
    --radius-2xs: 4px;

    /* --- Spacing Scale (NEW) --- */
    --spacing-4: 4px;
    --spacing-8: 8px;
    --spacing-12: 12px;
    --spacing-16: 16px;
    --spacing-20: 20px;
    --spacing-24: 24px;
    --spacing-32: 32px;
    --spacing-40: 40px;
    --spacing-48: 48px;
    --spacing-56: 56px;
    --spacing-64: 64px;
    --spacing-80: 80px;
    --spacing-96: 96px;
    --spacing-128: 128px;
    --spacing-160: 160px;

    /* --- Base Colors --- */
    --orange-700: #3e1509;
    --orange-600: #b43b1b;
    --orange-alma: #fa5022;
    --orange-400: #ffe7d6;
    --orange-300: #fff3ea;
    --blue-700: #1c4d53;
    --blue-600: #1b7680;
    --blue-alma: #53d9e8;
    --blue-400: #d7fbff;
    --green-700: #0a3b29;
    --green-600: #087a50;
    --green-alma: #01c07b;
    --green-400: #d1fee4;
    --red-700: #550c0c;
    --red-600: #c51515;
    --red-alma: #f73c3c;
    --red-400: #ffeded;
    --yellow-700: #504403;
    --yellow-600: #dcb300;
    --yellow-alma: #ffd400;
    --yellow-400: #fff1aa;
    --gray-900: #130a07;
    --gray-800: #6c6c6c;
    --gray-700: #cacaca;
    --gray-600: #ececec;
    --gray-default: #f7f7f7;
    --gray-page: #fefefe;
    --foundation-white: #fff;
    --foundation-black: #000;

    /* --- Typography Scale --- */

    /* Headings (Argent CF - Demi Bold) */
    --headings-tagline-font-size: 56px;
    --headings-tagline-font-size-mobile: 48px;
    --headings-tagline-line-height: 53px;
    --headings-tagline-line-height-mobile: 46px;
    --headings-tagline-letter-spacing: -2.2px;
    --headings-tagline-letter-spacing-mobile: -2px;
    --headings-h1-font-size: 48px;
    --headings-h1-font-size-mobile: 40px;
    --headings-h1-line-height: 46px;
    --headings-h1-line-height-mobile: 38px;
    --headings-h1-letter-spacing: -2px;
    --headings-h1-letter-spacing-mobile: -1.6px;
    --headings-h2-font-size: 40px;
    --headings-h2-font-size-mobile: 32px;
    --headings-h2-line-height: 38px;
    --headings-h2-line-height-mobile: 30px;
    --headings-h2-letter-spacing: -1.6px;
    --headings-h2-letter-spacing-mobile: -1.2px;

    /* Paragraphs (Inter) */
    --paragraph-xl-font-size: 24px;
    --paragraph-xl-line-height: 32px;
    --paragraph-xl-letter-spacing: -1px;
    --paragraph-lg-font-size: 18px;
    --paragraph-lg-line-height: 24px;
    --paragraph-lg-letter-spacing: -0.7px;
    --paragraph-md-font-size: 16px;
    --paragraph-md-line-height: 22px;
    --paragraph-md-letter-spacing: -0.6px;
    --paragraph-sm-font-size: 14px;
    --paragraph-sm-line-height: 19px;
    --paragraph-sm-letter-spacing: -0.6px;
    --paragraph-xs-font-size: 12px;
    --paragraph-xs-line-height: 16px;
    --paragraph-xs-letter-spacing: -0.5px;
    --paragraph-2xs-font-size: 10px;
    --paragraph-2xs-line-height: 13px;
    --paragraph-2xs-letter-spacing: -0.4px;

    /* Line height - legacy */
    --line-height-xl: 150%;
    --line-height-lg: 135%;
    --line-height-medium: 120%;
    --line-height-small: 110%;

    /* --- Shadows --- */
    --shadow-regular: 0px 0px 4px 0px rgb(0 0 0 / 8%), 0px 5px 16px 0px rgb(0 0 0 / 8%);
    --shadow-small: 0px 1px 2px 0px rgb(0 0 0 / 8%);

    /* ==========================================
       SEMANTIC TOKENS - Context-Specific Usage
       ========================================== */

    /* --- Border Tokens --- */
    --border-default: var(--gray-600);
    --border-strong: var(--gray-700);
    --border-hover: var(--orange-alma);
    --border-focus: var(--blue-alma);
    --border-error: var(--red-600);
    --border-white: var(--foundation-white);
    --border-black: var(--foundation-black);

    /* --- Button Tokens --- */
    --buttons-primary-default: var(--gray-900);
    --buttons-primary-hover: var(--orange-700);
    --buttons-primary-disabled-loading: var(--gray-600);
    --buttons-primary-success: var(--green-alma);
    --buttons-destructive-default: var(--red-600);
    --buttons-destructive-hover: var(--red-700);
    --buttons-destructive-disabled-loading: var(--gray-600);
    --buttons-white-default: var(--foundation-white);
    --buttons-white-hover: var(--orange-300);
    --buttons-white-disabled-loading: var(--gray-600);

    /* --- Icon Tokens --- */
    --icons-default: var(--gray-900);
    --icons-secondary: var(--gray-800);
    --icons-alma: var(--orange-alma);
    --icons-colored: var(--orange-600);
    --icons-colored-2: var(--orange-400);
    --icons-disabled: var(--gray-600);
    --icons-error: var(--red-600);
    --icons-error-2: var(--red-400);
    --icons-information: var(--blue-600);
    --icons-information-2: var(--blue-400);
    --icons-success: var(--green-600);
    --icons-success-2: var(--green-400);
    --icons-warning: var(--yellow-700);
    --icons-warning-2: var(--yellow-400);
    --icons-inverted: var(--foundation-white);

    /* --- Text Tokens --- */
    --text-default: var(--gray-900);
    --text-secondary: var(--gray-800);
    --text-alma: var(--orange-alma);
    --text-colored: var(--orange-600);
    --text-colored-2: var(--orange-400);
    --text-error: var(--red-600);
    --text-error-2: var(--red-400);
    --text-information: var(--blue-600);
    --text-information-2: var(--blue-400);
    --text-success: var(--green-600);
    --text-success-2: var(--green-400);
    --text-warning: var(--yellow-700);
    --text-warning-2: var(--yellow-400);
    --text-inverted: var(--foundation-white);

    /* --- Surface Tokens --- */
    --surface-default: var(--gray-default);
    --surface-strong: var(--gray-600);
    --surface-colored: var(--orange-400);
    --surface-colored-2: var(--orange-600);
    --surface-error: var(--red-400);
    --surface-error-2: var(--red-600);
    --surface-information: var(--blue-400);
    --surface-information-2: var(--blue-600);
    --surface-success: var(--green-400);
    --surface-success-2: var(--green-600);
    --surface-warning: var(--yellow-400);
    --surface-warning-2: var(--yellow-alma);
    --surface-page-background: var(--gray-page);
    --surface-white: var(--foundation-white);
    --surface-black: var(--foundation-black);

    /* Paddings */
    --mobile-body-padding: 24px 16px;

    /* transitions */
    --transition-50-ms: all 0.5s cubic-bezier(0.14, 0.59, 1, 1.01);
    --transition-25-ms: all 0.25s cubic-bezier(0.14, 0.59, 1, 1.01);

    /* Specific components variables */
    --button-regular-height: 50px;
    --button-small-height: 35px;
    --button-tiny-height: 25px;
    --input-small-height: 35px;
    --input-regular-height: 50px;
    --badge-regular-height: 24px;
    --badge-medium-height: 32px;
    --badge-large-height: 40px;
    --icon-pill-size: 24px;
    --icon-pill-big-size: 32px;
    --icon-pill-huge-size: 40px;
    --icon-pill-lg-size: 32px;
    --icon-pill-lg-svg: 20px;

    /** Mapped widget tokens (legacy internal usage) **/
    --alma-modal-font-family-sans:
      var(--font-family-body), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, sans-serif;
    --alma-modal-font-family-display: var(--font-family-headings), var(--font-family-sans-serif);
    --alma-payment-font-family-sans:
      var(--font-family-body), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, sans-serif;

    --alma-modal-title-font-size: var(--paragraph-xl-font-size);
    --alma-modal-body-font-size: var(--paragraph-md-font-size);
    --alma-modal-info-font-size: var(--paragraph-sm-font-size);
    --alma-modal-total-font-size: 20px;
    --alma-modal-installment-font-size: var(--paragraph-sm-font-size);

    --alma-payment-info-font-size: var(--paragraph-2xs-font-size);
    --alma-payment-error-font-size: var(--paragraph-2xs-font-size);
    --alma-payment-plan-label-font-size: var(--paragraph-xs-font-size);

    --alma-font-weight-regular: var(--font-weight-regular);
    --alma-font-weight-medium: var(--weight-medium);
    --alma-font-weight-semibold: var(--font-weight-demi-bold);
    --alma-font-weight-bold: var(--font-weight-semi-bold);

    --alma-line-height-tight: var(--line-height-small);
    --alma-line-height-regular: var(--line-height-medium);
    --alma-line-height-comfortable: var(--line-height-lg);
    --alma-line-height-spacious: var(--line-height-xl);

    --alma-color-brand-primary: var(--orange-alma);
    --alma-color-brand-secondary: var(--blue-alma);
    --alma-color-brand-accent: var(--yellow-alma);

    --alma-color-surface-primary: var(--foundation-white);
    --alma-color-surface-subtle: var(--gray-page);

    --alma-color-text-primary: var(--text-default);
    --alma-color-text-secondary: var(--colors-text-secondary);
    --alma-color-text-muted: var(--dark-gray);
    --alma-color-text-error: var(--text-error);

    --alma-color-border-subtle: var(--border-default);
    --alma-color-border-strong: var(--colors-border-strong);
    --alma-color-border-plan-separator: var(--border-default);

    --alma-color-overlay-backdrop: rgba(0, 0, 0, 0.3);

    --alma-color-timeline-line: var(--border-default);
    --alma-color-timeline-dot-soft: #ffd2c6;
    --alma-color-timeline-dot-active: var(--orange-alma);

    --alma-color-button-primary-bg: var(--orange-alma);
    --alma-color-button-primary-text: var(--foundation-white);
    --alma-color-button-secondary-bg: var(--foundation-white);
    --alma-color-button-secondary-text: var(--gray-900);
    --alma-color-button-border: var(--gray-800);

    --alma-color-focus-outline: var(--orange-alma);
    --alma-color-focus-outline-monochrome: var(--gray-900);

    /** Spacing **/
    --alma-space-xxs: 2px;
    --alma-space-xs: var(--spacing-4);
    --alma-space-sm: 6px;
    --alma-space-md: var(--spacing-8);
    --alma-space-lg: var(--spacing-12);
    --alma-space-xl: var(--spacing-16);
    --alma-space-2xl: var(--spacing-20);
    --alma-space-3xl: var(--spacing-24);
    --alma-space-4xl: var(--spacing-32);
    --alma-space-5xl: var(--spacing-40);
    --alma-space-6xl: var(--spacing-48);

    /** Radius **/
    --alma-radius-xs: var(--radius-2xs);
    --alma-radius-sm: var(--radius-xs);
    --alma-radius-md: var(--radius-md);
    --alma-radius-full: 999px;

    --alma-modal-radius-desktop: var(--radius-xs);
    --alma-modal-radius-mobile: var(--radius-lg) var(--radius-lg) 0 0;

    /** Shadows **/
    --alma-shadow-modal: var(--shadow-normal);
    --alma-shadow-focus-strong: 0 2px 8px rgba(0, 0, 0, 0.3);
    --alma-shadow-focus-soft: var(--shadow-focus-soft);

    /** Transitions & animations **/
    --alma-transition-fast: var(--transition-25-ms);
    --alma-transition-button: var(--transition-25-ms);

    /** Payment plans specific **/
    --alma-payment-container-width: 368px;
    --alma-payment-logo-width: 42px;
    --alma-payment-logo-height: 24px;
    --alma-payment-card-width: 24px;
    --alma-payment-card-height: 16px;
  }

  /* Theme overrides are intentionally omitted for now.
     Tokens are ready for theming via CSS variable overrides on the host element. */
`
