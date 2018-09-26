/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
const actions = require('../support/components/actionspage')
const actionsModal = require('../support/components/actionsmodal')
const entities = require('../support/components/entitiespage')
const entityModal = require('../support/components/entitymodal')
const modelsListPage = require('../support/components/modelsList')
const modelPage = require('../support/components/modelPage')
const logDialogPage = require('../support/components/logdialogspage')
const logDialogModal = require('../support/components/logdialogmodal')
const scorerModal = require('../support/components/scorermodal')
const trainDialogPage = require('../support/components/traindialogspage')
const editDialogModal = require('../support/components/editdialogmodal')
const helpers = require('../support/helpers.js')

var StopLookingForChanges = false

function MonitorDocumentChanges()
{
    var lastChangeTime
    var lastHtml

    function MillisecondsSinceLastChange() { return new Date().getTime() - lastChangeTime }

    function LookForChange()
    {
        var thisFuncName = `MonitorDocumentChanges.LookForChange()`
        //helpers.ConLog(thisFuncName, `Start`)

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
            helpers.ConLog(thisFuncName, `Current HTML:\n${currentHtml}`)

            lastChangeTime = currentTime
            lastHtml = currentHtml
        }
        
        //helpers.ConLog(thisFuncName, `Next`)
        setTimeout(() => { LookForChange() }, 50)   // Endlessly repeat
    }

    var thisFuncName = `MonitorDocumentChanges()`
    helpers.ConLog(thisFuncName, `Start`)

    lastChangeTime = new Date().getTime()
    lastHtml = Cypress.$('html')[0].outerHTML

    setTimeout(() => { LookForChange() }, 50)   // Endlessly repeat
    
    return MillisecondsSinceLastChange
}


describe('Temp test', function () {
  const postfix = "0925-1838298" //Cypress.moment().format("MMDD-HHmmSSS")
  const modelName = `e2e-expected-${postfix}`
  const entityName = "name"
  const actionResponse01 = "What's your name?"
  const actionResponse02 = "Hello $name{enter}"

  afterEach(() => {StopLookingForChanges = true})

  var MillisecondsSinceLastChange = MonitorDocumentChanges()
  Cypress.Commands.add('Get', (selector) => 
  { 
    //return new Promise((resolve, reject) => {
    helpers.ConLog(`cy.Get()`, `Start - Last change was ${MillisecondsSinceLastChange()} milliseconds ago`)
    cy.wrap({ 'millisecondsSinceLastChange': MillisecondsSinceLastChange}).invoke('millisecondsSinceLastChange').should('gte', 700).then(() => {
    helpers.ConLog(`cy.Get()`, `DOM Is Stable`)
    //resolve(cy.get(selector))
    cy.get(selector)
  })})

  it('should be able to train', () => {
    // 4	Train the bot
    // 4.1	Click Train Dialogs, then New Train Dialog.
    // 4.2	Type 'hello'.
    // 4.3	Click Score Actions, and Select 'What's your name?'
    // 4.3.1	<Validation Step> Note that the response 'Hello $name' cannot be selected, because it requies the entity $name to be defined, and $name is not in bot's memory.
    // 4.4	Enter 'david'.
    // 4.4.1	<Validation Step> Note that the name is highlighted as an entity. This is because of the heuristic we set up above to select the response as the entity.
    // 4.5	Click Score Actions
    // 4.5.1	<Validation Step> Note name value is now in the bot's memory.
    // 4.6	'Hello $name' is now available as a response.
    // 4.7	Select 'Hello $name'.
    // 4.8	Click Done Teaching.
    // 4.9	Click New Train Dialog.
    // 4.10	Enter 'my name is david'.
    // 4.10.1	<Validation Step> Note that it does identify david as the name entity because it has seen this word before.
    // 4.11	Click Score Actions
    // 4.12	Select 'Hello $name'.
    // 4.13	Enter 'my name is susan'.
    // 4.13.1	<Validation Step> Note that it identifies susan as the name since it has seen this pattern already.
    // 4.14	Click Score Actions.
    // 4.15	Select 'Hello susan'.
    // 4.16	Click Done Teaching.
    
    cy.visit('http://localhost:5050')
    
    //cy.get('[data-list-index="16"] > .ms-FocusZone > .ms-DetailsRow-fields > [aria-colindex="0"]')
    cy.Get(`:contains('e2e-expected-0925-1838298')`)
      .each(element => 
        {
          helpers.ConLog('Test Case: should be able to train', element)
        })
      .pause()

    //cy.get('button').contains(modelName).click() //(`:contains(${modelName})`).click()
    //modelPage.navigateToTrainDialogs()
    cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').click()

    //trainDialogPage.createNew()
    cy.Get('[data-testid="button-new-train-dialog"]').click()

    //editDialogModal.typeYourMessage("hello")
    cy.Get('input[class="wc-shellinput"]').type(`hello{enter}`)
    
    //editDialogModal.clickScoreActions()
    cy.Get('[data-testid="button-proceedto-scoreactions"]').click()
+
    //scorerModal.selectAnActionWithText(actionResponse01)
    cy.Get('.ms-List-page').should("be.visible").within(() => {
        cy.contains(actionResponse01)
            .parents('[class*="ms-DetailsRow-fields"]')
            //.find('.ms-Button-label')
            //<button type="button" data-testid="actionscorer-buttonClickable" class="ms-Button ms-Button--primary root-54" aria-labelledby="id__128" aria-describedby="id__130" data-is-focusable="true" tabindex="-1"><div class="ms-Button-flexContainer flexContainer-55"><div class="ms-Button-textContainer textContainer-56"><div class="ms-Button-label label-58" id="id__128" data-cypress-el="true">Select</div></div><span class="ms-Button-screenReaderText screenReaderText-52" id="id__130">Select</span></div></button>
            .find('[data-testid="actionscorer-buttonClickable"]')
            .should("be.visible")
            .click()
    })

    //TODO: 4.3.1	<Validation Step> Note that the response 'Hello $name' 
    // cannot be selected, because it requies the entity $name to be defined, 
    // and $name is not in bot's memory.

    //editDialogModal.typeYourMessage("david")
    cy.Get('input[class="wc-shellinput"]').type(`david{enter}`)

    //TODO:  
    // 4.4.1	<Validation Step> Note that the name is highlighted as an entity. 
    //This is because of the heuristic we set up above to select the response as the entity.
    //TODO: -- add steps from 4.4.1 through 4.15
    // Perform chat entries validation

    // cy.pause()//.wait(2000)
    // editDialogModal.clickDoneTeaching()
  })

  // it('should delete an existent model', () => {
  //   modelsListPage.navigateTo()
  //   modelsListPage.deleteModel(modelName)
  // })
})
