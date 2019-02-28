/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

var suiteTitle
var logFileName 
var logEntries = ''

// Override the original console.log() function
const originalConsolLog = console.log

// This becomes the effective console.log() function.
console.log = function (message) {
  originalConsolLog.apply(console, arguments)
  logEntries += message + '\r\n'
}

function trueConsolLog() {
  originalConsolLog.apply(console, arguments)
}

// Before each test case begins...
beforeEach(function(){
  trueConsolLog('PersistentLogs.beforeEach')
  FlushLogEntries()

  console.log()
  console.log(`******************** ${this.currentTest.fullTitle()} ************************************************************`)

  let title = GetSuiteTitle(this.currentTest)
  if (title !== suiteTitle) {
    suiteTitle = title
    logFileName = `./results/cypress/${suiteTitle}.${Cypress.moment().format("YY.MM.DD.HH.mm.ss..SSS")}.log`
  }
})

// After each test case ends...
afterEach(() => { 
  trueConsolLog('PersistentLogs.afterEach')
  WriteLogEntries() })
function WriteLogEntries() { 
  trueConsolLog(`WriteLogEntries to file: '${logFileName}' - Length Entries: ${logEntries.length}`)
  cy.writeFile(logFileName, logEntries, {flag: 'a'}).then(() => { logEntries = ''
  logFileName = `./results/cypress/${suiteTitle}.${Cypress.moment().format("YY.MM.DD.HH.mm.ss..SSS")}.X.log`})
} 

after(() => { 
  trueConsolLog('PersistentLogs.after')
  FlushLogEntries() })
function FlushLogEntries() {   
  if (logFileName && logEntries !== '') {
    // Because there may be 'afterEach' functions that were called after we wrote our previous log entries,
    // we need to write any remaining log entries to that same log file.
    WriteLogEntries()
  }
}

function GetSuiteTitle(test) {
  if (!test.parent) throw new 'Did not find test.parent'
  
  if (test.parent.title === '') { return test.title }
  return GetSuiteTitle(test.parent)
}
