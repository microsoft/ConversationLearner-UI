/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
const helpers = require('../support/helpers.js')

var lastChangeTime
var endTime
var lastHtml

var promiseCountCD = 0;
function CompareDocument(millisecondsWithoutChange)
{
    var thisFuncName = `CompareDocument(${millisecondsWithoutChange})[${++promiseCountCD}]`
    helpers.ConLog(thisFuncName, `Start`)

    return new Promise((resolve) =>
    {
        setTimeout(() =>
        {
            helpers.ConLog(thisFuncName, `Work Begins`)
            var currentTime = new Date().getTime()
            var currentHtml = Cypress.$('html')[0].outerHTML
            if(currentHtml != lastHtml)
            {
                endTime = currentTime + millisecondsWithoutChange

                helpers.ConLog(thisFuncName, `Milliseconds since last change: ${(currentTime - lastChangeTime)}`)
                //helpers.ConLog(thisFuncName, `Current HTML:\n${currentHtml}`)

                lastHtml = currentHtml
                lastChangeTime = currentTime
            }
            if(currentTime < endTime) 
            {
                helpers.ConLog(thisFuncName, `Next CompareDocument`)
                CompareDocument(millisecondsWithoutChange).then(resolve)
            }
            else 
            {
                helpers.ConLog(thisFuncName, `DONE`)
                resolve()
            }
        }, 50)
    })
}

var promiseCountW = 0;
export function WaitForStableDom(millisecondsWithoutChange) 
{        
    var thisFuncName = `WaitForStableDom(${millisecondsWithoutChange})[${++promiseCountW}]`
    helpers.ConLog(thisFuncName, `Start`)

    lastHtml = Cypress.$('html')[0].outerHTML
    lastChangeTime = new Date().getTime()
    endTime = lastChangeTime + millisecondsWithoutChange

    return new Promise((resolve, reject) =>
    {
        CompareDocument(millisecondsWithoutChange).then(() =>
        {
            helpers.ConLog(thisFuncName, `DONE`)
            resolve()
            return
        })
        helpers.ConLog(thisFuncName, `Return Promise`)
        return
    })
}