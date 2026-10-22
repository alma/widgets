// path: src/widgets/common/register.ts
// expect: no-restricted-syntax "No customElements.define"
export const register = (tagName: string, elementClass: CustomElementConstructor) =>
  customElements.define(tagName, elementClass)
