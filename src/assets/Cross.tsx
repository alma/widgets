import React from 'react'

/**
 * Cross/Close Icon Component
 *
 * ACCESSIBILITY NOTE (RGAA):
 * This icon is marked as decorative (aria-hidden="true") because it should NOT provide
 * semantic meaning on its own. When used in close buttons, the parent button element
 * MUST provide proper accessible text via aria-label or visible text content.
 *
 * Example of correct usage:
 * <button aria-label="Close modal"><CrossIcon /></button>
 *
 * This differs from informational icons (like payment cards) which need their own
 * accessible labels since they convey meaningful information to users.
 */

type Props = {
  color?: string
  className?: string
}

function CrossIcon({ color = '#fff', className }: Props): React.JSX.Element {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12.5964 11.404L9.41445 8.22205L12.5964 5.04007C12.7732 4.86329 12.7732 4.50974 12.5964 4.33296L11.8893 3.62585C11.6904 3.42698 11.359 3.44908 11.1822 3.62585L8.00023 6.80783L4.81825 3.62585C4.61938 3.42698 4.28792 3.44908 4.11114 3.62585L3.40404 4.33296C3.20516 4.53183 3.20516 4.84119 3.40404 5.04007L6.58602 8.22205L3.40404 11.404C3.20516 11.6029 3.20517 11.9123 3.40404 12.1111L4.11115 12.8182C4.28792 12.995 4.61938 13.0171 4.81825 12.8182L8.00023 9.63626L11.1822 12.8182C11.359 12.995 11.6904 13.0171 11.8893 12.8182L12.5964 12.1111C12.7732 11.9344 12.7732 11.5808 12.5964 11.404Z"
        fill={color}
      />
    </svg>
  )
}

export default CrossIcon
