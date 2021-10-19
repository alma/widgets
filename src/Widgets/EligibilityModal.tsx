import { FunctionComponent, useState } from 'react'
import Modal from 'components/Modal'
import React from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
}
const EligibilityModal: FunctionComponent<Props> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollable>
      test
    </Modal>
  )
}
export default EligibilityModal
