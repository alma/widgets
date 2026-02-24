import { css } from 'lit'
export const modalStyles = css`
  :host {
    display: block;
    font-family: var(--alma-modal-font-family-sans);
  }

  /* Modal Overlay (match Preact opacity) */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--alma-color-overlay-backdrop);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    padding: var(--spacing-20);
    backdrop-filter: none;
  }

  .modal-overlay.open {
    display: flex;
  }

  /* Modal Container (match Preact geometry and shadow) */
  .modal {
    background: var(--surface-white);
    border-radius: var(--alma-modal-radius-desktop);
    max-width: 800px;
    width: calc(100% - 40px);
    height: 550px;
    display: flex;
    flex-direction: column;
    box-shadow: var(--alma-shadow-modal);
    position: relative;
    animation: modalSlideIn 0.25s ease-out;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes drawerSlideUp {
    from {
      opacity: 0;
      transform: translateY(100px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 799px) {
    .modal-overlay {
      padding: 0;
      align-items: flex-end;
    }

    .modal {
      width: 100%;
      max-width: 100%;
      border-radius: var(--alma-modal-radius-mobile);
      max-height: 83vh;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      animation: drawerSlideUp 0.25s ease-out;
      flex-direction: column;
    }

    /* Mobile layout: vertical flex */
    .modal-content-mobile {
      display: flex;
      flex-direction: column;
      padding: var(--spacing-32);
      flex: 1;
      overflow-y: auto;
      gap: var(--spacing-24);
    }

    /* Wrapper for schedule and total: no gap between them */
    .schedule-total-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .schedule-container {
      padding: 0 !important;
    }

    .schedule-details {
      margin-bottom: var(--spacing-16);
    }

    .vertical-line {
      height: calc(100% + 60px);
      left: 7px;
      top: 10px;
      background: var(--alma-color-timeline-line) !important;
      width: 2px !important;
    }

    .credit-info {
      margin-bottom: 6px !important;
      padding: 0 var(--spacing-16) !important;
    }
  }

  @media (min-width: 800px) {
    /* Desktop styles - no need to explicitly show since only desktop modal is rendered */
    /* All base styles apply on desktop */
  }

  /* Skip links - hidden by default, visible only on keyboard focus */
  .skip-links {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999;
    width: 100%;
    display: none;
  }

  .skip-links.skip-links--enabled {
    display: block;
  }

  .skip-links-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .skip-link-item {
    margin: 0;
    padding: 0;
  }

  .skip-link {
    position: absolute;
    top: -999px;
    left: -999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
    text-decoration: none;
  }

  .skip-link:focus,
  .skip-link:focus-visible {
    position: static;
    width: auto;
    height: auto;
    padding: var(--spacing-8) var(--spacing-16);
    margin: var(--spacing-4);
    background: var(--foundation-black);
    color: var(--foundation-white);
    text-decoration: none;
    border-radius: var(--radius-xs);
    font-size: var(--paragraph-sm-font-size);
    font-weight: var(--weight-semi-bold);
    box-shadow: var(--alma-shadow-focus-strong);
    outline: 1px solid var(--border-focus);
    z-index: 10000;
  }

  .skip-link:hover:focus {
    background: var(--text-secondary);
  }

  /* Close Button - absolute positioned top right at 6px from corner */
  .close-button {
    position: absolute;
    top: 6px;
    right: 6px;
    background: var(--gray-900);
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
    z-index: 10;
  }

  .close-button:hover,
  .close-button:focus {
    background-color: var(--foundation-black);
  }

  .close-icon path {
    fill: var(--foundation-white);
  }

  /* Modal Content Container - 40% left, 60% right */
  .modal-content {
    display: grid;
    grid-template-columns: 45% 55%;
    padding: var(--spacing-32);
    flex: 1;
    overflow: hidden;
  }

  /* Left Column: Title, Info, Cards, Logo */
  .left-column {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-24);
    max-width: 400px;
    padding-right: var(--spacing-24);
    overflow-y: auto;
  }

  .modal-title {
    font-family: var(--alma-modal-font-family-display) !important;
    font-size: var(--paragraph-xl-font-size);
    font-weight: var(--weight-semi-bold);
    line-height: 130%;
    color: var(--text-default);
    margin: 0;
    text-align: center;
  }

  /* Right Column: Buttons, Separator, Schedule, Total */
  .right-column {
    padding-top: 3px;
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow-y: auto;
  }

  .plan-buttons-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--spacing-8);
  }

  /* Cards - aligned left */
  .cards-row {
    display: flex;
    justify-content: flex-start;
  }

  /* Logo - centered */
  .logo-row {
    display: flex;
    justify-content: center;
  }

  .alma-logo {
    display: block;
  }

  /* Info list (match Preact Info.module.css) */
  .info-list {
    list-style: none;
    margin: 0;
    padding: 0 var(--spacing-24);
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: var(--alma-modal-font-family-sans);
  }

  .info-item {
    display: flex;
    align-items: center;
    line-height: var(--alma-line-height-comfortable);
    gap: var(--spacing-16);
    font-size: var(--alma-modal-info-font-size);
    color: var(--alma-color-text-primary);
  }

  .info-bullet {
    font-family: var(--alma-modal-font-family-display);
    font-weight: var(--alma-font-weight-semibold);
    font-size: 32px;
    width: 32px;
    line-height: var(--alma-line-height-tight);
    color: var(--alma-color-brand-secondary);
    flex-shrink: 0;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .info-item:first-child .info-bullet {
    color: var(--alma-color-brand-primary);
  }

  .info-item:last-child .info-bullet {
    color: var(--alma-color-brand-accent);
  }

  .info-text {
    flex: 1;
    font-size: var(--alma-modal-info-font-size);
    line-height: 1.5;
    color: var(--alma-color-text-secondary);
  }

  .info-text strong {
    color: var(--alma-color-text-primary);
    font-weight: var(--alma-font-weight-semibold);
  }

  .loading,
  .no-plans {
    text-align: center;
    padding: 60px 20px;
    color: var(--alma-color-text-muted);
    font-size: var(--alma-modal-body-font-size);
  }

  /* Plan Selection Buttons - positioned in plan-buttons-container */
  .plan-buttons {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: var(--spacing-24);
    padding-bottom: var(--spacing-12);
    border-bottom: 1px solid var(--alma-color-border-plan-separator);
    max-width: 100%;
  }

  .plan-button {
    display: initial;
    height: var(--button-regular-height, 50px);
    min-width: 50px;
    border-radius: var(--alma-radius-md);
    font-family: var(--alma-modal-font-family-display);
    line-height: var(--alma-line-height-regular);
    font-weight: var(--alma-font-weight-semibold);
    cursor: pointer;
    transition: var(--alma-transition-button);
    padding: initial;
    margin: 0;
    border: 1px solid var(--alma-color-button-border);
    font-size: var(--alma-modal-body-font-size);
    background-color: var(--alma-color-button-secondary-bg);
    color: var(--alma-color-button-secondary-text);
  }

  .plan-button-text {
    display: inline;
    border: none;
    text-decoration: none;
    margin: var(--spacing-32);
    color: var(--alma-color-text-primary);
  }

  .plan-button.active {
    background-color: var(--alma-color-button-primary-bg);
    color: var(--alma-color-button-primary-text);
    border: 0;
  }

  .plan-button.active .plan-button-text {
    color: var(--alma-color-button-primary-text);
  }

  .plan-button-text,
  .total-label,
  .total-value {
    font-size: var(--alma-modal-total-font-size);
  }

  .installment-date,
  .installment-amount,
  .total-fees-label,
  .total-fees-value {
    font-size: var(--alma-modal-body-font-size) !important;
  }

  /* Schedule (match Preact Schedule.module.css) */
  .schedule-container {
    padding: 0 0 16px 0;
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
    color: var(--alma-color-text-primary);
  }

  .payment-schedule-description {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 0;
    align-items: stretch;
  }

  .vertical-line {
    width: 0px;
    background: linear-gradient(
      to bottom,
      var(--alma-color-brand-primary) 0%,
      var(--alma-color-brand-primary) 50%,
      var(--alma-color-timeline-line) 50%,
      var(--alma-color-timeline-line) 100%
    );
    border-radius: 2px;
    flex-shrink: 0;
    position: relative;
  }

  .schedule-details {
    flex: 1;
  }

  .schedule-title {
    font-family: var(--alma-modal-font-family-sans);
    font-size: var(--alma-modal-body-font-size);
    font-weight: var(--alma-font-weight-bold);
    color: var(--alma-color-text-primary);
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .installments-list {
    padding: 0 var(--spacing-24);
    margin: 6px 0 0 0;
    font-family: var(--alma-modal-font-family-sans);
    color: var(--alma-color-text-primary);
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-8);
  }

  .installment-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: var(--alma-modal-installment-font-size);
    line-height: var(--alma-line-height-comfortable);
    margin-bottom: 0;
    width: 100%;
    padding: 0;
    background: transparent;
    border-radius: 0;
    border-left: none;
    transition: none;
  }

  .installment-date {
    display: flex;
    align-items: center;
    margin-left: -23px;
    gap: 0;
    color: var(--alma-color-text-primary);
    font-size: var(--alma-modal-installment-font-size);
  }

  .installment-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--alma-color-timeline-dot-soft);
    margin-right: var(--spacing-16);
    z-index: 1;
  }

  .installment-item:first-child .installment-dot {
    background-color: var(--alma-color-timeline-dot-active);
    box-shadow: none;
  }

  /* Desktop draws the line segment under each dot (matches Preact). */
  @media (min-width: 800px) {
    .installment-dot::after {
      border-left: 2px solid var(--border-default);
      height: 28px;
      margin-left: 4px;
      content: ' ';
      position: absolute;
      z-index: 0;
      margin-top: 10px;
    }
  }

  /* Credit info warning (on white background, above gray box) */
  .credit-info {
    margin-bottom: 16px;
    font-family: var(--alma-modal-font-family-sans);
    font-size: var(--alma-modal-info-font-size);
    color: var(--text-default);
    line-height: 1.5;
    background-color: transparent;
    border-radius: var(--radius-lg);
    padding: var(--spacing-16);
    position: relative;
    z-index: 2;
  }

  .credit-info-title {
    font-weight: 700;
  }

  /* Total block (gray box with all financial details) */
  .total-block {
    font-family: var(--alma-modal-font-family-display);
    background-color: var(--surface-strong);
    border-radius: var(--radius-lg);
    padding: var(--spacing-16);
    z-index: 2;
    position: relative;
  }

  .total-block p,
  .total-block span {
    border: none;
    padding: 0;
    margin: 0;
    color: var(--text-default);
    text-decoration: none;
  }

  .total-row.main-total {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: var(--paragraph-md-font-size);
    font-weight: var(--weight-semi-bold);
    color: var(--text-default);
    padding: 0;
  }

  .total-row {
    border-bottom: none;
  }

  .total-row.fees-row {
    display: flex;
    font-family: var(--alma-modal-font-family-sans);
    flex-direction: row;
    justify-content: space-between;
    font-weight: var(--weight-bold);
    font-size: var(--alma-modal-info-font-size);
    line-height: var(--line-height-lg);
    padding: 0;
    margin-top: var(--spacing-8);
  }

  .fees-row .total-label,
  .fees-row .total-value {
    font-size: var(--alma-modal-info-font-size);
    color: var(--text-default);
    font-weight: var(--weight-bold);
  }

  /* Credit legal text (inside gray box) */
  .credit-legal-text {
    font-size: var(--paragraph-xs-font-size);
    font-family: var(--alma-modal-font-family-sans);
    margin-top: var(--spacing-8);
    font-weight: var(--weight-normal);
    background: transparent;
    padding: 0;
    border-radius: 0;
    color: var(--text-default);
    line-height: 1.5;
  }

  /* Cards row (match Preact Cards.module.css) */
  .cards-container {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: center;
    gap: 10px;
    margin: var(--spacing-24) 0;
    padding: 0;
    border-top: none;
    align-items: center;
    flex-wrap: nowrap;
  }

  /* Hide the label in the Lit modal to match Preact (no "Accepted cards" text) */
  .cards-label {
    display: none;
  }

  .card-icon {
    width: 32px;
    height: 20px;
    border: none;
    border-radius: 0;
    padding: 0;
  }

  /* Alma Logo styling */
  .alma-logo {
    width: 75px;
    height: auto;
    display: block;
  }

  /* ====================================
     ACCESSIBILITY STYLES
     ==================================== */

  /* (Skip links styles are defined once above; keep this section for other a11y rules) */

  /* Focus visible styles for all interactive elements */
  button:focus-visible {
    outline: 2px solid var(--alma-color-focus-outline);
    outline-offset: 2px;
  }

  a:focus-visible {
    outline: 2px solid var(--alma-color-focus-outline);
    outline-offset: 2px;
  }

  /* Better focus styles for plan buttons */
  .plan-button:focus-visible {
    outline: 2px solid var(--alma-color-focus-outline);
    outline-offset: 1px;
    box-shadow: var(--alma-shadow-focus-soft);
  }

  /* Close button focus */
  .close-button:focus-visible {
    outline: 2px solid var(--alma-color-focus-outline);
    outline-offset: 3px;
    border-radius: 50%;
  }
`
