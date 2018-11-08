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