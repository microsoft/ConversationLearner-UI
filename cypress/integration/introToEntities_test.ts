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
    actionsModal.typeOnResponseBox("The weather in the "); // "The weather in the $city is probably sunny"
    actionsModal.typeLetterOnResponseBox("$");             // TODO: entity identification is not beinf fired when typing "$"
    actionsModal.typeOnResponseBox("city");
    actionsModal.typeOnResponseBox(" is probably");
    actionsModal.typeOnResponseBox("{enter}");
    cy.wait(2000);

    //STEP: In Required Entities, note that city entity has been added automatically since it was referred to. 
    //*** TODO: this is a work around: Cypress isn't firing the event 
    // that automatically resolves "$city" as required entity.
    actionsModal.typeRequiredEntities('$city');

    //Click Save
    actionsModal.clickCreateButton();
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
