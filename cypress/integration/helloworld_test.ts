/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
const { convLearnerPage,
  modelpage,
  entity,
  entityModal,
  actions,
  actionsModal,
  trainDialogPage,
  trainDialogModal,
  scorerModal,
  logDialogPage,
  logDialogModal,
  testLog } = components();

describe('Hello world e2e', function () {
  const postfix = Cypress.moment().format("MMMDD-HHmm")
  const modelName = `e2e-HelloWorld-${postfix}`
  const entity01 = `UserName-${postfix}`
  const action01 = `Hello World`
  const trainmessage01 = `Hello`
  const trainmessage02 = `Hi`

  beforeEach(function () {
    testLog.logTestHeader(this.currentTest.title);
    // starts the listener
    cy.on('uncaught:exception', (err, runnable) => {
      testLog.logError(err);
      return false;
    })
  })

  afterEach(function () {
    testLog.logResult(this.currentTest);
    const fileName = `HelloWorld_${this.currentTest.state}-${this.currentTest.title}`;
    cy.wait(3000)
      .screenshot(fileName);
  })

  /** FEATURE: New Model */
  it('CREATE NEW MODEL with random name and verify name on application page', function () {
    convLearnerPage.navigateTo();
    convLearnerPage.createNewModel(modelName);
    modelpage.verifyPageTitle(modelName);
  })

  /** FEATURE:  New Identity */
  it('should create a NEW ENTITY', () => {
    modelpage.navigateToEntities();
    entity.createNew(entity01);
    entityModal.clickOnMultivalue();
    entityModal.save();

    // Verify that the entity has been added
    cy.get('.ms-DetailsRow-cell')
      .should('contain', entity01)
  })

  /** FEATURE: New Action */
  it('should be able to ADD AN ACTION', () => {
    modelpage.navigateToActions();
    actions.createNew();
    actionsModal.selectTypeText();
    actionsModal.setPhrase(action01);
    actionsModal.save();

    // Verify that the action has been added
    cy.get('.ms-DetailsRow-cell')
      .should('contain', action01)
  })

  /** FEATURE: New Train Dialog */
  it('should add a new TRAIN DIALOG', () => {
    modelpage.navigateToTrainDialogs();
    trainDialogPage.verifyPageTitle();
    trainDialogPage.createNew();
    cy.wait(1000)
      .then(function () {
        trainDialogModal.newUserMessage(trainmessage01);
        trainDialogModal.proceedToScoreAction();
        scorerModal.selectAnAction();

        // Perform chat entries validation
        cy.get('[id="botchat"]')
          .should('contain', trainmessage01)
          .and('contain', action01);
        trainDialogModal.done();
      })

    trainDialogPage.createNew();
    cy.wait(2000)
      .then(function () {
        trainDialogModal.newUserMessage(trainmessage02);
        trainDialogModal.proceedToScoreAction();
        scorerModal.selectAnAction();
        // Perform second chat entries validation
        cy.get('[id="botchat"]')
          .should('contain', trainmessage02)
          .and('contain', action01);
        trainDialogModal.done();
      })
  })

  /** FEATURE: New Log Dialog */
  it('should add a new Log Dialog', () => {
    modelpage.navigateToLogDialogs();
    logDialogPage.verifyPageTitle();
    logDialogPage.createNew();
    logDialogModal.newUserMessage(trainmessage01);
    cy.wait(3000);

    // Perform chat entries validation
    cy.get('[id="botchat"]')
      .should('contain', trainmessage01)
      .and('contain', action01)
    logDialogModal.clickDone();
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
  const entity = require('../support/components/entitiespage');
  const entityModal = require('../support/components/entitymodal');
  const modelpage = require('../support/components/modelpage');
  const logDialogPage = require('../support/components/logdialogspage');
  const logDialogModal = require('../support/components/logdialogmodal');
  const scorerModal = require('../support/components/scorermodal');
  const trainDialogPage = require('../support/components/traindialogspage');
  const trainDialogModal = require('../support/components/traindialogmodal');
  const testLog = require('../support/utils/testlog');
  return { convLearnerPage, modelpage, entity, entityModal, actions, actionsModal, trainDialogPage, trainDialogModal, scorerModal, logDialogPage, logDialogModal, testLog };
}
