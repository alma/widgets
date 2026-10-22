// path: src/test/fixture-helper.ts
// expect: no-restricted-syntax "No CustomEvent"
document.body.innerHTML = '<div id="alma-widget-test"></div>'
customElements.define('alma-test-fixture', class extends HTMLElement {})

export const event = new CustomEvent('alma-close')
