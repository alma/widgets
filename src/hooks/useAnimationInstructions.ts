import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { statusResponse } from '@/types'
import { useAnnounceText } from 'hooks/useAnnounceText'

type UseAnimationInstructionsProps = {
  status: statusResponse
  hasUserInteracted: boolean
  eligiblePlansCount: number
  transitionDelay?: number
}

/**
 * Custom hook for managing accessibility announcements about animation control instructions
 *
 * Announces instructions to screen readers about how to control automatic plan animation
 * when the widget is first loaded and animation is active.
 *
 * @param status - Current API response status
 * @param hasUserInteracted - Whether user has manually interacted with plans
 * @param eligiblePlansCount - Number of eligible payment plans
 * @param transitionDelay - Animation transition delay (-1 means disabled)
 *
 * @returns void - This hook manages side effects only
 */
export const useAnimationInstructions = ({
  status,
  hasUserInteracted,
  eligiblePlansCount,
  transitionDelay,
}: UseAnimationInstructionsProps): void => {
  const intl = useIntl()
  const { announce } = useAnnounceText()

  useEffect(() => {
    const shouldAnnounceInstructions =
      status === statusResponse.SUCCESS &&
      !hasUserInteracted &&
      eligiblePlansCount > 1 &&
      // If transitionDelay is -1, animation is disabled, so no need to announce instructions
      transitionDelay !== -1

    if (shouldAnnounceInstructions) {
      const instructionText = intl.formatMessage({
        id: 'accessibility.animation-control-instructions',
        defaultMessage:
          "Animation automatique des plans de paiement active. Survolez ou naviguez avec les flèches pour arrêter l'animation.",
      })

      // Delay the announcement to avoid conflict with initial plan announcements
      const timer = setTimeout(() => {
        announce(instructionText, 2000)
      }, 1500)

      return () => clearTimeout(timer)
    }

    // Return undefined if condition is not met (no cleanup needed)
    return undefined
  }, [status, hasUserInteracted, eligiblePlansCount, intl, announce, transitionDelay])
}
