import { css } from 'lit'

// Design tokens for Alma widgets (scoped to each component host for shadow DOM isolation)
// Component-oriented names, but values are the current visual ones to stay pixel-identical.
export const designTokensStyles = css`
  :host {
    /** Font Family **/
    --font-family-venn: 'Venn';
    --font-family-argent-cf: 'Argent';
    --font-family-sans-serif: sans-serif;

    /** Font size **/
    --font-title-xs: 18px;
    --font-title-sm: 22px;
    --font-title-md: 24px;
    --font-title-lg: 32px;
    --font-title-xl: 40px;
    --font-2xs: 10px;
    --font-xs: 12px;
    --font-sm: 14px;
    --font-base: 16px;
    --font-lg: 18px;
    --font-xl: 24px;

    /** Font weight **/
    --weight-light: 300;
    --weight-normal: 400;
    --weight-medium: 500;
    --weight-semi-bold: 600;
    --weight-bold: 700;

    /* Line height */
    --line-height-xl: 150%;
    --line-height-lg: 135%;
    --line-height-medium: 120%;
    --line-height-small: 110%;

    /** Colors **/
    --alma-orange: #fa5022;
    --dark-orange: #a03316;
    --soft-orange: #ffeadb;
    --light-orange: #fff3ea;
    --alma-blue: #60d2df;
    --dark-blue: #317a82;
    --soft-blue: #e7f8fa;
    --alma-yellow: #ffcf00;
    --dark-yellow: #876c00;
    --soft-yellow: #fff5cc;
    --alma-green: #4bb543;
    --dark-green: #30742b;
    --soft-green: #e2f3e1;
    --alma-red: #cf2020;
    --dark-red: #851515;
    --soft-red: #ffecec;
    --background: #fefefe;
    --off-white: #f9f9f9;
    --light-gray: #f0f0f0;
    --gray: #cacaca;
    --dark-gray: #6c6c6c;
    --off-black: #1a1a1a;
    --white: #fff;
    --black: #000;

    /* Text Colors */
    --colors-text-primary: var(--off-black);
    --colors-text-secondary: var(--dark-gray);
    --colors-text-colored: var(--alma-orange);
    --colors-text-colored-dark: var(--dark-orange);
    --colors-text-info: var(--dark-blue);
    --colors-text-success: var(--dark-green);
    --colors-text-warning: var(--dark-yellow);
    --colors-text-error: var(--alma-red);
    --colors-text-error-dark: var(--dark-red);
    --colors-text-inverted: var(--white);

    /* Borders Colors */
    --colors-border-regular: var(--light-gray);
    --colors-border-strong: var(--gray);
    --colors-border-hover: var(--alma-orange);
    --colors-border-focus: var(--alma-blue);
    --colors-border-error: var(--alma-red);
    --colors-border-white: var(--white);
    --colors-border-black: var(--black);

    /* Surfaces Colors */
    --colors-surface-regular: var(--off-white);
    --colors-surface-strong: var(--light-gray);
    --colors-surface-colored-soft: var(--soft-orange);
    --colors-surface-colored: var(--light-orange);
    --colors-surface-info: var(--soft-blue);
    --colors-surface-success: var(--soft-green);
    --colors-surface-warning: var(--soft-yellow);
    --colors-surface-error: var(--soft-red);
    --colors-surface-action: var(--alma-yellow);
    --colors-surface-destructive: var(--alma-red);
    --colors-surface-background: var(--background);
    --colors-surface-white: var(--white);

    /* Icons Colors */
    --colors-icon-regular: var(--off-white);
    --colors-icon-secondary: var(--dark-gray);
    --colors-icon-disabled: var(--gray);
    --colors-icon-colored: var(--alma-orange);
    --colors-icon-colored-outline: var(--dark-orange);
    --colors-icon-info: var(--alma-blue);
    --colors-icon-info-outline: var(--dark-blue);
    --colors-icon-success: var(--alma-green);
    --colors-icon-success-outline: var(--dark-green);
    --colors-icon-warning: var(--alma-yellow);
    --colors-icon-warning-outline: var(--dark-yellow);
    --colors-icon-error: var(--alma-red);
    --colors-icon-error-outline: var(--dark-red);
    --colors-icon-white: var(--white);

    /** Spacings **/
    --spacing-1: 4px;
    --spacing-2: 8px;
    --spacing-3: 12px;
    --spacing-4: 16px;
    --spacing-5: 20px;
    --spacing-6: 24px;
    --spacing-8: 32px;
    --spacing-10: 40px;
    --spacing-12: 48px;
    --spacing-14: 56px;
    --spacing-16: 64px;
    --spacing-20: 80px;
    --spacing-24: 96px;
    --spacing-32: 128px;
    --spacing-40: 160px;
    --spacing-48: 192px;
    --spacing-56: 224px;

    /* Paddings */
    --mobile-body-padding: 24px 16px;

    /* radius */
    --radius-2xs: 4px;
    --radius-xs: 8px;
    --radius-sm: 12px;
    --radius-md: 16px;
    --radius-lg: 20px;
    --radius-xl: 100px;

    /* transitions */
    --transition-50-ms: all 0.5s cubic-bezier(0.14, 0.59, 1, 1.01);
    --transition-25-ms: all 0.25s cubic-bezier(0.14, 0.59, 1, 1.01);

    /* Shadow types */
    --shadow-normal: 0 0 4px 0 rgb(0 0 0 / 4%), 0 5px 16px 0 rgb(0 0 0 / 5%);
    --shadow-appbar: 0 0 20px rgb(110 110 110 / 10%);
    --shadow-small: 0 1px 2px 0 rgb(0 0 0 / 5%);
    --shadow-focus-soft: 0 0 0 3px rgba(250, 80, 34, 0.2);

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
    --icon-pill-lg-size: 32px;
    --icon-pill-lg-svg: 20px;

    /** Mapped widget tokens (legacy internal usage) **/
    --alma-modal-font-family-sans:
      var(--font-family-venn), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, sans-serif;
    --alma-modal-font-family-display: var(--font-family-argent-cf), var(--font-family-sans-serif);
    --alma-payment-font-family-sans:
      var(--font-family-venn), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, sans-serif;

    --alma-modal-title-font-size: var(--font-title-md);
    --alma-modal-body-font-size: var(--font-base);
    --alma-modal-info-font-size: var(--font-sm);
    --alma-modal-total-font-size: 20px;
    --alma-modal-installment-font-size: var(--font-sm);

    --alma-payment-info-font-size: var(--font-2xs);
    --alma-payment-error-font-size: var(--font-2xs);
    --alma-payment-plan-label-font-size: var(--font-xs);

    --alma-font-weight-regular: var(--weight-normal);
    --alma-font-weight-medium: var(--weight-medium);
    --alma-font-weight-semibold: var(--weight-semi-bold);
    --alma-font-weight-bold: var(--weight-bold);

    --alma-line-height-tight: var(--line-height-small);
    --alma-line-height-regular: var(--line-height-medium);
    --alma-line-height-comfortable: var(--line-height-lg);
    --alma-line-height-spacious: var(--line-height-xl);

    --alma-color-brand-primary: var(--alma-orange);
    --alma-color-brand-secondary: var(--alma-blue);
    --alma-color-brand-accent: var(--alma-yellow);

    --alma-color-surface-primary: var(--white);
    --alma-color-surface-subtle: var(--background);

    --alma-color-text-primary: var(--colors-text-primary);
    --alma-color-text-secondary: var(--colors-text-secondary);
    --alma-color-text-muted: var(--dark-gray);
    --alma-color-text-error: var(--colors-text-error);

    --alma-color-border-subtle: var(--colors-border-regular);
    --alma-color-border-strong: var(--colors-border-strong);
    --alma-color-border-plan-separator: var(--colors-border-regular);

    --alma-color-overlay-backdrop: rgba(0, 0, 0, 0.3);

    --alma-color-timeline-line: var(--colors-border-regular);
    --alma-color-timeline-dot-soft: #ffd2c6;
    --alma-color-timeline-dot-active: var(--alma-orange);

    --alma-color-button-primary-bg: var(--alma-orange);
    --alma-color-button-primary-text: var(--white);
    --alma-color-button-secondary-bg: var(--white);
    --alma-color-button-secondary-text: var(--off-black);
    --alma-color-button-border: var(--dark-gray);

    --alma-color-focus-outline: var(--alma-orange);
    --alma-color-focus-outline-monochrome: var(--off-black);

    /** Spacing **/
    --alma-space-xxs: 2px;
    --alma-space-xs: var(--spacing-1);
    --alma-space-sm: 6px;
    --alma-space-md: var(--spacing-2);
    --alma-space-lg: var(--spacing-3);
    --alma-space-xl: var(--spacing-4);
    --alma-space-2xl: var(--spacing-5);
    --alma-space-3xl: var(--spacing-6);
    --alma-space-4xl: var(--spacing-8);
    --alma-space-5xl: var(--spacing-10);
    --alma-space-6xl: var(--spacing-12);

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
