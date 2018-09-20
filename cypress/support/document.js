/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

export function waitForStableDomX(millisecondsWithoutChange) 
{        
    var lastChangeTime = new Date().getTime()
    var endTime = lastChangeTime + millisecondsWithoutChange * 2
    var lastHtml = Cypress.$('html')[0].outerHTML
    console.log(new Date())
    
    // HACK - the cy.get & .should is used to create code block that will a loop controlled by Cypress
    cy.get('html', {timeout: millisecondsWithoutChange + 5000}).should((obj) => 
    {
        var currentHtml = Cypress.$('html')[0].outerHTML
        var currentTime = new Date().getTime()
        if(currentHtml != lastHtml)
        {
            endTime = currentTime + millisecondsWithoutChange

            console.log(new Date())
            console.log(`Current Time: ${new Date()} - Milliseconds since last change: ${(currentTime - lastChangeTime)}`)
            //console.log(currentHtml)

            lastHtml = currentHtml
            lastChangeTime = currentTime
        }
        expect(currentTime).greaterThan(endTime)
        console.log(`currentTime: ${currentTime} IS greater than endTime: ${endTime}`)
    })
}

function sleep (time) 
{
    return new Promise((resolve) => setTimeout(resolve, time))
}
  
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
        sleep(50)
    }
}