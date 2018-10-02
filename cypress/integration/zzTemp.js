/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../support/components/homePage')
const actions = require('../support/components/actionspage')
const actionsModal = require('../support/components/actionsmodal')
const entities = require('../support/components/entitiespage')
const entityModal = require('../support/components/entitymodal')
const modelsListPage = require('../support/components/modelsList')
const modelPage = require('../support/components/modelPage')
const logDialogPage = require('../support/components/logdialogspage')
const scorerModal = require('../support/components/scorermodal')
const trainDialogPage = require('../support/components/traindialogspage')
const editDialogModal = require('../support/components/editdialogmodal')
const helpers = require('../support/helpers')
//const monitorDocumentChanges = require('../support/MonitorDocumentChanges')

describe('zzTemp test', function () {
  const postfix = "0925-0936040"//"0925-1838298" //Cypress.moment().format("MMDD-HHmmSSS")
  const modelName = `e2e-expected-${postfix}`
  const entityName = "name"
  const actionResponse01 = "What's your name?"
  const actionResponse02 = "Hello $name"
  const usersName = "David"

  // beforeEach(() => { monitorDocumentChanges.Start() })
  // afterEach(() =>  { helpers.ConLog(`afterEach`, `Current HTML:\n${Cypress.$('html')[0].outerHTML}`); monitorDocumentChanges.Stop() })

  it('2 should be able to train', () => 
  {
    homePage.visit()
    
    homePage.navigateToModelPage(modelName)

    // 4.1	Click Train Dialogs..., then New Train Dialog.
    modelPage.navigateToTrainDialogs()

    // 4.1	...then New Train Dialog.
    trainDialogPage.createNew()
  })

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

    //monitorDocumentChanges.Start()
    homePage.visit()
    
    homePage.navigateToModelPage(modelName)

    // 4.1	Click Train Dialogs..., then New Train Dialog.
    modelPage.navigateToTrainDialogs()

    // 4.1	...then New Train Dialog.
    trainDialogPage.createNew()

    // 4.2	Type 'hello'.
    //editDialogModal.typeYourMessage("hello")
    cy.Get('input[class="wc-shellinput"]').type(`hello{enter}`)
    
    // 4.3	Click Score Actions...
    //editDialogModal.clickScoreActions()
    cy.Get('[data-testid="button-proceedto-scoreactions"]').click()

    // 4.3.1	<Validation Step> Note that the response 'Hello $name' 
    // cannot be selected, because it requies the entity $name to be defined, 
    // and $name is not in bot's memory.
    cy.Get('[data-testid="actionscorer-responseText"]').contains(actionResponse02)
      .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonNoClick"]')
      .should('be.disabled')

    // 4.3	...and Select 'What's your name?'
    //scorerModal.selectAnActionWithText(actionResponse01)
    cy.Get('[data-testid="actionscorer-responseText"]').contains(actionResponse01)
      .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonClickable"]')
      .click()

    // 4.4	Enter 'david'.
    //editDialogModal.typeYourMessage("david")
    cy.Get('input[class="wc-shellinput"]').type(`${usersName}{enter}`)

    // 4.4.1	<Validation Step> Note that the name is highlighted as an entity. 
    cy.Get('[data-testid="button-entity-indicatorName"]').contains(entityName)
    cy.Get('[data-testid="text-entity-value"]').contains(usersName)

    // 4.5	Click Score Actions
    //editDialogModal.clickScoreActions()
    cy.Get('[data-testid="button-proceedto-scoreactions"]').click()

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

    // cy.pause()//.wait(2000)
    // editDialogModal.clickDoneTeaching()
    //monitorDocumentChanges.Stop()
  })
})
