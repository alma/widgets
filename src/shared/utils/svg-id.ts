import type { TemplateResult } from 'lit'
import { Directive, directive } from 'lit/directive.js'

let lastId = 0

// Card logos share the page, so each gets a unique ID.
// The directive instance keeps it across re-renders.
class SvgIdDirective extends Directive {
  private id?: string

  render(prefix: string, renderSvg: (id: string) => TemplateResult): TemplateResult {
    if (this.id === undefined) {
      lastId += 1
      this.id = `${prefix}-${lastId}`
    }
    return renderSvg(this.id)
  }
}

export const withSvgId = directive(SvgIdDirective)
