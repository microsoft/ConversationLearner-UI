/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/helpers.js')

var MonitorDocumentChanges = (function()
{
    var lastMonitorTime = 0
    var lastChangeTime = 0
    var lastHtml
    var StopLookingForChanges = false
    var dumpHtml = false;
    
    var expectingSpinner
    var currentSpinnerText = ''

    // Initialize this only once.
    //   It gets called the first time it is imported, which should be at or near the top of the index.js file
    //   Then it potentially could get called additional times when the require statement is used.
    //   BUGBUG: this initialize once logic does not work because lastChangeTime gets zeroed everytime this is imported or required.
    if (lastChangeTime == 0) initialize();

    function MillisecondsSinceLastChange() 
    { 
        if (new Date().getTime() > lastMonitorTime + 50) LookForChange()
        return (new Date().getTime() - lastChangeTime) 
    }

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

        // Special case version that allows a 1 minute time out.
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
            //if(UrlNeedsSpinner(newUrl)) SetExpectingSpinner(true)
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
        setTimeout(() => { LookForChange(true) }, 50)   // This will repeat until Stop is called.

        helpers.ConLog(`MonitorDocumentChanges.initialize()`, `Running`)
    }

    var dumpSpinner = false
    function LookForChange(loop)
    {
        var thisFuncName = `MonitorDocumentChanges.LookForChange()`

        if (StopLookingForChanges) 
        {
            helpers.ConLog(thisFuncName, `DONE`)
            return
        }

        var currentTime = lastMonitorTime = new Date().getTime()
        var currentHtml = Cypress.$('html')[0].outerHTML
        if(currentHtml != lastHtml)
        {
            helpers.ConLog(thisFuncName, `Change Found - Milliseconds since last change: ${(currentTime - lastChangeTime)}`)
            //cy.writeFile(currentHtml, `c:\\temp\\dom.${helpers.NowAsString()}.txt`)
            if (dumpHtml || expectingSpinner) helpers.ConLog(thisFuncName, `Current HTML:\n${currentHtml}`)

            lastChangeTime = currentTime
            lastHtml = currentHtml

            // TODO: Remove this code AFTER we get a good idea of how to capture the best selector for this "Training Status Polling Stopped" icon
            if (currentHtml.includes('<i data-icon-name="Warning" class="cl-icon root-77" role="presentation" aria-hidden="true"></i>')) 
                helpers.ConLog(thisFuncName, `HTML has WARNING ICON:\n${currentHtml}`)
        }
        
        MonitorSpinner()

        if(loop) setTimeout(() => { LookForChange(true) }, 50)   // Repeat this same function 50ms later
    }

    function MonitorSpinner()
    {
        var thisFuncName = `MonitorDocumentChanges.MonitorSpinner()`

        var spinnerTexts =
        [
            'data-testid="spinner"',
            '<div class="ms-Spinner-circle ms-Spinner--large circle-50">',    
        ]
        
        for(var i = 0; i < spinnerTexts.length; i++)
        {
            if (lastHtml.includes(spinnerTexts[i]))
            {   // We found a spinner on the page.
                lastChangeTime = new Date().getTime()
                SetExpectingSpinner(false)
                
                if (spinnerTexts[i] != currentSpinnerText)
                {
                    helpers.ConLog(thisFuncName, `Start - ${spinnerTexts[i]} - current HTML:\n${lastHtml}`)
                    currentSpinnerText = spinnerTexts[i]
                }
                return
            }
        }
        
        // Spinner NOT found on the page.
        if (currentSpinnerText != '')
        {
            helpers.ConLog(thisFuncName, `Stop - ${currentSpinnerText}`)
            currentSpinnerText = ''
        }
        
        if (expectingSpinner) 
        {
            helpers.ConLog(thisFuncName, `Expecting Spinner to show up`)
            lastChangeTime = new Date().getTime()
        }
    }

    function SetExpectingSpinner(value)
    {
        if (expectingSpinner == value) return;
        helpers.ConLog(`MonitorDocumentChanges.SetExpectingSpinner()`, `Value Changed from ${expectingSpinner} to ${value}`)
        expectingSpinner = value
    }

    function UrlNeedsSpinner(url)
    {
        // If a URL ends with one of these we do not expect a spinner.
        var urlEndings =
        [
            '/trainDialogs',
            '/entities',
            '/actions',
            '/logDialogs',
            '/settings'
        ]
        
        for(var i = 0; i < urlEndings.length; i++) { if (url.endsWith(urlEndings[i])) return false }
        return true
    }
}())


