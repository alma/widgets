const FONTS_URL = 'https://cdn.almapay.com/fonts'

const FONT_FAMILIES = [
  {
    family: 'Venn',
    faces: [
      { weight: '400', file: 'Venn/Venn-Regular' },
      { weight: '700', file: 'Venn/Venn-Bold' },
    ],
  },
  { family: 'Argent', faces: [{ weight: '600', file: 'Argent/ArgentCF-DemiBold' }] },
]

const hasFamily = (fonts: FontFaceSet, family: string): boolean =>
  [...fonts].some((face) => face.family.replace(/["']/g, '') === family)

// A shadow root ignores @font-face, so the faces go to the document's font set.
// Another bundle or main.css may have added a family already: adding it twice
// downloads the files twice.
export const loadFonts = (): void => {
  if (typeof FontFace === 'undefined' || !document.fonts) {
    return
  }
  for (const { family, faces } of FONT_FAMILIES) {
    if (hasFamily(document.fonts, family)) {
      continue
    }
    for (const { weight, file } of faces) {
      const source = `url('${FONTS_URL}/${file}.woff2') format('woff2'), url('${FONTS_URL}/${file}.woff') format('woff')`
      document.fonts.add(new FontFace(family, source, { weight, style: 'normal', display: 'swap' }))
    }
  }
}
