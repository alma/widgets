import React, { FunctionComponent, ReactNode } from 'react'

import cx from 'classnames'
import noScroll from 'no-scroll'
import { useIntl } from 'react-intl'
import Modal from 'react-modal'

import CrossIcon from 'assets/Cross'
import s from 'components/Modal/Modal.module.css'
import STATIC_CUSTOMISATION_CLASSES from 'Widgets/EligibilityModal/classNames.const'

export type Props = Modal.Props & {
  children: ReactNode
  isOpen: boolean
  onClose: (event: React.MouseEvent | React.KeyboardEvent) => void
  className?: string
  contentClassName?: string
  scrollable?: boolean
}

const ControlledModal: FunctionComponent<Props> = ({
  children,
  isOpen,
  onClose,
  className,
  contentClassName,
  scrollable = false,
  ...props
}) => {
  const intl = useIntl()
  
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'test') Modal.setAppElement('body')

  return (
    <Modal
      className={cx(s.modal, className)}
      overlayClassName={s.overlay}
      onAfterOpen={() => {
        noScroll.on()
      }}
      onAfterClose={() => {
        noScroll.off()
      }}
      onRequestClose={onClose}
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      {...props}
    >
      <div className={s.header}>
        <button
          type="button"
          onClick={onClose}
          className={cx(s.closeButton, STATIC_CUSTOMISATION_CLASSES.closeButton)}
          data-testid="modal-close-button"
          aria-label={intl.formatMessage({
            id: 'accessibility.close-button.aria-label',
            defaultMessage: 'Fermer la fenêtre',
          })}
        >
          <CrossIcon aria-hidden="true" />
        </button>
      </div>
      <div className={cx(s.content, contentClassName, { [s.contentScrollable]: scrollable })}>
        {children}
      </div>
    </Modal>
  )
}

export default ControlledModal
