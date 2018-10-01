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
const scorerModal = require('../support/components/scorermodal')
const trainDialogPage = require('../support/components/traindialogspage')
const editDialogModal = require('../support/components/editdialogmodal')
const helpers = require('../support/helpers')
const monitorDocumentChanges = require('../support/MonitorDocumentChanges')

describe('zzTemp test', function () {
  const postfix = "0925-1838298" //Cypress.moment().format("MMDD-HHmmSSS")
  const modelName = `e2e-expected-${postfix}`
  const entityName = "name"
  const actionResponse01 = "What's your name?"
  const actionResponse02 = "Hello $name"
  const usersName = "David"

  beforeEach(() => { monitorDocumentChanges.Start();/*             var defaultCommandTimeout = Cypress.config('defaultCommandTimeout');
  Cypress.config('defaultCommandTimeout', 60 * 1000);*/
  })
  afterEach(() =>  { cy.pause(); monitorDocumentChanges.Stop() })

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
    cy.Get('button.root-65')//`:contains('e2e-expected-0925-1838298')`)
      .contains(`${modelName}`)
      .Click()

    //cy.get('button').contains(modelName).click() //(`:contains(${modelName})`).click()
    //modelPage.navigateToTrainDialogs()
    cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').Click()

    //trainDialogPage.createNew()
    cy.Get('[data-testid="button-new-train-dialog"]').Click()

    //editDialogModal.typeYourMessage("hello")
    cy.Get('input[class="wc-shellinput"]').type(`hello{enter}`)
    
    //editDialogModal.clickScoreActions()
    cy.Get('[data-testid="button-proceedto-scoreactions"]').click()

    // 4.3.1	<Validation Step> Note that the response 'Hello $name' 
    // cannot be selected, because it requies the entity $name to be defined, 
    // and $name is not in bot's memory.
    cy.Get('[data-testid="actionscorer-responseText"]').contains(actionResponse02)
      .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonNoClick"]')
      .should('be.disabled')
+
    //scorerModal.selectAnActionWithText(actionResponse01)
    cy.Get('[data-testid="actionscorer-responseText"]').contains(actionResponse01)
      .parents('div.ms-DetailsRow-fields').find('[data-testid="actionscorer-buttonClickable"]')
      .click()


    //editDialogModal.typeYourMessage("david")
    cy.Get('input[class="wc-shellinput"]').type(`${usersName}{enter}`)

    // 4.4.1	<Validation Step> Note that the name is highlighted as an entity. 

    // <div class="cl-entity-node-indicator__name noselect" spellcheck="false"><button type="button" tabindex="-1">name</button></div>
    // <button type="button" tabindex="-1">name</button>
    // <span class="cl-entity-node__text"><span data-key="21"><span data-offset-key="21:0"><span data-slate-zero-width="true">​</span></span></span><span class="cl-token-node" data-key="19"><span data-key="20"><span data-offset-key="20:0">david</span></span></span><span data-key="22"><span data-offset-key="22:0"><span data-slate-zero-width="true">​</span></span></span></span>
    // <span data-offset-key="20:0">david</span>
    cy.Get('[data-testid="button-entity-indicatorName"]').contains(entityName)
    cy.Get('[data-testid="text-entity-value"]').contains(usersName)

    //TODO: -- add steps from 4.4.1 through 4.15
    // Perform chat entries validation

    // cy.pause()//.wait(2000)
    // editDialogModal.clickDoneTeaching()
  })

//   it('Train v2', () => {
//     cy.visit('http://localhost:5050')
    
//     //cy.get('[data-list-index="16"] > .ms-FocusZone > .ms-DetailsRow-fields > [aria-colindex="0"]')
//     cy.Get(`:contains('e2e-expected-0925-1838298')`)
//       .each(element => 
//         {
//           helpers.ConLog('Test Case: should be able to train', element)
//         })
//       .pause()

//     //cy.get('button').contains(modelName).click() //(`:contains(${modelName})`).click()
//     //modelPage.navigateToTrainDialogs()
//     cy.Get('[data-testid="app-index-nav-link-train-dialogs"]').click()

//     //trainDialogPage.createNew()
//     cy.Get('[data-testid="button-new-train-dialog"]').click()

//     //editDialogModal.typeYourMessage("hello")
//     cy.Get('input[class="wc-shellinput"]').type(`hello{enter}`)
    
//     //editDialogModal.clickScoreActions()
//     cy.Get('[data-testid="button-proceedto-scoreactions"]').click()
// +
//     //scorerModal.selectAnActionWithText(actionResponse01)
//     cy.Get('.ms-List-page').should("be.visible").within(() => {
//         cy.contains(actionResponse01)
//             .parents('[class*="ms-DetailsRow-fields"]')
//             //.find('.ms-Button-label')
//             //<button type="button" data-testid="actionscorer-buttonClickable" class="ms-Button ms-Button--primary root-54" aria-labelledby="id__128" aria-describedby="id__130" data-is-focusable="true" tabindex="-1"><div class="ms-Button-flexContainer flexContainer-55"><div class="ms-Button-textContainer textContainer-56"><div class="ms-Button-label label-58" id="id__128" data-cypress-el="true">Select</div></div><span class="ms-Button-screenReaderText screenReaderText-52" id="id__130">Select</span></div></button>
//             .find('[data-testid="actionscorer-buttonClickable"]')
//             .should("be.visible")
//             .click()
//     })

//     //TODO: 4.3.1	<Validation Step> Note that the response 'Hello $name' 
//     // cannot be selected, because it requies the entity $name to be defined, 
//     // and $name is not in bot's memory.

//     //editDialogModal.typeYourMessage("david")
//     cy.Get('input[class="wc-shellinput"]').type(`david{enter}`)

//     //TODO:  
//     // 4.4.1	<Validation Step> Note that the name is highlighted as an entity. 
//     //This is because of the heuristic we set up above to select the response as the entity.
//     //TODO: -- add steps from 4.4.1 through 4.15
//     // Perform chat entries validation

//     // cy.pause()//.wait(2000)
//     // editDialogModal.clickDoneTeaching()
//   })

  // it('should delete an existent model', () => {
  //   modelsListPage.navigateTo()
  //   modelsListPage.deleteModel(modelName)
  // })
})
