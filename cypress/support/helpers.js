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

function myTimeout(func, time) 
{
    console.log(`myTimeout called: ${TimeToString(new Date())}`)
    setTimeout(func, time)
}

export function sleep(time) { new Promise((resolve, reject) => myTimeout(resolve, time)).then(() => {console.log(`Sleep Finished: ${new Date().getMilliseconds()}`)}) }

//export function sleep(time) { new Promise((resolve, reject) => setTimeout(resolve, time)).then(() => {console.log(`Sleep Finished: ${new Date().getMilliseconds()}`)}) }
//export function sleep(time) { return new Promise((resolve, reject) => setTimeout(resolve, time))}
