/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

export function ZeroPad(int, pad)
{
    var str = `${int}`
    while(str.length < pad) str = '0' + str
    return str
}

export function TimeToString(time) {return `${ZeroPad(time.getHours(), 2)}:${ZeroPad(time.getMinutes(), 2)}:${ZeroPad(time.getSeconds(), 2)}..${ZeroPad(time.getMilliseconds(), 3)}`}
export function NowAsString() {return TimeToString(new Date())}

export function sleep(time) { return new Promise((resolve, reject) => setTimeout(resolve, time))}

export function ConLog(funcName, message) { console.log(`${NowAsString()} - ${funcName} - ${message}`) }

//export function Caller() { return arguments.callee.caller.toString() }