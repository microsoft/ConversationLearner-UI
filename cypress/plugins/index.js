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
var fs = require('../../node_modules/pn/fs')
//var tlm = require('../support/TestListManager')

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // on('before:browser:launch', (browser = {}, args) => {
  //   if (browser.name === 'chrome') {
  //     args.push('--disable-blink-features=RootLayerScrolling')
  //     return args
  //   }
  // })
  on('before:browser:launch', browser, args => {
      require('./FileServices')
      //return args
  })

  fs.writeFile('c:/temp/michael.txt', "This is Michael.4", (error) => {
    if (error) throw error;
    console.log('File Written')
  });
  alert(`WE ARE HERE!`)

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
  
  
  alert(`WE ARE HERE!`)

  fs.readFile(pathToTestList, (error, fileContents) => {
    if (error) throw error;
    var y = 0
    var x = 3/y
    console.log(`File Contents: ${fileContents}${x}`)
  })
  
}