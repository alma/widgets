// expect: no-restricted-syntax "No customElements.define"
class Fixture extends HTMLElement {}

customElements.define('alma-fixture', Fixture)
window.customElements.define('alma-other-fixture', class extends HTMLElement {})
