import type { ReactiveController, ReactiveControllerHost } from 'lit'

// Holds a text for screen readers and empties it after a delay.
export class AnnounceController implements ReactiveController {
  private readonly host: ReactiveControllerHost

  private timer: ReturnType<typeof setTimeout> | undefined

  private value = ''

  constructor(host: ReactiveControllerHost) {
    this.host = host
    host.addController(this)
  }

  get text(): string {
    return this.value
  }

  // A new announcement cancels the pending clear of the previous one.
  announce(text: string, clearDelay = 1000): void {
    clearTimeout(this.timer)
    this.setValue(text)
    this.timer = setTimeout(() => {
      this.timer = undefined
      this.setValue('')
    }, clearDelay)
  }

  clearAnnouncement(): void {
    clearTimeout(this.timer)
    this.timer = undefined
    this.setValue('')
  }

  hostDisconnected(): void {
    // A widget put back in the page must show no stale message.
    this.clearAnnouncement()
  }

  private setValue(text: string): void {
    if (text !== this.value) {
      this.value = text
      this.host.requestUpdate()
    }
  }
}
