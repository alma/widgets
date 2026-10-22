// expect: no-restricted-imports "No unsafe directive or static-html"
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { unsafeSVG } from 'lit-html/directives/unsafe-svg.js'

export const directives = [unsafeHTML, unsafeSVG]
