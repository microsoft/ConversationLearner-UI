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

describe('Temp test', function () {
  const postfix = "0925-1838298" //Cypress.moment().format("MMDD-HHmmSSS")
  const modelName = `e2e-expected-${postfix}`
  const entityName = "name"
  const actionResponse01 = "What's your name?"
  const actionResponse02 = "Hello $name{enter}"

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
    cy.WaitForStableDom(1000).then(() => {
    
    //cy.get('[data-list-index="16"] > .ms-FocusZone > .ms-DetailsRow-fields > [aria-colindex="0"]')
    cy.get(`:contains('e2e-expected-0925-1838298')`)
      .each(element => 
        {
          helpers.ConLog('Test Case: should be able to train', element.toString())
        })
      .pause()

    //cy.get('button').contains(modelName).click() //(`:contains(${modelName})`).click()
    cy.WaitForStableDom(1000).then(() => {

    modelPage.navigateToTrainDialogs()
    trainDialogPage.createNew()
    cy.WaitForStableDom(1000).then(() => {
    
    editDialogModal.typeYourMessage("hello")
    cy.WaitForStableDom(1000).then(() => {
    
    editDialogModal.clickScoreActions()
    cy.WaitForStableDom(1000).then(() => {
+
    scorerModal.selectAnActionWithText(actionResponse01)
    cy.WaitForStableDom(1000).then(() => {

    //TODO: 4.3.1	<Validation Step> Note that the response 'Hello $name' 
    // cannot be selected, because it requies the entity $name to be defined, 
    // and $name is not in bot's memory.

    editDialogModal.typeYourMessage("david")

    //TODO:  
    // 4.4.1	<Validation Step> Note that the name is highlighted as an entity. 
    //This is because of the heuristic we set up above to select the response as the entity.
    //TODO: -- add steps from 4.4.1 through 4.15
    // Perform chat entries validation

    // cy.pause()//.wait(2000)
    // editDialogModal.clickDoneTeaching()
    })})})})})})
  })

  // it('should delete an existent model', () => {
  //   modelsListPage.navigateTo()
  //   modelsListPage.deleteModel(modelName)
  // })
})
