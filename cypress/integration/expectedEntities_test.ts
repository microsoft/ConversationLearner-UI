/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/
const { convLearnerPage,
  modelpage,
  entities,
  entityModal,
  actions,
  actionsModal,
  trainDialogPage,
  trainDialogModal,
  scorerModal,
  logDialogPage,
  logDialogModal,
  testLog } = components();

describe('ExpectedEntities test', function () {
  const postfix = Cypress.moment().format("MMMDD-HHmm")
  const modelName = `e2e-expecEntities-${postfix}`
  const customEntity01 = "name"
  const actionResponse01 = "What's your name?"
  const actionResponse02 = "Hello $name"

  beforeEach(function () {
    cy.setup();
    testLog.logTestHeader(this.currentTest.title);
    // starts the listener
    cy.on('uncaught:exception', (err, runnable) => {
      testLog.logError(err);
      return false;
    })
  })

  afterEach(function () {
    testLog.logResult(this.currentTest);
    const fileName = `expecEntities_${this.currentTest.state}-${this.currentTest.title}`;
    cy.wait(3000)
      .screenshot(fileName);
    cy.clearLocalStorage();
  })

  /** FEATURE: New Model */
  it('create a New ExpectedEntities Model', function () {
    // 1	Create the application:
    // 1.1	- In the Web UI, click New App
    // 1.2	- In Name, enter ExpectedEntities. Then click Create.
    
    convLearnerPage.navigateTo();
    convLearnerPage.createNewModel(modelName);
    modelpage.verifyPageTitle(modelName);
    })

  /** FEATURE: Custom entity creation */
  it('should add new NAME entity', function () {
    // 2	Create an entity
    // 2.1	Click Entities, then New Entity.
    // 2.2	In Entity Name, enter name.
    // 2.3	Click Create

    modelpage.navigateToEntities();
    entities.clickButtonNewEntity();
    entityModal.typeEntityName(customEntity01); //name
    entityModal.clickCreateButton();

    // Verify that the entity has been added
    cy.get('.ms-DetailsRow-cell')
      .should('contain', customEntity01)
  })

  /** FEATURE: New Action */
  it('should add two actions using NAME entity', () => {
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
    
    modelpage.navigateToActions();
    actions.createNew();
    actionsModal.selectTypeText();
    actionsModal.typeOnResponseBox(actionResponse01);    // 3.2	In Response, type 'What's your name?'.
    actionsModal.typeExpectedEntityInResponse('$name')   // 3.3	In Expected Entities, enter $name. Click Save.
    actionsModal.clickCreateButton();
    cy.wait(4000);
    //TODO:
    // 3.3.1	<Validation step> This means that if this question is asked, 
    //and the user response does not have any entities detected, 
    //the bot should assume the whole of the user's response is this entity.

    actions.createNew();
    actionsModal.selectTypeText();
    actionsModal.typeOnResponseBox(actionResponse02);     // 3.5	In Response, type 'Hello $name'.
    actionsModal.typeDisqualifyingEntities('$city');
    actionsModal.clickCreateButton();

  })

  it('should be able to TRAIN THE BOT', () => {
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

    modelpage.navigateToTrainDialogs();
    trainDialogPage.createNew();
    trainDialogModal.typeYourMessage("hello"); // Type 'hello'.
    trainDialogModal.clickScoreActions();
    scorerModal.selectAnActionWithText(actionResponse01);   // 4.3	Click Score Actions, and Select 'What's your name?'
    
    //TODO: 4.3.1	<Validation Step> Note that the response 'Hello $name' 
    // cannot be selected, because it requies the entity $name to be defined, 
    // and $name is not in bot's memory.

    cy.wait(2000);
    trainDialogModal.typeYourMessage("david");      // Type 'hello'.

    //TODO:  
    // 4.4.1	<Validation Step> Note that the name is highlighted as an entity. 
    //This is because of the heuristic we set up above to select the response as the entity.
    //TODO: -- add steps from 4.4.1 through 4.15
    // Perform chat entries validation
  
    cy.wait(2000)
    trainDialogModal.clickDoneTeaching();
  })

  /** FEATURE: Delete a Model */
  it('should delete an existent model', () => {
    convLearnerPage.navigateTo();
    convLearnerPage.deleteModel(modelName);
    cy.end()
  })
})

function components() {
  const actions = require('../support/components/actionspage');
  const actionsModal = require('../support/components/actionsmodal');
  const convLearnerPage = require('../support/components/homepage');
  const entities = require('../support/components/entitiespage');
  const entityModal = require('../support/components/entitymodal');
  const modelpage = require('../support/components/modelpage');
  const logDialogPage = require('../support/components/logdialogspage');
  const logDialogModal = require('../support/components/logdialogmodal');
  const scorerModal = require('../support/components/scorermodal');
  const trainDialogPage = require('../support/components/traindialogspage');
  const trainDialogModal = require('../support/components/traindialogmodal');
  const testLog = require('../support/utils/testlog');
  return { convLearnerPage, modelpage, entities, entityModal, actions, actionsModal, trainDialogPage, trainDialogModal, scorerModal, logDialogPage, logDialogModal, testLog };
}


