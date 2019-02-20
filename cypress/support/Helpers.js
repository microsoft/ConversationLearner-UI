/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

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
    let text = retainMarkup ? elements[i].innerHTML : ElementText(elements[i])
    returnValues.push(text)
    ConLog(`StringArrayFromElementText(${selector})`, text)
  }
  return returnValues
}

export function NumericArrayFromElementText(selector) {
  let elements = Cypress.$(selector)
  let returnValues = []
  for (let i = 0; i < elements.length; i++) { returnValues.push(parseInt(ElementText(elements[i]))) }
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

// The Electron browser is adding newline characters to innerText so
// this function will remove them.
export function ElementText(element) { return element.innerText.replace(/\r|\n/g,'') }