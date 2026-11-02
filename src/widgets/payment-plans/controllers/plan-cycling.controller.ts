import type { ReactiveController, ReactiveControllerHost } from 'lit'

import { MediaQueryController } from '@/shared/ui/media-query.controller'

// The values that the host computes on each update.
export type PlanCyclingInputs = {
  iterateValues: number[]
  transitionDelay: number
}

// Master's useButtonAnimation: highlights each value in turn, for one full cycle.
export class PlanCyclingController implements ReactiveController {
  private readonly host: ReactiveControllerHost

  private readonly getInputs: () => PlanCyclingInputs

  private readonly reducedMotion: MediaQueryController

  private timer: ReturnType<typeof setTimeout> | undefined

  private connected = false

  private value = 0

  // Master's `update`: false while a plan is hovered and once the cycle has ended.
  private update = true

  // Never reset, as on master, so a hover doesn't make the cycle longer.
  private iterationCount = 1

  constructor(host: ReactiveControllerHost, getInputs: () => PlanCyclingInputs) {
    this.host = host
    this.getInputs = getInputs
    // Added first, so its value is up to date when this controller connects.
    this.reducedMotion = new MediaQueryController(host, '(prefers-reduced-motion: reduce)')
    host.addController(this)
  }

  get current(): number {
    return this.value
  }

  readonly onHover = (current: number): void => {
    this.update = false
    this.stop()
    this.setValue(current)
  }

  readonly onLeave = (): void => {
    if (this.update) {
      return
    }
    this.update = true
    this.sync()
  }

  hostConnected(): void {
    this.connected = true
    this.sync()
  }

  // Every update restarts the countdown, as each render did on master.
  hostUpdate(): void {
    this.sync()
  }

  hostDisconnected(): void {
    this.connected = false
    this.stop()
  }

  // Master's effect.
  private sync(): void {
    this.stop()
    const { iterateValues, transitionDelay } = this.getInputs()
    // A negative delay turns cycling off.
    if (transitionDelay < 0 || this.reducedMotion.matches || iterateValues.length === 0) {
      return
    }
    if (!iterateValues.includes(this.value) && this.update) {
      this.setValue(iterateValues[0])
    }
    if (this.iterationCount === iterateValues.length + 1) {
      this.update = false
    }
    if (this.update && this.connected) {
      // The floor is one second.
      this.timer = setTimeout(this.tick, Math.max(transitionDelay, 1000))
    }
  }

  private stop(): void {
    clearTimeout(this.timer)
    this.timer = undefined
  }

  private readonly tick = (): void => {
    this.timer = undefined
    const { iterateValues } = this.getInputs()
    this.iterationCount += 1
    // A value that isn't in the list gives -1, so the next one is the first.
    const next = iterateValues[(iterateValues.indexOf(this.value) + 1) % iterateValues.length]
    if (next === this.value) {
      // With one plan, no update comes to end the cycle.
      this.sync()
      return
    }
    this.setValue(next)
  }

  private setValue(value: number): void {
    if (value !== this.value) {
      this.value = value
      this.host.requestUpdate()
    }
  }
}
