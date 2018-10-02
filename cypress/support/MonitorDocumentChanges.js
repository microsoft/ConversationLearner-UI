/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/helpers.js')

var MonitorDocumentChanges = (function()
{
    var lastChangeTime = 0
    var lastHtml
    var StopLookingForChanges = false

    // Initialize this only once.
    //   It gets called the first time it is imported, which should be at or near the top of the index.js file
    //   Then it potentially could get called additional times when the require statement is used.
    if (lastChangeTime == 0) initialize();

    function MillisecondsSinceLastChange() { return (new Date().getTime() - lastChangeTime) }

    function Stop() {StopLookingForChanges = true}

    function initialize()
    {
        helpers.ConLog(`MonitorDocumentChanges.initialize()`, `Start`)

        // This 'should' command overwrite is a hack around this issue: 
        // https://github.com/cypress-io/cypress/issues/1221
        Cypress.Commands.overwrite('should', (originalFn, subject, chainers, value) => 
        {
            if (value == 'MillisecondsSinceLastChange')
            {
                //helpers.ConLog(`cy.should())`, `Waiting for Stable DOM - Last DOM change was ${MillisecondsSinceLastChange()} milliseconds ago - subject: ${subject} - chainers: ${chainers} - value: ${value}`)
                return originalFn(subject, chainers, MillisecondsSinceLastChange())
            }
            return originalFn(subject, chainers, value)
        })

        Cypress.Commands.add('Get', (selector) => 
        {   
            helpers.ConLog(`cy.Get()`, `Start - Last DOM change was ${MillisecondsSinceLastChange()} milliseconds ago - Selector: \n${selector}`)
            cy.wrap(700, {timeout: 60000}).should('lte', 'MillisecondsSinceLastChange').then(() => {
            helpers.ConLog(`cy.Get()`, `DOM Is Stable`)
            cy.get(selector)
        })})

        Cypress.Commands.add('Click', { prevSubject: true, element: true}, (subject) => 
        {
            helpers.ConLog(`cy.Click()`, `Start - Last DOM change was ${MillisecondsSinceLastChange()} milliseconds ago`)
            lastChangeTime = new Date().getTime()
            cy.wrap(subject).click()
            .then(()=> {helpers.ConLog(`cy.Click()`, `done - Last DOM change was ${MillisecondsSinceLastChange()} milliseconds ago`)
            lastChangeTime = new Date().getTime()})
        })

        Cypress.on('window:before:load', () => 
        { 
            helpers.ConLog(`window:before:load`, `MillisecondsSinceLastChange: ${MillisecondsSinceLastChange()}`) 
            lastChangeTime = new Date().getTime()
        })

        Cypress.on('window:load', () => 
        { 
            helpers.ConLog(`window:load(complete)`, `MillisecondsSinceLastChange: ${MillisecondsSinceLastChange()}`) 
            lastChangeTime = new Date().getTime()
        })

        Cypress.on('url:changed', (newUrl) => 
        {
            helpers.ConLog(`url:changed`, `New URL ${newUrl} - MillisecondsSinceLastChange: ${MillisecondsSinceLastChange()}`) 
            lastChangeTime = new Date().getTime()
        })

        lastChangeTime = new Date().getTime()
        lastHtml = Cypress.$('html')[0].outerHTML
        setTimeout(() => { LookForChange() }, 50)   // This will repeat until Stop is called.

        helpers.ConLog(`MonitorDocumentChanges.initialize()`, `Running`)
    }

    var dumpSpinner1 = false
    var dumpSpinner2 = false
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
        {
            //helpers.ConLog(thisFuncName, `No change`)
            //<div class="ms-Spinner-circle ms-Spinner--large circle-50"></div>
            if (currentHtml.includes('<span class="cl-screen-reader">Loading</span>'))
            {
                helpers.ConLog(thisFuncName, `SPINNING1 `)
                if (!dumpSpinner1)
                {
                    dumpSpinner1 = true
                    helpers.ConLog(thisFuncName, `HTML:::::::::::::::::::::::::::::::::::::::::::::::::\n${currentHtml}`)
                }
                lastChangeTime = currentTime
            }
            else if (currentHtml.includes('<div class="ms-Spinner-circle ms-Spinner--large circle-50">'))
            {
                helpers.ConLog(thisFuncName, `SPINNING2 `)
                if (!dumpSpinner2)
                {
                    dumpSpinner2 = true
                    helpers.ConLog(thisFuncName, `HTML:::::::::::::::::::::::::::::::::::::::::::::::::\n${currentHtml}`)
                }
                lastChangeTime = currentTime
            }
        }
        else
        {
            helpers.ConLog(thisFuncName, `Change Found - Milliseconds since last change: ${(currentTime - lastChangeTime)}`)
            //cy.writeFile(currentHtml, `c:\\temp\\dom.${helpers.NowAsString()}.txt`)
            //helpers.ConLog(thisFuncName, `Current HTML:\n${currentHtml}`)

            lastChangeTime = currentTime
            lastHtml = currentHtml
        }
        
        setTimeout(() => { LookForChange() }, 50)   // Repeat this same function 50ms later
    }
}())


