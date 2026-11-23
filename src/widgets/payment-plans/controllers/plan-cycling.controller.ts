import type { ReactiveController, ReactiveControllerHost } from 'lit'

// The controller reads nothing from its host yet: its inputs come through getInputs.
export type PlanCyclingHost = ReactiveControllerHost

// The values that the host computes on each update.
export type PlanCyclingInputs = {
  iterateValues: number[]
  transitionDelay: number
}

// Read on each sync rather than through a change listener, which would outlive the widget.
const prefersReducedMotion = (): boolean =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

// Highlights each value in turn, for one full cycle.
export class PlanCyclingController implements ReactiveController {
  private readonly host: PlanCyclingHost

  private readonly getInputs: () => PlanCyclingInputs

  private timer: ReturnType<typeof setTimeout> | undefined

  private connected = false

  private value = 0

  // False while a plan is hovered and once the cycle has ended.
  private update = true

  // Never reset, so a hover doesn't make the cycle longer.
  private iterationCount = 1

  constructor(host: PlanCyclingHost, getInputs: () => PlanCyclingInputs) {
    this.host = host
    this.getInputs = getInputs
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

  // Every update restarts the countdown.
  hostUpdate(): void {
    this.sync()
  }

  hostDisconnected(): void {
    this.connected = false
    this.stop()
  }

  private sync(): void {
    this.stop()
    const { iterateValues, transitionDelay } = this.getInputs()
    // A negative delay turns cycling off.
    if (transitionDelay < 0 || prefersReducedMotion() || iterateValues.length === 0) {
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
