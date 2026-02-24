import { css } from 'lit'

export const scheduleStyles = css`
  :host {
    display: block;
    font-family: var(--alma-modal-font-family-sans);
    width: 100%;
  }

  .schedule-widget {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    background: var(--alma-color-surface-primary);
    border: 1px solid var(--alma-color-border-subtle);
    border-radius: var(--alma-radius-md);
    padding: calc(var(--spacing-4) * 0.95);
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing-4) * 0.95);
    margin: 0;
    font-size: 0.95em;
  }

  .schedule-widget.small {
    transform: scale(0.8);
    transform-origin: top center;
  }

  .schedule-widget.monochrome .installment-dot {
    background-color: var(--colors-border-strong);
  }

  .schedule-widget.monochrome .installment-item:first-child .installment-dot {
    background-color: var(--off-black);
  }

  .schedule-widget.hide-border {
    border: none;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  .loading,
  .no-plans,
  .error {
    text-align: center;
    color: var(--alma-color-text-muted);
    font-size: var(--alma-modal-body-font-size);
    padding: var(--spacing-4);
  }

  .schedule-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
    color: var(--alma-color-text-primary);
  }

  .payment-schedule-description {
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }

  .vertical-line {
    height: 0px;
  }

  .schedule-details {
    flex: 1;
  }

  .installments-list {
    padding: 0;
    margin-bottom: 16px;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .installment-item {
    display: flex;
    justify-content: space-between;
    font-size: var(--alma-modal-installment-font-size);
    line-height: var(--alma-line-height-comfortable);
  }

  .installment-date {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
  }

  .installment-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--alma-color-timeline-dot-soft);
    z-index: 1;
  }

  .installment-dot::after {
    border-left: 2px solid var(--colors-border-regular);
    height: 58px;
    margin-left: 4px;
    content: ' ';
    position: absolute;
    z-index: 0;
    margin-top: 10px;
  }

  .installment-item:first-child .installment-dot {
    background-color: var(--alma-color-timeline-dot-active);
  }

  .installment-amount {
    font-weight: var(--alma-font-weight-semibold);
  }

  .schedule-total-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .credit-info {
    font-size: var(--alma-modal-info-font-size);
    line-height: 1.5;
    color: var(--colors-text-primary);
    background-color: transparent;
    padding: var(--spacing-3);
    border-left: 2px solid var(--colors-border-regular);
    margin-left: 4px;
    margin-bottom: -8px;
  }

  .credit-info-title {
    font-weight: 700;
  }

  .total-block {
    font-family: var(--alma-modal-font-family-display);
    background-color: var(--colors-surface-strong);
    border-radius: var(--radius-lg);
    padding: var(--spacing-4);
  }

  .total-block p,
  .total-block span {
    border: none;
    padding: 0;
    margin: 0;
    color: var(--colors-text-primary);
    text-decoration: none;
  }

  .total-row.main-total {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-base);
    font-weight: var(--weight-semi-bold);
  }

  .total-row.fees-row {
    display: flex;
    justify-content: space-between;
    font-weight: var(--weight-bold);
    font-size: var(--alma-modal-info-font-size);
    line-height: var(--line-height-lg);
    margin-top: var(--spacing-2);
  }

  .fees-row .total-label,
  .fees-row .total-value {
    font-size: var(--alma-modal-info-font-size);
    font-weight: var(--weight-bold);
  }

  .credit-legal-text {
    font-size: var(--font-xs);
    font-family: var(--alma-modal-font-family-sans);
    margin-top: var(--spacing-2);
    font-weight: var(--weight-normal);
    background: transparent;
    padding: 0;
    border-radius: 0;
    color: var(--colors-text-primary);
    line-height: 1.5;
  }

  @media (max-width: 799px) {
    .schedule-widget {
      max-width: 100%;
      border-radius: var(--alma-radius-sm);
    }
  }
`
