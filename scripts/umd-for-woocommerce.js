/* For WooCommerce, we need to avoid XSS issues warnings
 *  (https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations)
 *  In our widget, innerHTML is introduced by the library `react-dom` and `react` that are included
 *  into the `widgets.umd.js` file as our widget is built with React.
 *  We can not remove `react-dom` and `react` as they are required for our widget to work.
 *  We can not change the node_modules nor modify how they are included in our library.
 *  We need a workaround to replace innerHTML with innerText in the `widgets.umd.js` file for WooCommerce integration.
 *  See this example as reference https://github.com/jtagcat/simple-tab-groups/blob/1d358d31bdd736fdb7fbe196450636e09359c8e5/addon/scripts/remove-evals.js#L43
 */

const { writeFile, readFile } = require('fs')

const sourceUmd = 'widgets.umd.js'
const targetUmd = 'widgets-wc.umd.js'
const sourceMapUmd = 'widgets.umd.js.map'
const targetMapUmd = 'widgets-wc.umd.js.map'

const replaceInnerHtmlInFile = (sourceName, targetName) => {
  const fileBase = './dist/'
  readFile(`${fileBase}${sourceName}`, { encoding: 'utf8' }, (err, fileContent) => {
    if (err) {
      // If file does not exist or if there is any issue with the file,
      // process exit 1 and log the error
      console.error(err)
      process.exit(1)
    } else {
      const fileContentForWC = fileContent
        .replace(/innerHTML/g, 'innerText')
        .replace(/sourceMappingURL=widgets.umd.js.map/g, 'sourceMappingURL=widgets-wc.umd.js.map')
      writeFile(`${fileBase}${targetName}`, fileContentForWC, 'utf8', (error) => {
        if (error) {
          console.error(error)
          process.exit(1)
        } else {
          console.log(`${fileBase}${targetName} has been created successfully.`)
          process.exit(0)
        }
      })
    }
  })
}

const prepareWCFiles = () => {
  // We need to replace innerHTML with innerText in the UMD file
  replaceInnerHtmlInFile(sourceUmd, targetUmd)
  // We also need to replace innerHTML with innerText in the UMD map file
  replaceInnerHtmlInFile(sourceMapUmd, targetMapUmd)
}

prepareWCFiles()
