/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

// Use this in an `afterEach` function to cause all remaining tests of a suite to be skipped when
// the test that just finished running failed.
//
// CAUTION: This MUST NOT be called using an arrow/lambda function. Examples:
//   WRONG: afterEach(() => helpers.SkipRemainingTestsOfSuiteIfFailed())
//   RIGHT: afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
//   RIGHT: afterEach(function() {
//            helpers.SkipRemainingTestsOfSuiteIfFailed()
//            DoSomeOtherWork()
//          })
export function SkipRemainingTestsOfSuiteIfFailed() { 
  if (this.currentTest == undefined) throw 'Test Code Error: Cannot use arrow/lambda function to call the SkipRemainingTestsOfSuiteIfFailed() function.'
  if (this.currentTest.state === 'failed') this.skip() 
}

// NOTE: the '-+-' is a signature for filtering console output
export function ConLog(funcName, message) { console.log(`-+- ${Cypress.moment().format("HH:mm:ss..SSS")} - ${funcName} - ${message}`) }

export function Dump(funcName, object) {
  let propertyList = ''
  for (let property in object) propertyList += `${(propertyList.length == 0 ? '' : ', ')}${property}: ${object[property]}`
  ConLog(funcName, propertyList)
}

export function RemoveDuplicates(inputArray) {
  let uniqueOutputArray = []
  for (let i = 0; i < inputArray.length; i++)
    if (uniqueOutputArray.indexOf(inputArray[i]) == -1)
      uniqueOutputArray.push(inputArray[i])

  return uniqueOutputArray
}

export function StringArrayFromElementText(selector, retainMarkup = false) {
  let elements = Cypress.$(selector)
  ConLog(`StringArrayFromElementText(${selector})`, elements.length)
  let returnValues = []
  for (let i = 0; i < elements.length; i++)  {
    let text = retainMarkup ? elements[i].innerHTML : InnerText(elements[i])
    returnValues.push(text)
    ConLog(`StringArrayFromElementText(${selector})`, text)
  }
  return returnValues
}

export function NumericArrayFromElementText(selector) {
  let elements = Cypress.$(selector)
  let returnValues = []
  for (let i = 0; i < elements.length; i++) { returnValues.push(parseInt(InnerText(elements[i]))) }
  return returnValues
}

export function Moment(dateTime) {
  if (dateTime.includes('/')) {
    if (dateTime.includes(':')) return Cypress.moment(dateTime, 'MM/DD/YYY h:mm:ss a')
    else return Cypress.moment(dateTime, 'MM/DD/YYY')
  }

  if (dateTime.includes(':')) return Cypress.moment(dateTime, 'h:mm:ss a')
  return undefined
}

// This will return the Inner Text of an element without markup nor newline characters.
// Needed because each browser handles this functionality differently.
export function InnerText(element)
{
  ConLog('InnerText', `Browser: ${Cypress.browser.name}`)
  if (Cypress.browser.name === 'chrome') { return element.innerText }
  else { 
    ConLog('InnerText', 'not Chrome')
    return element.textContent 
  }
}
