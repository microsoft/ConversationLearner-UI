/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
const helpers = require('../support/helpers.js')

/*
export function waitForStableDom(millisecondsWithoutChange) 
{        
    var lastChangeTime = new Date().getTime()
    var endTime = lastChangeTime + millisecondsWithoutChange * 2
    var lastHtml = Cypress.$('html')[0].outerHTML
    console.log(new Date())
    
    while(true)
    {
        var currentTime = new Date().getTime()
        var currentHtml = Cypress.$('html')[0].outerHTML
        if(currentHtml != lastHtml)
        {
            endTime = currentTime + millisecondsWithoutChange

            console.log(new Date())
            console.log(`Current Time: ${new Date()} - Milliseconds since last change: ${(currentTime - lastChangeTime)}`)
            //console.log(currentHtml)

            lastHtml = currentHtml
            lastChangeTime = currentTime
        }
        if(currentTime > endTime) break
        console.log(`Before Sleep: ${new Date().getMilliseconds()}`)
        helpers.sleep(50).then(() => { console.log(`After Sleep: ${new Date().getMilliseconds()}`)})
    }
}
*/

var lastChangeTime
var endTime
var lastHtml
var millisecondsWithoutChange

var promiseCountCD = 0;
function compareDocument()
{
    var thisPromiseCount = ++promiseCountCD;
    console.log(`${helpers.NowAsString()} - Start compareDocument: ${thisPromiseCount}`)

    return new Promise((resolve) =>
    {
        setTimeout(() =>
        {
            console.log(`${helpers.NowAsString()} - doWork compareDocument: ${thisPromiseCount}`)
            var currentTime = new Date().getTime()
            var currentHtml = Cypress.$('html')[0].outerHTML
            if(currentHtml != lastHtml)
            {
                endTime = currentTime + millisecondsWithoutChange

                console.log(`Current Time: ${helpers.NowAsString()} - Milliseconds since last change: ${(currentTime - lastChangeTime)}`)
                //console.log(currentHtml)

                lastHtml = currentHtml
                lastChangeTime = currentTime
            }
            if(currentTime < endTime) 
            {
                console.log(`${helpers.NowAsString()} - next compareDocument: ${thisPromiseCount}`)
                compareDocument().then(resolve)
            }
            else 
            {
                console.log(`${helpers.NowAsString()} - DONE compareDocument: ${thisPromiseCount}`)
                resolve()
            }
        }, 50)
    })
}

var promiseCountW = 0;
export function WaitForStableDomP(millisecondsWithoutChangeParam) 
{        
    millisecondsWithoutChange = millisecondsWithoutChangeParam
    var thisPromiseCount = ++promiseCountW;
    console.log(`${helpers.NowAsString()} - Start WaitForStableDomP: ${thisPromiseCount}`)

    lastChangeTime = new Date().getTime()
    endTime = lastChangeTime + millisecondsWithoutChange * 2
    lastHtml = Cypress.$('html')[0].outerHTML

    return new Cypress.Promise((resolve, reject) =>
    {
        compareDocument().then(() =>
        {
            console.log(`${helpers.NowAsString()} - DONE WaitForStableDomP: ${thisPromiseCount}`)
            resolve()
            return null;
        })
        console.log(`${helpers.NowAsString()} - Return Promise WaitForStableDomP: ${thisPromiseCount}`)
        return null;
    })
}