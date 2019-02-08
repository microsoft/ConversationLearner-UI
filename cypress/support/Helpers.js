/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

// NOTE: the '-+-' is a signature for filtering console output
export function ConLog(funcName, message) { console.log(`-+- ${Cypress.moment().format("HH:mm:ss..SSS")} - ${funcName} - ${message}`) }

export function Dump(funcName, object) {
  var propertyList = ''
  for (var property in object) propertyList += `${(propertyList.length == 0 ? '' : ', ')}${property}: ${object[property]}`
  ConLog(funcName, propertyList)
}

export function RemoveDuplicates(inputArray) {
  var uniqueOutputArray = []
  for (var i = 0; i < inputArray.length; i++)
    if (uniqueOutputArray.indexOf(inputArray[i]) == -1)
      uniqueOutputArray.push(inputArray[i])

  return uniqueOutputArray
}

export function StringArrayFromElementText(selector, retainMarkup = false) {
  var elements = Cypress.$(selector)
  ConLog(`StringArrayFromElementText(${selector})`, elements.length)
  var returnValues = new Array()
  for (var i = 0; i < elements.length; i++) {
    if (retainMarkup) returnValues.push(elements[i].innerHTML)
    else returnValues.push(elements[i].innerText)
    ConLog(`StringArrayFromElementText(${selector})`, returnValues[i])
  }
  return returnValues
}

export function NumericArrayFromElementText(selector) {
  var elements = Cypress.$(selector)
  var returnValues = new Array()
  for (var i = 0; i < elements.length; i++) { returnValues.push(parseInt(elements[i].innerText)) }
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
