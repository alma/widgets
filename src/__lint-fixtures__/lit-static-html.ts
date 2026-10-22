// expect: no-restricted-imports "No unsafe directive or static-html"
import { html as staticHtml } from 'lit/static-html.js'
import { unsafeStatic } from 'lit-html/static.js'

export const parts = [staticHtml, unsafeStatic]
