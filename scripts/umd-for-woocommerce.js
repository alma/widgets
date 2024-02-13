const { readFileSync, writeFileSync } = require('fs')
const fileName = './dist/widgets.umd.js'

// For WooCommerce, we need to replace innerHTML with innerText
// to avoid XSS issues warnings
// https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations
// In our widget, innerHTML is introduced by the library `react-dom` and `react` that are included
// into the `widgets.umd.js` file as our widget is built with React.
// We can not remove `react-dom` and `react` as they are required for our widget to work.
// We can not change the node_modules nor modify how they are included in our library.
// We need a workaround to replace innerHTML with innerText in the `widgets.umd.js` file for WooCommerce integration.
// See this example as reference https://github.com/jtagcat/simple-tab-groups/blob/1d358d31bdd736fdb7fbe196450636e09359c8e5/addon/scripts/remove-evals.js#L43
const replaceInnerHtml = () => {
  const fileContent = readFileSync(fileName, 'utf8')
  const fileContentForWC = fileContent.replace(/innerHTML/g, 'innerText')
  console.log('innerHTML is replaced with innerText')
  writeFileSync('./dist/widgets-wc.umd.js', fileContentForWC, 'utf8')
  console.log('widgets-wc.umd.js is created.')
  process.exit(0)
}

replaceInnerHtml()
