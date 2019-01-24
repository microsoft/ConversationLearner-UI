// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const path = require('path')

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  on('before:browser:launch', (browser = {}, args) => {
    //require('../GenerateCypressTestSpecs')
    
    // BUG BUG - Need to work out why this code does not execute or where it is throwing an exception.
    alert('got here');
    var fs = require('../../node_modules/pn/fs')
    var logFile = fs.openSync('c:/temp/GenerateCypressTestSpecs.log', 'a');
    fs.appendFileSync(logFile, message);
    fs.closeSync(logFile);

    // if (browser.name === 'chrome') {
    //   args.push('--disable-blink-features=RootLayerScrolling')
    //   return args
    // }
  })

  on('task', {
    log: (message) => {
      console.log(message)
      return null
    }, 
    parse: (filePath) => {
      return path.parse(path.normalize(filePath))
    },
    exists: (path) => {
      return new Promise(resolve => { 
        fs.access(path, fs.constants.F_OK, (err) => { resolve(err ? false : true) }) 
      })
    },
  })
}