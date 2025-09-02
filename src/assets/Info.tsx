import React from 'react'

/**
 * Info Icon Component
 *
 * ACCESSIBILITY NOTE (RGAA):
 * This icon is marked as decorative (aria-hidden="true") because it should NOT provide
 * semantic meaning on its own. When used in info buttons, the parent button element
 * MUST provide proper accessible text via aria-label or visible text content.
 *
 * Example of correct usage:
 * <button aria-label="Info button"><InfoIcon /></button>
 *
 * This differs from informational icons (like payment cards) which need their own
 * accessible labels since they convey meaningful information to users.
 */

type Props = {
  color?: string
  className?: string
}

function InfoIcon({ color = '#fff', className }: Props): React.JSX.Element {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1.75C5.44365 1.75 1.75 5.44365 1.75 10C1.75 14.5563 5.44365 18.25 10 18.25C14.5563 18.25 18.25 14.5563 18.25 10C18.25 5.44365 14.5563 1.75 10 1.75ZM0.25 10C0.25 4.61522 4.61522 0.25 10 0.25C15.3848 0.25 19.75 4.61522 19.75 10C19.75 15.3848 15.3848 19.75 10 19.75C4.61522 19.75 0.25 15.3848 0.25 10ZM9.25 6.25C9.25 5.83579 9.58579 5.5 10 5.5H10.0075C10.4217 5.5 10.7575 5.83579 10.7575 6.25V6.2575C10.7575 6.67171 10.4217 7.0075 10.0075 7.0075H10C9.58579 7.0075 9.25 6.67171 9.25 6.2575V6.25ZM8.95608 8.55844C10.1023 7.98532 11.3929 9.02061 11.0821 10.2639L10.3731 13.0999L10.4146 13.0792C10.7851 12.8939 11.2356 13.0441 11.4208 13.4146C11.6061 13.7851 11.4559 14.2356 11.0854 14.4208L11.0439 14.4416C9.8977 15.0147 8.60707 13.9794 8.91789 12.7361L9.6269 9.90008L9.58541 9.92082C9.21493 10.1061 8.76442 9.95589 8.57918 9.58541C8.39394 9.21493 8.54411 8.76442 8.91459 8.57918L8.95608 8.55844Z"
        fill={color}
      />
    </svg>
  )
}

export default InfoIcon
