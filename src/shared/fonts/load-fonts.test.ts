import { loadFonts } from '@/shared/fonts/load-fonts'

class FakeFontFace {
  constructor(
    readonly family: string,
    readonly source: string,
    readonly descriptors: FontFaceDescriptors,
  ) {}
}

const stubFontSet = (faces: { family: string }[] = []) => {
  const set = new Set(faces)
  Object.defineProperty(document, 'fonts', { configurable: true, value: set })
  return set
}

const families = (fonts: Set<{ family: string }>) => [...fonts].map(({ family }) => family)

describe('loadFonts', () => {
  beforeEach(() => {
    vi.stubGlobal('FontFace', FakeFontFace)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(document, 'fonts')
  })

  it('should add Venn regular and bold and Argent demibold from the Alma CDN', () => {
    const fonts = stubFontSet()

    loadFonts()

    expect([...fonts]).toEqual([
      {
        family: 'Venn',
        source:
          "url('https://cdn.almapay.com/fonts/Venn/Venn-Regular.woff2') format('woff2'), url('https://cdn.almapay.com/fonts/Venn/Venn-Regular.woff') format('woff')",
        descriptors: { weight: '400', style: 'normal', display: 'swap' },
      },
      {
        family: 'Venn',
        source:
          "url('https://cdn.almapay.com/fonts/Venn/Venn-Bold.woff2') format('woff2'), url('https://cdn.almapay.com/fonts/Venn/Venn-Bold.woff') format('woff')",
        descriptors: { weight: '700', style: 'normal', display: 'swap' },
      },
      {
        family: 'Argent',
        source:
          "url('https://cdn.almapay.com/fonts/Argent/ArgentCF-DemiBold.woff2') format('woff2'), url('https://cdn.almapay.com/fonts/Argent/ArgentCF-DemiBold.woff') format('woff')",
        descriptors: { weight: '600', style: 'normal', display: 'swap' },
      },
    ])
  })

  it('should add the faces once when it runs twice', () => {
    const fonts = stubFontSet()

    loadFonts()
    loadFonts()

    expect(fonts.size).toBe(3)
  })

  it.each([
    ['Venn', ['Venn', 'Argent']],
    ['"Venn"', ['"Venn"', 'Argent']],
    ['Argent', ['Argent', 'Venn', 'Venn']],
  ])('should skip only the family that the page already has as %s', (family, expected) => {
    const fonts = stubFontSet([{ family }])

    loadFonts()

    expect(families(fonts)).toEqual(expected)
  })

  it('should do nothing where FontFace does not exist', () => {
    vi.unstubAllGlobals()
    const fonts = stubFontSet()

    expect(() => loadFonts()).not.toThrow()
    expect(fonts.size).toBe(0)
  })
})
