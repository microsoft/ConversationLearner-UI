/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

export function Sleep(time) { return new Promise((resolve, reject) => setTimeout(resolve, time))}

// NOTE: the '-+-' is a signature for filtering console output
export function ConLog(funcName, message) { console.log(`-+- ${Cypress.moment().format("HH:mm:ss..SSS")} - ${funcName} - ${message}`) }

export function Dump(funcName, object)
{
  var propertyList = ''
  for(var property in object) propertyList += `${(propertyList.length == 0 ? '' : ', ')}${property}: ${object[property]}`
  ConLog(funcName, propertyList)
}

export function RemoveDuplicates(inputArray)
{
  var uniqueOutputArray = []
  for(var i = 0; i < inputArray.length; i++)
    if(uniqueOutputArray.indexOf(inputArray[i]) == -1) 
      uniqueOutputArray.push(inputArray[i])
  
  return uniqueOutputArray
}

export function StringArrayFromInnerHtml(selector) 
{ 
  var elements = Cypress.$(selector)
  ConLog('StringArrayFromInnerHtml', elements.length)
  var returnValues = new Array()
  for (var i = 0; i < elements.length; i++) { returnValues.push(elements[i].innerHTML) 
    ConLog('StringArrayFromInnerHtml', returnValues[i])
  }
  return returnValues
}

export function NumericArrayFromInnerHtml(selector) 
{ 
  var elements = Cypress.$(selector)
  var returnValues = new Array()
  for (var i = 0; i < elements.length; i++) { returnValues.push(Number(elements[i].innerHTML)) }
  return returnValues
}