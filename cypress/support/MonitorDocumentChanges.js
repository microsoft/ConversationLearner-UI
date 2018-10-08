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
    var dumpHtml = false;
    
    // Initialize this only once.
    //   It gets called the first time it is imported, which should be at or near the top of the index.js file
    //   Then it potentially could get called additional times when the require statement is used.
    //   BUGBUG: this initialize once logic does not work because lastChangeTime gets zeroed everytime this is imported or required.
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

        Cypress.Commands.add('Contains', (selector, content, options) => 
        {   
            helpers.ConLog(`cy.Contains()`, `Start - Last DOM change was ${MillisecondsSinceLastChange()} milliseconds ago - Selector -- Content: \n${selector} -- ${content}`)
            cy.wrap(700, {timeout: 60000}).should('lte', 'MillisecondsSinceLastChange').then(() => {
            helpers.ConLog(`cy.Contains()`, `DOM Is Stable`)
            cy.contains(selector, content, options)
        })})

        Cypress.Commands.add('Click', { prevSubject: true, element: true}, (subject) => 
        {
            helpers.ConLog(`cy.Click()`, `Start - Last DOM change was ${MillisecondsSinceLastChange()} milliseconds ago`)
            lastChangeTime = new Date().getTime()
            cy.wrap(subject).click()
            .then(()=> {helpers.ConLog(`cy.Click()`, `done - Last DOM change was ${MillisecondsSinceLastChange()} milliseconds ago`)
            lastChangeTime = new Date().getTime()})
        })

        Cypress.Commands.add('DumpHtmlOnDomChange', (boolValue) => {dumpHtml = boolValue})

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

        // Cypress.on('uncaught:exception', (error, runnable) => 
        // {
        //     helpers.ConLog(`uncaught:exception`, `Error: ${error} - Runnable: ${runnable} - html:\n${Cypress.$('html')[0].outerHTML}`)
        //     cy.wait(5000).then(() => helpers.ConLog(`uncaught:exception`, `A bit later...html:\n${Cypress.$('html')[0].outerHTML}`))
        //     done()
        //     return false
        // })

        lastChangeTime = new Date().getTime()
        lastHtml = Cypress.$('html')[0].outerHTML
        setTimeout(() => { LookForChange() }, 50)   // This will repeat until Stop is called.

        helpers.ConLog(`MonitorDocumentChanges.initialize()`, `Running`)
    }

    var dumpSpinner = false
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
            if (currentHtml.includes('data-testid="spinner"'))//'<span class="cl-screen-reader">Loading</span>'))
            {
                //helpers.ConLog(thisFuncName, `SPINNING1 `)
                lastChangeTime = currentTime
            }
            else if (currentHtml.includes('<div class="ms-Spinner-circle ms-Spinner--large circle-50">'))
            {
                helpers.ConLog(thisFuncName, `SPINNING2 `)
                // if (!dumpSpinner)
                // {
                //     dumpSpinner = true
                //     helpers.ConLog(thisFuncName, `HTML:::::::::::::::::::::::::::::::::::::::::::::::::\n${currentHtml}`)
                // }
                lastChangeTime = currentTime
            }
        }
        else
        {
            helpers.ConLog(thisFuncName, `Change Found - Milliseconds since last change: ${(currentTime - lastChangeTime)}`)
            //cy.writeFile(currentHtml, `c:\\temp\\dom.${helpers.NowAsString()}.txt`)
            //helpers.ConLog(thisFuncName, `Current HTML:\n${currentHtml}`)
            if (dumpHtml) helpers.ConLog(thisFuncName, `Current HTML:\n${currentHtml}`)

            lastChangeTime = currentTime
            lastHtml = currentHtml
        }
        
        setTimeout(() => { LookForChange() }, 50)   // Repeat this same function 50ms later
    }
}())


