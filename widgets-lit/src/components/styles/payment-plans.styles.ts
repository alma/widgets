import { css } from 'lit'

export const paymentPlansStyles = css`
  :host {
    --font-x-small: var(--alma-payment-info-font-size, 10px);

    /* Component is a block-level element */
    display: block;
    font-family: var(--alma-payment-font-family-sans);
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  .container {
    width: var(--alma-payment-container-width);
    max-width: 100%;
    background-color: var(--alma-color-surface-primary);
    border: 1px solid var(--alma-color-border-subtle);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: var(--spacing-3);
    gap: var(--spacing-2);
  }

  /* Border behavior matches Preact:
     - default: border visible
     - hideBorder=true: border removed
  */
  .container.hide-border {
    border: none;
  }

  .loading {
    padding: var(--spacing-4);
    text-align: center;
    color: var(--alma-color-text-secondary);
    font-size: var(--alma-payment-info-font-size);
  }

  .error {
    padding: var(--spacing-4);
    color: var(--alma-color-text-error);
    font-size: var(--alma-payment-error-font-size);
  }

  .primary-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
  }

  .logo-button {
    display: flex;
    gap: 6px;
    align-items: center;
    background-color: transparent;
    border: none;
    margin: 0 var(--spacing-3) 0 0;
    padding: 3px;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    box-shadow: none;
    border-radius: 0;
    cursor: pointer;
    flex-shrink: 0;
  }

  .logo-button:hover {
    background-color: transparent;
    border: none;
    text-decoration: none;
    transform: scale(1.05);
    box-shadow: none;
  }

  .logo-button:focus,
  .logo-button:focus-visible {
    background-color: transparent;
    border-radius: var(--alma-radius-xs);
    outline: 1px solid var(--alma-color-focus-outline);
    outline-offset: 2px;
  }

  .logo-button.monochrome:focus,
  .logo-button.monochrome:focus-visible {
    outline: 1px solid var(--alma-color-focus-outline-monochrome);
  }

  .logo {
    width: var(--alma-payment-logo-width);
    height: var(--alma-payment-logo-height);
    display: block;
  }

  .payment-plans {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-2);
    align-items: flex-start;
    max-width: 310px;
    flex-wrap: wrap;
  }

  .plan-button {
    font-family: var(--alma-payment-font-family-sans);
    border: none;
    background: transparent;
    cursor: pointer;
    transition: var(--alma-transition-fast);
    padding: 2px 10px;
    color: var(--alma-color-text-primary);
    border-radius: var(--alma-radius-xs);
    font-weight: var(--alma-font-weight-bold);
    font-size: var(--alma-payment-plan-label-font-size);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 24px;
    min-width: 24px;
    margin: 0;
  }

  .plan-button:hover {
    transform: scale(1.05);
    background-color: transparent;
  }

  .plan-button:focus,
  .plan-button:focus-visible {
    outline: 1px solid var(--alma-color-focus-outline);
    outline-offset: 2px;
    background-color: transparent;
  }

  .plan-button.active {
    color: var(--alma-color-button-primary-text);
    background: var(--alma-color-button-primary-bg);
    /* Preact doesn't pulse the active tab; keep it minimal for pixel parity. */
    animation: none;
  }

  .plan-button.monochrome.active {
    background: var(--alma-color-text-primary);
  }

  .plan-button.monochrome:focus,
  .plan-button.monochrome:focus-visible {
    outline: 1px solid var(--alma-color-focus-outline-monochrome);
  }

  .plan-button.active.monochrome {
    background: var(--alma-color-text-primary);
  }

  .info {
    font-family: var(--alma-payment-font-family-sans);
    font-size: var(--alma-payment-info-font-size);
    line-height: 16px;
    color: var(--alma-color-text-secondary);
    text-align: center;
    margin: 0;
    padding: 0;
  }

  /* Prevent host page CSS from affecting our info text (same intent as Preact) */
  .info p {
    margin: 0;
    padding: 0;
    border: none;
    background-color: transparent;
    color: var(--alma-color-text-primary);
  }

  .amount {
    font-weight: 700;
  }

  .hidden {
    display: none;
  }

  .cards {
    display: flex;
    gap: var(--spacing-1);
    margin-top: var(--spacing-1);
  }

  .card-icon {
    width: var(--alma-payment-card-width);
    height: var(--alma-payment-card-height);
  }

  /* Accessibility: respect reduced motion preference (match Preact behavior) */
  @media (prefers-reduced-motion: reduce) {
    .plan-button {
      transition: none;
    }

    .plan-button:hover {
      transform: none;
    }
  }

  .plan-button[disabled],
  .plan-button.not-eligible {
    opacity: 0.35;
    cursor: default;
  }

  .plan-button[disabled]:hover,
  .plan-button.not-eligible:hover {
    transform: none;
    background-color: transparent;
  }
`
