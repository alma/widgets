// The contract tests only use the JSDOM constructor and its window, so no @types/jsdom.
declare module 'jsdom' {
  export class JSDOM {
    constructor(html?: string, options?: { runScripts?: 'dangerously' | 'outside-only' })

    window: Window & { eval: (code: string) => unknown }
  }
}
