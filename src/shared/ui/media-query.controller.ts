import type { ReactiveController, ReactiveControllerHost } from 'lit'

// Tells whether a media query matches, and updates the host when that changes.
export class MediaQueryController implements ReactiveController {
  private readonly host: ReactiveControllerHost

  private readonly query: string

  private list: MediaQueryList | null = null

  private value = false

  constructor(host: ReactiveControllerHost, query: string) {
    this.host = host
    this.query = query
    host.addController(this)
  }

  get matches(): boolean {
    return this.value
  }

  hostConnected(): void {
    // Firefox returns null in a hidden iframe.
    this.list = window.matchMedia?.(this.query) ?? null
    this.list?.addEventListener('change', this.onChange)
    // The value may have changed while the host was out of the page.
    this.setValue(this.list?.matches ?? false)
  }

  hostDisconnected(): void {
    this.list?.removeEventListener('change', this.onChange)
    this.list = null
  }

  private readonly onChange = (event: MediaQueryListEvent): void => {
    this.setValue(event.matches)
  }

  private setValue(matches: boolean): void {
    if (matches !== this.value) {
      this.value = matches
      this.host.requestUpdate()
    }
  }
}
