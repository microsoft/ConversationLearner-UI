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