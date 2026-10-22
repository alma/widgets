// path: src/widgets/common/fixture.test.ts
// expect: no-restricted-syntax "No dynamic import()"
document.body.innerHTML = '<div id="alma-widget-test"></div>'
customElements.define('alma-test-fixture', class extends HTMLElement {})

export const loadPrice = () => import('@/shared/lib/price')
