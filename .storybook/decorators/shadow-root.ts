import type { Decorator } from '@storybook/web-components-vite'
import { adoptStyles, type CSSResultGroup, type CSSResultOrNative, render } from 'lit'

// A template story renders outside its element. With parameters.shadowStyles set to the element's
// static styles, it renders in a shadow root that has them, as inside the element.
export const withShadowRoot: Decorator = (story, { parameters }) => {
  const styles = parameters.shadowStyles as CSSResultGroup | undefined
  if (!styles) return story()
  const host = document.createElement('div')
  const root = host.attachShadow({ mode: 'open' })
  adoptStyles(root, ([styles] as unknown[]).flat(Infinity) as CSSResultOrNative[])
  render(story(), root)
  return host
}
