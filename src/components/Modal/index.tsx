import { FunctionComponent, ReactNode } from 'react'
import Modal from 'react-modal'
import React from 'react'
import noScroll from 'no-scroll'
import cx from 'classnames'

import s from './Modal.module.css'
import CrossIcon from 'assets/Cross'

export type Props = Modal.Props & {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
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
        <button onClick={onClose} className={s.closeButton} data-testid="modal-close-button">
          <CrossIcon />
        </button>
      </div>
      <div className={cx(s.content, contentClassName, { [s.contentScrollable]: scrollable })}>
        {children}
      </div>
    </Modal>
  )
}

export default ControlledModal
