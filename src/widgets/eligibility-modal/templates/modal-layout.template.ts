import type { TemplateResult } from 'lit'

import {
  type DesktopLayoutParams,
  desktopLayoutTemplate,
} from '@/widgets/eligibility-modal/templates/desktop-layout.template'
import { mobileLayoutTemplate } from '@/widgets/eligibility-modal/templates/mobile-layout.template'

export interface ModalLayoutParams extends DesktopLayoutParams {
  // Whether desktopMediaQuery matches.
  isBigScreen: boolean
}

export const modalLayoutTemplate = ({
  isBigScreen,
  ...params
}: ModalLayoutParams): TemplateResult =>
  isBigScreen ? desktopLayoutTemplate(params) : mobileLayoutTemplate(params)
