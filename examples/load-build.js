// Loads the widgets build that `?build=` picks: dist/ by default, dist-ref/ for `ref`, or an npm
// version or range from jsDelivr (4.6.2, 4.6.2-beta.1, 4, 4.x, 4.6 or 4.6.x, etc).
// `document.write` keeps the bundle blocking, so it runs before the pages' inline scripts.

// Chrome may block a jsDelivr build on a 2G connection, because the script is cross-origin.
;(function () {
  var versionOrRange = /^(\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?|\d+(\.(\d+|x))?(\.x)?)$/
  var build = new URLSearchParams(window.location.search).get('build') || null
  var base

  if (build === null) {
    base = '../dist/'
  } else if (build === 'ref') {
    base = '../dist-ref/'
  } else if (versionOrRange.test(build)) {
    base = 'https://cdn.jsdelivr.net/npm/@alma/widgets@' + build + '/dist/'
  } else {
    throw new Error(
      '[load-build] Invalid build "' +
        build +
        '". Use "ref", a version such as 4.6.2 or a range such as 4.x.',
    )
  }

  var hint =
    build === null
      ? 'Run `npm run build`.'
      : build === 'ref'
        ? 'Run `npm run build:ref`.'
        : 'Check that @alma/widgets@' + build + ' exists on npm.'

  // Load errors don't bubble, but a capturing listener on window still gets them.
  window.addEventListener(
    'error',
    function (event) {
      if (
        event.target.getAttribute &&
        event.target.getAttribute('src') === base + 'widgets.umd.js'
      ) {
        console.error('[load-build] Could not load ' + base + 'widgets.umd.js. ' + hint)
      }
    },
    true,
  )

  document.write('<link rel="stylesheet" href="' + base + 'widgets.css" />')
  document.write('<script src="' + base + 'widgets.umd.js"><\/script>')

  // Keeps the build when the menu links to another page.
  if (build !== null) {
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('.menu a').forEach(function (link) {
        link.search = window.location.search
      })
    })
  }
})()
