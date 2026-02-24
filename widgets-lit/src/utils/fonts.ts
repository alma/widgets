/**
 * Inject global fonts required by the widgets.
 * We inject once into <head> to avoid Shadow DOM font loading issues.
 */
export const injectAlmaFonts = () => {
  if (document.getElementById('alma-fonts-injected')) {
    return
  }

  const style = document.createElement('style')
  style.id = 'alma-fonts-injected'
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

    @font-face {
      font-family: Argent;
      src: url('https://cdn.almapay.com/fonts/Argent/ArgentCF-DemiBold.woff') format('woff');
      font-weight: 600;
      font-style: normal;
      font-display: swap;
    }
  `
  document.head.appendChild(style)
}
