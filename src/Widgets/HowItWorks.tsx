import React, { useState } from 'react'

import { ApiConfig } from 'types'
import EligibilityModal from './EligibilityModal'
type Props = {
  button: string
}

const HowItWorksWidget: React.FC<Props> = ({ button }) => {
  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  document.querySelector(button)?.addEventListener('click', () => {
    openModal()
  })

  return (
    <EligibilityModal
      isOpen={isOpen}
      onClose={() => {
        closeModal()
      }}
    ></EligibilityModal>
  )
}
export default HowItWorksWidget
