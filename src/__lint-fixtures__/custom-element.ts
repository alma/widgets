// expect: no-restricted-syntax "No @customElement"
import { customElement } from 'lit/decorators.js'

@customElement('alma-fixture')
export class Fixture extends HTMLElement {}
