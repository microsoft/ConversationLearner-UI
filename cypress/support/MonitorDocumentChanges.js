/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/helpers.js')

var lastChangeTime
var lastHtml
var StopLookingForChanges = false
var cyCommandsAdded = false

export function Start()
{
    helpers.ConLog(`MonitorDocumentChanges.Start()`, `Running`)

    if(!cyCommandsAdded)
    {
        cyCommandsAdded = true;
        Cypress.Commands.add('Get', (selector) => 
        { 
            helpers.ConLog(`cy.Get()`, `Start - Last DOM change was ${MillisecondsSinceLastChange()} milliseconds ago - Selector: \n${selector}`)
            cy.wrap({ 'millisecondsSinceLastChange': MillisecondsSinceLastChange}).invoke('millisecondsSinceLastChange').should('gte', 700).then(() => {
            helpers.ConLog(`cy.Get()`, `DOM Is Stable`)
            cy.get(selector)
        })})

        Cypress.Commands.add('Click', { prevSubject: true, element: true}, (subject) => 
        {
            helpers.ConLog(`cy.Click()`, `Start - Last DOM change was ${MillisecondsSinceLastChange()} milliseconds ago - Selector: \n${subject}`)
            cy.wrap(subject).click()
        })
    }   

    lastChangeTime = new Date().getTime()
    lastHtml = Cypress.$('html')[0].outerHTML

    setTimeout(() => { LookForChange() }, 50)   // Endlessly repeat

    cy.on('window:before:load', () => 
    { 
        helpers.ConLog(`window:before:load`, `MillisecondsSinceLastChange: ${MillisecondsSinceLastChange()}`) 
        lastChangeTime = new Date().getTime()
    })

    cy.on('window:load', () => 
    { 
        helpers.ConLog(`window:load(complete)`, `MillisecondsSinceLastChange: ${MillisecondsSinceLastChange()}`) 
        lastChangeTime = new Date().getTime()
    })

    cy.on('url:changed', (newUrl) => 
    {
        helpers.ConLog(`url:changed`, `New URL ${newUrl} - MillisecondsSinceLastChange: ${MillisecondsSinceLastChange()}`) 
        lastChangeTime = new Date().getTime()
    })
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
    {
        //helpers.ConLog(thisFuncName, `No change`)
        if (currentHtml.includes('<span class="cl-screen-reader">Loading</span>'))
        {
            helpers.ConLog(thisFuncName, `SPINNING`)
            lastChangeTime = currentTime
        }
    }
    else
    {
        helpers.ConLog(thisFuncName, `Change Found - Milliseconds since last change: ${(currentTime - lastChangeTime)}`)
        //cy.writeFile(currentHtml, `c:\\temp\\dom.${helpers.NowAsString()}.txt`)
        helpers.ConLog(thisFuncName, `Current HTML:\n${currentHtml}`)

        lastChangeTime = currentTime
        lastHtml = currentHtml
    }
    
    setTimeout(() => { LookForChange() }, 50)   // Repeat this same function 50ms later
}



