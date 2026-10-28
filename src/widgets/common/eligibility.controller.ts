import { Task, TaskStatus } from '@lit/task'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

import {
  type ConfigPlan,
  type EligibilityPlanToDisplay,
  filterEligibility,
  getEligibility,
  sortEligibility,
  statusResponse,
} from '@/domain/plans'
import { warnOnce } from '@/shared/lib/errors'

type ApiData = { domain: string; merchantId: string }

// The element properties the controller reads.
export type EligibilityHost = ReactiveControllerHost & {
  purchaseAmount: number
  // Optional here, so a host that misses it fails with a warning instead of throwing.
  apiData?: ApiData
  configPlans?: ConfigPlan[] | null
  customerBillingCountry?: string
  customerShippingCountry?: string
  merchantCoversAllFees?: boolean
}

type TaskArgs = [
  purchaseAmount: number,
  apiData: ApiData | undefined,
  configPlans: ConfigPlan[] | null | undefined,
  customerBillingCountry: string | undefined,
  customerShippingCountry: string | undefined,
  merchantCoversAllFees: boolean | undefined,
]

type EligibilityState = { status: statusResponse; plans: EligibilityPlanToDisplay[] }

const FAILED: EligibilityState = { status: statusResponse.FAILED, plans: [] }

const loadPlans = async ([
  purchaseAmount,
  apiData,
  configPlans,
  customerBillingCountry,
  customerShippingCountry,
  merchantCoversAllFees,
]: TaskArgs): Promise<EligibilityState> => {
  if (!apiData) {
    warnOnce('The widget has no API configuration.')
    return FAILED
  }
  const { status, plans } = await getEligibility({
    purchaseAmount,
    domain: apiData.domain,
    merchantId: apiData.merchantId,
    configPlans,
    customerBillingCountry,
    customerShippingCountry,
    merchantCoversAllFees,
  })
  if (status !== statusResponse.SUCCESS) {
    return { status, plans: [] }
  }
  try {
    return {
      status,
      plans: sortEligibility(filterEligibility(plans, configPlans ?? undefined)),
    }
  } catch (error) {
    warnOnce('The eligible plans could not be read.', error)
    return FAILED
  }
}

// Loads the widget's plans, cache first, once per controller, as master's hook does once per
// mount. The request is never aborted: a removed host still writes the cache, and shows the plans
// once put back.
export class EligibilityController implements ReactiveController {
  private readonly task: Task<TaskArgs, EligibilityState>

  private started = false

  constructor(host: EligibilityHost) {
    // No autoRun: master sends no new request when an option changes.
    this.task = new Task(host, {
      autoRun: false,
      task: (args) => loadPlans(args),
      args: (): TaskArgs => [
        host.purchaseAmount,
        host.apiData,
        host.configPlans,
        host.customerBillingCountry,
        host.customerShippingCountry,
        host.merchantCoversAllFees,
      ],
    })
    host.addController(this)
  }

  hostConnected(): void {
    if (this.started) {
      return
    }
    this.started = true
    // LightDomElement renders while connecting, so wait for the properties that the caller sets
    // right after it appends the host. Master's effect also ran after the first render.
    queueMicrotask(() => {
      this.task.run().catch((error: unknown) => {
        warnOnce('The eligible plans could not be loaded.', error)
      })
    })
  }

  // Pending until the task completes. A task that throws counts as failed.
  get status(): statusResponse {
    return this.task.status === TaskStatus.ERROR
      ? statusResponse.FAILED
      : (this.task.value?.status ?? statusResponse.PENDING)
  }

  // Empty until success.
  get plans(): EligibilityPlanToDisplay[] {
    return this.task.value?.plans ?? []
  }
}
