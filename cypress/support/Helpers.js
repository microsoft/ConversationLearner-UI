import { func } from "prop-types";

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
  if (this.currentTest == undefined) {
    throw new Error('Test Code Error: Cannot use arrow/lambda function to call the SkipRemainingTestsOfSuiteIfFailed() function.')
  }
  if (this.currentTest.state === 'failed') {
    this.skip() 
  }
}

// NOTE: the '-+-' is a signature for filtering console output
export function ConLog(funcName, message) { console.log(`-+- ${Cypress.moment().format("HH:mm:ss..SSS")} - ${funcName} - ${message}`) }

export function DumpObject(funcName, object) {
  let propertyList = ''
  for (let property in object) propertyList += `${(propertyList.length == 0 ? '' : ', ')}${property}: ${object[property]}`
  ConLog(funcName, propertyList)
}

export function NumberToStringWithLeadingZeros(number, length) {
  let string = String(number)
  if (string.length < length) { string = '0'.repeat(length - string.length) + string }
  return string
}

export function DumpElements(funcName, elements) {
  let elementList = `Dump of ${elements.length} elements:\n`
  for (let i = 0; i < elements.length; i++) { 
    elementList += `${NumberToStringWithLeadingZeros(i,3)}: ${elements[i].outerHTML.replace(/\n/g, '\n     ')}\n` 
  }
  ConLog(funcName, elementList)
}

export function RemoveDuplicates(inputArray) {
  let uniqueOutputArray = []
  for (let i = 0; i < inputArray.length; i++)
    if (uniqueOutputArray.indexOf(inputArray[i]) == -1)
      uniqueOutputArray.push(inputArray[i])

  return uniqueOutputArray
}

export function StringArrayFromElementText(selector, retainMarkup = false) {
  let funcName = `StringArrayFromElementText(${selector})`
  let elements = Cypress.$(selector)
  ConLog(funcName, `Number of Elements Found: ${elements.length}`)
  let returnValues = []
  for (let i = 0; i < elements.length; i++)  {
    let text = retainMarkup ? elements[i].innerHTML : TextContentWithoutNewlines(elements[i])
    returnValues.push(text)
    ConLog(funcName, `"${text}"`)
  }
  return returnValues
}

export function NumericArrayFromElementText(selector) {
  let elements = Cypress.$(selector)
  let returnValues = []
  for (let i = 0; i < elements.length; i++) { returnValues.push(parseInt(TextContentWithoutNewlines(elements[i]))) }
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

// This will return only the printable Inner Text of an element without markup nor newline characters.
// Needed because each browser handles this functionality differently.
// This trims the string and...
// ...also converts the ‘ and ’ to a ' and...
// ...also converts the “ and ” to a " and...
// ...also keeps the '◾️' and '…' charcters and throws away anything else outside of the typical printable set.
export function TextContentWithoutNewlines(element) {
  if (element === undefined) { 
    ConLog('TextContentWithoutNewlines', 'undefined element has been passed in.')
    return undefined
  }

  const textContent = element.textContent
  if (!textContent) {
    ConLog('TextContentWithoutNewlines', `textContent is undefined, which typically means there is no text. Here is the element that was passed in: ${element.outerHTML}`)
    return ''
  }

  // See the Cheat Sheet on https://www.regextester.com/15 for help with this 'NOT ^' regex string
  const returnValue = textContent.trim()
                                 .replace(/‘|’/g, "'")
                                 .replace(/“|”/g, '"')
                                 .replace(/([^◾️…\x20-\x7E])/gm, '')
  ConLog('TextContentWithoutNewlines', `"${returnValue}"`)
  return returnValue
}

// This will return an array of the Inner Text (with New Lines removed) of an array of elements.
// Pass in either an array of elements or the selector to get the array of elements with.
export function ArrayOfTextContentWithoutNewlines(elementsOrSelector) {
  if (elementsOrSelector === undefined || elementsOrSelector.length == 0) { return undefined }

  let elements
  if (typeof elementsOrSelector == 'string') { elements = Cypress.$(elementsOrSelector) }
  else { elements = elementsOrSelector }

  let arrayOfTextContent = []
  for (let i = 0; i < elements.length; i++) {
    arrayOfTextContent.push(TextContentWithoutNewlines(elements[i]))
  }
  return arrayOfTextContent
}

// Model names have a suffix which will end with a single character representing the 
// build number. This is needed to support test model deletion and to guarantee we
// don't delete a model generated by another test run on another virtual machine.
let buildKey = undefined
export function GetBuildKey() {
  if (!buildKey) {
    buildKey = Cypress.env('BUILD_NUM')
    ConLog('GetBuildKey', `BUILD_NUM: ${Cypress.env('BUILD_NUM')} -- ${buildKey}`)
    if (buildKey) {
      buildKey = String.fromCharCode('a'.charCodeAt() + buildKey % 26)
      ConLog('GetBuildKey', `buildKey: ${buildKey}`)
    } else {
      // There is no BUILD_NUM environment variable so this is a local test run.
      // For local test runs always using the same build key works.
      buildKey = 'x';
    }
  }
  return buildKey
}

export function VerifyErrorMessageContains(expectedMessage) { cy.Get('div.cl-errorpanel').contains(expectedMessage) }
export function VerifyErrorMessageExactMatch(expectedMessage) { cy.Get('div.cl-errorpanel').ExactMatch(expectedMessage) }
export function VerifyNoErrorMessages() { cy.DoesNotContain('div.cl-errorpanel') }
export function HasErrorMessage() { return Cypress.$('div.cl-errorpanel').length > 0 }
export function CloseErrorMessagePanel() { cy.Get('button.ms-Panel-closeButton[title="Close"]').Click() }

// This behaves slightly different than the cy.contains command does in that the elements returned
// can contain multiple parent elements as well compared to the cy.contains command. To zoom in
// to a smaller set of elements you can sometimes get away with calling it like this:
//    cy.contains('your search string').ExactMatch('your search string')
export function ExactMatch(elements, expectedText) {
  const funcName = `ExactMatch('${expectedText}')`
  ConLog(funcName, `Start`)
  
  for (let i = 0; i < elements.length; i++) {
    const elementText = TextContentWithoutNewlines(elements[i])
    ConLog(funcName, `elementText: '${elementText}'`)
    if (elementText === expectedText) return [elements[i]]
  }
  return []
}

export function ExactMatches(elements, expectedText) {
  const funcName = `ExactMatches('${expectedText}')`
  ConLog(funcName, `Start`)
  let returnElements = []
  for (let i = 0; i < elements.length; i++) {
    const elementText = helpers.TextContentWithoutNewlines(elements[i])
    ConLog(funcName, `elementText: '${elementText}'`)
    if (elementText === expectedText) returnElements.push(elements[i])
  }
  return returnElements
}