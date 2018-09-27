/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/helpers.js')

var lastChangeTime
var lastHtml
var StopLookingForChanges = false

function Stop() {StopLookingForChanges = true; return 'xyz'}

function LookForChange()
{
    var thisFuncName = `MonitorDocumentChanges.LookForChange()`

    if (StopLookingForChanges) 
    {
        helpers.ConLog(thisFuncName, `DONE`)
        return
    }

    var currentTime = new Date().getTime()
    var currentHtml = Cypress.$('html')[0].outerHTML
    if(currentHtml == lastHtml)
        helpers.ConLog(thisFuncName, `No change`)
    else
    {
        helpers.ConLog(thisFuncName, `Milliseconds since last change: ${(currentTime - lastChangeTime)}`)
        //helpers.ConLog(thisFuncName, `Current HTML:\n${currentHtml}`)

        lastChangeTime = currentTime
        lastHtml = currentHtml
    }
    
    setTimeout(() => { LookForChange() }, 50)   // Repeat this same function 50ms later
}

function MillisecondsSinceLastChange() { return new Date().getTime() - lastChangeTime }

function Start()
{
    Stop()
    var notUsed = MillisecondsSinceLastChange()

    cy.debug()
    helpers.ConLog(`MonitorDocumentChanges.Start()`, `Running`)
    
    lastChangeTime = new Date().getTime()
    lastHtml = Cypress.$('html')[0].outerHTML

    setTimeout(() => { LookForChange() }, 50)   // Endlessly repeat
}




