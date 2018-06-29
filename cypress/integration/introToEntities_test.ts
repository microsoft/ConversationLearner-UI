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

describe('Intro to Entities test', function () {
  const postfix = Cypress.moment().format("MMMDD-HHmm")
  const modelName = `e2e-introtoentities-${postfix}`
  const customEntity01 = "city"
  const action01 = "I don't know what city you want"
  const action02 = "The weather in the $city is probably sunny"

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
    const fileName = `introentities_${this.currentTest.state}-${this.currentTest.title}`;
    cy.wait(3000)
      .screenshot(fileName);
    cy.teardown();
  })

  /** FEATURE: New Model */
  it('create a New Model', function () {
    convLearnerPage.navigateTo();
    convLearnerPage.createNewModel(modelName);
    modelpage.verifyPageTitle(modelName);
  })

  /** FEATURE: Custom entity creation */
  it('should create CITY entity', function () {
    modelpage.navigateToEntities();
    entities.clickButtonNewEntity();
    entityModal.typeEntityName(customEntity01); //city
    entityModal.clickCreateButton();
    // Verify that the entity has been added
    cy.get('.ms-DetailsRow-cell')
      .should('contain', customEntity01)
  })

  /** FEATURE: New Action */
  it('should be able to ADD AN ACTION', () => {
    modelpage.navigateToActions();
    //Click Actions, then New Action
    actions.createNew();

    //In Response, type 'I don't know what city you want'.
    actionsModal.selectTypeText();
    actionsModal.typeOnResponseBox(action01); //"I don't know what city you want"

    //In Disqualifying Entities, enter $city. Click Save.
    actionsModal.typeDisqualifyingEntities('$city')
    actionsModal.clickCreateButton();
    //This means that if this entity is defined in bot's memory, then this action will not be available.

    //Click Actions, then New Action to create a second action.
    actions.createNew();

    //In Response, type 'The weather in the $city is probably sunny'.
    actionsModal.selectTypeText();
    actionsModal.typeOnResponseBox(action02); // "The weather in the $city is probably sunny"
    actionsModal.typeRequiredEntities('$city');

    //Click Save
    actionsModal.clickCreateButton();
  })

  it('should be able to TRAIN THE BOT', () => {
    modelpage.navigateToTrainDialogs();
    trainDialogPage.verifyPageTitle();
    trainDialogPage.createNew();
    trainDialogModal.typeYourMessage("Hello");      //1. Type 'hello'.
    trainDialogModal.clickScoreActions();
    scorerModal.selectAnActionWithText(action01);   //2. Select 'I don't know what city you want'.
    cy.wait(2000);
    trainDialogModal.typeYourMessage("Seattle");      //3. Type 'Seattle'.

    //**----------------- blocked from this step------------- */
    // 4. Highlight seattle, then click city.
    // 5. Click Score Actions
    // 6. <Validation step> Note city value is now in the bot's memory.
    // 7. 'Weather in $city is probably sunny' is now available as a response.
    // 8. Select 'Weather in $city is probably sunny'.
    //**----------------- TODO: to complete steps above ------------- */

    // trainDialogModal.highlightWord("Seattle");        // <<<=== BLOCKED.
    // trainDialogModal.verifyTokenNodeExists();
    // trainDialogModal.clickScoreActions();
    // scorerModal.selectAnActionWithText(action01);

    //** TODO: wrapt the test up after steps above */
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


