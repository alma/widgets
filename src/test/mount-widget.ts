import type { ReactiveElement } from 'lit'

import { ApiMode, Widgets } from '@/index'
import type {
  ModalOptions,
  PaymentPlanWidgetOptions,
  WidgetNames,
  WidgetOptions,
} from '@/public-api/public-api.types'
import type { AddReturnType } from '@/public-api/widgets'
import { Locale } from '@/shared/i18n/i18n.const'

// Master's test merchant.
export const TEST_MERCHANT_ID = '11gKoO333vEXacMNMUMUSc4c4g68g2Les4'

export const TEST_CONTAINER = '#alma-widget-test'

type MountOptions<O extends WidgetOptions> = Omit<O, 'container'> & { container?: string }

export type MountedWidget = {
  // null when add() rendered nothing.
  host: HTMLElement | null
  handle: AddReturnType
}

// Mounts the widget as a merchant page does, in French by default. Resolves once the host has
// rendered.
export async function mountWidget(
  widget: 'PaymentPlans',
  options: MountOptions<PaymentPlanWidgetOptions>,
): Promise<MountedWidget>
export async function mountWidget(
  widget: 'Modal',
  options: MountOptions<ModalOptions>,
): Promise<MountedWidget>
export async function mountWidget(
  widget: WidgetNames,
  { container, ...options }: MountOptions<WidgetOptions>,
): Promise<MountedWidget> {
  if (!container && !document.querySelector(TEST_CONTAINER)) {
    const element = document.createElement('div')
    element.id = TEST_CONTAINER.slice(1)
    document.body.append(element)
  }
  const selector = container ?? TEST_CONTAINER
  // The container may already hold merchant content.
  const childrenBefore = new Set(document.querySelector(selector)?.children)
  const handle = Widgets.initialize(TEST_MERCHANT_ID, ApiMode.TEST).add(widget, {
    locale: Locale.fr,
    ...options,
    container: selector,
  } as WidgetOptions)

  const host = Array.from(document.querySelector(selector)?.children ?? []).find(
    (child) => !childrenBefore.has(child),
  ) as (HTMLElement & Partial<Pick<ReactiveElement, 'updateComplete'>>) | undefined
  await host?.updateComplete
  return { host: host ?? null, handle }
}
