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
    background-color: var(--surface-white);
    border: 1px solid var(--border-default);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: var(--spacing-12);
    gap: var(--spacing-8);
  }

  .container.compact {
    padding: calc(var(--spacing-3) * 0.8);
    gap: calc(var(--spacing-2) * 0.8);
  }

  :host([color-scheme='white']) .container,
  :host([color-scheme='light-gray']) .container,
  :host([color-scheme='gray']) .container {
    background-color: transparent;
  }

  /* Border behavior matches Preact:
     - default: border visible
     - hideBorder=true: border removed
  */
  .container.hide-border {
    border: none;
  }

  .loading {
    padding: var(--spacing-16);
    text-align: center;
    color: var(--text-secondary);
    font-size: var(--paragraph-2xs-font-size);
  }

  .error {
    padding: var(--spacing-16);
    color: var(--text-error);
    font-size: var(--paragraph-2xs-font-size);
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
    margin: 0 var(--spacing-12) 0 0;
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
    border-radius: var(--radius-xs);
    outline: 1px solid var(--border-focus);
    outline-offset: 2px;
  }

  .logo-button.monochrome:focus,
  .logo-button.monochrome:focus-visible {
    outline: 1px solid var(--border-black);
  }

  .logo {
    width: var(--alma-payment-logo-width);
    height: var(--alma-payment-logo-height);
    display: block;
  }

  .container.compact .logo {
    width: 16px;
    height: 16px;
  }

  .payment-plans {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-8);
    align-items: flex-start;
    max-width: 310px;
    flex-wrap: wrap;
  }

  .container.compact .payment-plans {
    gap: calc(var(--spacing-2) * 0.8);
  }

  .plan-button {
    font-family: var(--alma-payment-font-family-sans);
    border: none;
    background: transparent;
    cursor: pointer;
    transition: var(--transition-25-ms);
    padding: 2px 10px;
    color: var(--text-default);
    border-radius: var(--radius-xs);
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

  .container.compact .plan-button {
    height: calc(24px * 0.8);
    min-width: calc(24px * 0.8);
    padding: 2px 8px;
    font-size: calc(var(--alma-payment-plan-label-font-size) * 0.8);
  }

  .plan-button:hover {
    transform: scale(1.05);
    background-color: transparent;
  }

  .plan-button:focus,
  .plan-button:focus-visible {
    outline: 1px solid var(--border-focus);
    outline-offset: 2px;
    background-color: transparent;
  }

  .plan-button.active {
    color: var(--theme-primary-contrast, var(--text-inverted));
    background: var(--theme-primary, var(--orange-alma));
    /* Preact doesn't pulse the active tab; keep it minimal for pixel parity. */
    animation: none;
  }

  .plan-button.monochrome.active {
    background: var(--text-default);
  }

  .plan-button.monochrome:focus,
  .plan-button.monochrome:focus-visible {
    outline: 1px solid var(--alma-color-focus-outline-monochrome);
  }

  .info {
    font-family: var(--alma-payment-font-family-sans);
    font-size: var(--alma-payment-info-font-size, 10px);
    line-height: 16px;
    color: var(--text-secondary);
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
    color: var(--text-default);
  }

  .amount {
    font-weight: 700;
  }

  .hidden {
    display: none;
  }

  .cards {
    display: flex;
    gap: var(--spacing-4);
    margin-top: var(--spacing-4);
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
    cursor: not-allowed;
  }

  .plan-button[disabled]:hover,
  .plan-button.not-eligible:hover {
    transform: none;
    background-color: transparent;
  }

  :host([color-scheme='white']) .plan-button:not(.active),
  :host([color-scheme='light-gray']) .plan-button:not(.active),
  :host([color-scheme='gray']) .plan-button:not(.active),
  :host([color-scheme='dark-gray']) .plan-button:not(.active),
  :host([color-scheme='black']) .plan-button:not(.active) {
    color: var(--theme-primary, var(--alma-color-text-primary));
  }

  :host([color-scheme='white']) .info,
  :host([color-scheme='light-gray']) .info,
  :host([color-scheme='gray']) .info,
  :host([color-scheme='dark-gray']) .info,
  :host([color-scheme='black']) .info,
  :host([color-scheme='white']) .info p,
  :host([color-scheme='light-gray']) .info p,
  :host([color-scheme='gray']) .info p,
  :host([color-scheme='dark-gray']) .info p,
  :host([color-scheme='black']) .info p {
    color: var(--theme-primary, var(--alma-color-text-primary));
  }
`
