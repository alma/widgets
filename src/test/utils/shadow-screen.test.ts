import {
  allShadowScreens,
  deepActiveElement,
  renderedChildren,
  shadowRootOf,
  shadowScreen,
} from '@/test/utils/shadow-screen'

const openShadowRoot = (host: Element): ShadowRoot =>
  // eslint-disable-next-line no-restricted-syntax -- a bare shadow root, no element needed
  host.attachShadow({ mode: 'open' })

const addHost = (parent: Element | ShadowRoot, className: string, content = ''): Element => {
  const host = document.createElement('div')
  host.className = className
  parent.append(host)
  openShadowRoot(host).innerHTML = content
  return host
}

describe('shadowRootOf', () => {
  it('should return the shadow root of the given host', () => {
    const host = addHost(document.body, 'widget')

    expect(shadowRootOf(host)).toBe(host.shadowRoot)
  })

  it('should find the first host that matches the selector', () => {
    const first = addHost(document.body, 'widget')
    addHost(document.body, 'widget')

    expect(shadowRootOf('.widget')).toBe(first.shadowRoot)
  })

  it('should find a host inside another shadow root', () => {
    const outer = addHost(document.body, 'outer')
    const inner = addHost(outer.shadowRoot!, 'inner')

    expect(shadowRootOf('.inner')).toBe(inner.shadowRoot)
  })

  it('should throw when no element matches the selector', () => {
    expect(() => shadowRootOf('.missing')).toThrow('No element matches .missing')
  })

  it('should throw when the host has no open shadow root', () => {
    const host = document.createElement('section')
    document.body.append(host)

    expect(() => shadowRootOf(host)).toThrow('<section> has no open shadow root')
  })
})

describe('shadowScreen', () => {
  it('should query inside the shadow root', () => {
    addHost(document.body, 'widget', '<button>Pay</button>')

    expect(shadowScreen('.widget').getByRole('button', { name: 'Pay' })).toBeInTheDocument()
  })
})

describe('allShadowScreens', () => {
  it('should return one screen per matching host, nested ones included', () => {
    const outer = addHost(document.body, 'widget', '<p>Outer</p>')
    addHost(outer.shadowRoot!, 'widget', '<p>Inner</p>')

    const screens = allShadowScreens('.widget')

    expect(screens.map((screen) => screen.getByRole('paragraph').textContent)).toEqual([
      'Outer',
      'Inner',
    ])
  })
})

describe('renderedChildren', () => {
  it('should leave out the <style> elements', () => {
    const host = addHost(document.body, 'widget', '<style></style><div></div>')

    expect(renderedChildren(host).map((child) => child.localName)).toEqual(['div'])
  })
})

describe('deepActiveElement', () => {
  it('should return the focused element of the document', () => {
    const button = document.createElement('button')
    document.body.append(button)

    button.focus()

    expect(deepActiveElement()).toBe(button)
  })

  it('should return the focused element inside nested shadow roots, not their host', () => {
    const outer = addHost(document.body, 'outer')
    const inner = addHost(outer.shadowRoot!, 'inner', '<button>Pay</button>')

    inner.shadowRoot!.querySelector('button')!.focus()

    expect(deepActiveElement()).toBe(inner.shadowRoot!.querySelector('button'))
  })
})
