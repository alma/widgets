import type { ReactiveController, ReactiveControllerHost } from 'lit'

import { type MediaQueryWatch, watchMediaQuery } from '@/shared/ui/watch-media-query'

export type MediaQueryHost = ReactiveControllerHost

// Tells whether a media query matches, and updates the host when that changes.
export class MediaQueryController implements ReactiveController {
  private readonly host: MediaQueryHost

  private readonly query: string

  private watch: MediaQueryWatch | null = null

  private value = false

  constructor(host: MediaQueryHost, query: string) {
    this.host = host
    this.query = query
    host.addController(this)
  }

  get matches(): boolean {
    return this.value
  }

  hostConnected(): void {
    this.watch = watchMediaQuery(this.query, this.setValue)
    // The value may have changed while the host was out of the page.
    this.setValue(this.watch.matches)
  }

  hostDisconnected(): void {
    this.watch?.stop()
    this.watch = null
  }

  private readonly setValue = (matches: boolean): void => {
    if (matches !== this.value) {
      this.value = matches
      this.host.requestUpdate()
    }
  }
}
