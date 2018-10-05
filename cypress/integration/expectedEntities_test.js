/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
const homePage = require('../support/components/HomePage')
const modelPage = require('../support/components/ModelPage')
const entities = require('../support/components/EntitiesPage')
const entityModal = require('../support/components/EntityModal')
const actions = require('../support/components/ActionsPage')
const actionsModal = require('../support/components/ActionsModal')
const logDialogPage = require('../support/components/logdialogspage')
const scorerModal = require('../support/components/scorermodal')
const trainDialogPage = require('../support/components/traindialogspage')
const editDialogModal = require('../support/components/editdialogmodal')
const helpers = require('../support/helpers.js')

describe('ExpectedEntities test', function () {
  const postfix = Cypress.moment().format("MMDD-HHmmSSS")
  const modelName = `e2e-expected-${postfix}`
  const entityName = "name"
  const actionResponse01 = "What's your name?"
  const actionResponse02 = "Hello $name{enter}"

  afterEach(function () {
    const fileName = `expecEntities_${this.currentTest.state}-${this.currentTest.title}`;
    cy.wait(3000)
      .screenshot(fileName)
  })

  it('create a new model', function () {
    homePage.navigateTo()
    homePage.CreateNewModel(modelName)
    modelPage.verifyPageTitle(modelName)
  })

  it('should add new entity', function () {
    modelPage.navigateToEntities()
    entities.clickButtonNewEntity()
    entityModal.TypeEntityName(entityName)
    entityModal.ClickCreateButton()
    entities.VerifyItemInList(entityName)
  })

  it('should create action using name as expected entity', () => {
    //FULL SECTION
    // 3	Create two actions
    // 3.1	Click Actions, then New Action
    // 3.2	In Response, type 'What's your name?'.
    // 3.3	In Expected Entities, enter $name. Click Save.
    // 3.3.1	<Validation step> This means that if this question is asked, and the user response does not have any entities detected, the bot should assume the whole of the user's response is this entity.
    // 3.4	Click Actions, then New Action to create a second action.
    // 3.5	In Response, type 'Hello $name'.
    // 3.5.1	<Validation step> Note that the entity is automatically added as a disqualifying entity.
    // 3.6	Click Save

    modelPage.navigateToActions()
    actions.ClickNewAction()
    actionsModal.SelectTypeText()
    actionsModal.TypeResponse(actionResponse01)
    actionsModal.TypeExpectedEntity('$name')
    actionsModal.clickCreateButton()
    cy.wait(1000)
  })

  it(`should create an action using city as disqualifying entity`, () => {
    actions.ClickNewAction()
    actionsModal.SelectTypeText()
    actionsModal.TypeResponse(actionResponse02)
    actionsModal.TypeDisqualifyingEntities('$name')
    actionsModal.clickCreateButton()
    cy.wait(1000)
  })

  it('should be able to train the', () => {
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
    })})})})
  })
})
