/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

// export function ZeroPad(int, pad)
// {
//     var str = `${int}`
//     while(str.length < pad) str = '0' + str
//     return str
// }

// export function TimeToString(time) {return `${ZeroPad(time.getHours(), 2)}:${ZeroPad(time.getMinutes(), 2)}:${ZeroPad(time.getSeconds(), 2)}..${ZeroPad(time.getMilliseconds(), 3)}`}
// export function NowAsString() {return TimeToString(new Date())}

export function Sleep(time) { return new Promise((resolve, reject) => setTimeout(resolve, time))}

// NOTE: the '-+-' is a signature for filtering console output
export function ConLog(funcName, message) { console.log(`-+- ${Cypress.moment().format("HH:mm:ss..SSS")} - ${funcName} - ${message}`) }

export function ModelNameTime() { return Cypress.moment().format("MMMDD-HHmmss-SSS") }
