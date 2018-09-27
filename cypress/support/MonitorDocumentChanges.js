/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/helpers.js')

var lastChangeTime// = 0
var lastHtml
var StopLookingForChanges = false

export function Start()
{
    helpers.ConLog(`MonitorDocumentChanges.Start()`, `Running`)

    Cypress.Commands.add('Get', (selector) => 
    { 
      helpers.ConLog(`cy.Get()`, `Start - Last DOM change was ${MillisecondsSinceLastChange()} milliseconds ago - Selector: \n${selector}`)
      cy.wrap({ 'millisecondsSinceLastChange': MillisecondsSinceLastChange}).invoke('millisecondsSinceLastChange').should('gte', 700).then(() => {
      helpers.ConLog(`cy.Get()`, `DOM Is Stable`)
      cy.get(selector)
    })})
        
    lastChangeTime = new Date().getTime()
    lastHtml = Cypress.$('html')[0].outerHTML

    setTimeout(() => { LookForChange() }, 50)   // Endlessly repeat
}

export function MillisecondsSinceLastChange() { return (new Date().getTime() - lastChangeTime) }

export function Stop() {StopLookingForChanges = true}

export function LookForChange()
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
        ;//helpers.ConLog(thisFuncName, `No change`)
    else
    {
        helpers.ConLog(thisFuncName, `Change Found - Milliseconds since last change: ${(currentTime - lastChangeTime)} vs ${MillisecondsSinceLastChange()}`)
        //helpers.ConLog(thisFuncName, `Current HTML:\n${currentHtml}`)

        lastChangeTime = currentTime
        lastHtml = currentHtml
    }
    
    setTimeout(() => { LookForChange() }, 50)   // Repeat this same function 50ms later
}



