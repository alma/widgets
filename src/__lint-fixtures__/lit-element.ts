// expect: no-restricted-syntax "No LitElement subclass"
import { LitElement } from 'lit'

export class Fixture extends LitElement {}

export const Anonymous = class extends LitElement {}
