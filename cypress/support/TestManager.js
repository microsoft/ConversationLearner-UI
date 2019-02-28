/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
var suiteTitle
var test

Global.SkipIfPriorTestsOfSuiteFailed = {}
SkipIfPriorTestsOfSuiteFailed = function () {
//export function SkipIfPriorTestsOfSuiteFailed() {
//beforeEach(function() {
  console.log('$$$ SkipIfPriorTestsOfSuiteFailed -----------')
  let skipNextTest = ProcessResultsOfLastTest()

  let title = GetSuiteTitle(this.currentTest)
  if (title !== suiteTitle) {
    suiteTitle = title
    skipNextTest = false  // Once the test suite changes we must stop skipping tests.
  }
  
  test = this.currentTest
  if (skipNextTest) { 
    console.log(`Skipping test case: '${test.fullTitle()}'`)
    this.currentTest.skip() }
}//)

after(function() { ProcessResultsOfLastTest() })

// Returns true if this test's state was NOT passed.
function ProcessResultsOfLastTest() {
  if (!test) { return false }

  let message = `### Test Case: '${test.fullTitle()}' - ${test.state.toUpperCase()} ###`
  let border = '#'.repeat(message.length)
  console.log(border)
  console.log(message)
  console.log(border)
  
  return (test.state !== 'passed')
}


function GetSuiteTitle(test) {
  if (!test.parent) throw new 'Did not find test.parent'
  
  if (test.parent.title === '') { return test.title }
  return GetSuiteTitle(test.parent)
}
