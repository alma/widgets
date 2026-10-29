import { render, type TemplateResult } from 'lit'

// Renders in <body>, which setup.ts empties after each test.
export const renderTemplate = (template: TemplateResult): HTMLElement => {
  const container = document.createElement('div')
  document.body.append(container)
  render(template, container)
  return container
}
