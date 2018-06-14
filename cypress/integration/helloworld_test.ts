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
  logDialogModal } = components();

describe('Hello world e2e', function () {
  const postfix = new Date().getTime() - 1528151000000
  const modelName = `e2e-HelloWorld-${postfix}`
  const entity01 = `UserName-${postfix}`
  const action01 = `Hello World`
  const trainmessage01 = `Hello`
  const trainmessage02 = `Hi`

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
    cy.get('.ms-DetailsRow-cell')
      .contains(entity01)
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
      .contains(action01)
  })

  /** FEATURE: New Train Dialog */
  it('should add a new TRAIN DIALOG', () => {
    // error handling
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })

    modelpage.navigateToTrainDialogs();
    trainDialogPage.verifyPageTitle();
    trainDialogPage.createNew();
    trainDialogModal.newUserMessage(trainmessage01);
    trainDialogModal.proceedToScoreAction();
    scorerModal.selectAnAction();
    // Perform chat entries validation
    cy.get('[id="botchat"]').contains(trainmessage01)
    cy.get('[id="botchat"]').contains(action01)
    trainDialogModal.done();

    trainDialogPage.createNew();
    trainDialogModal.newUserMessage(trainmessage02);
    trainDialogModal.proceedToScoreAction();
    scorerModal.selectAnAction();
    // Perform chat entries validation
    cy.get('[id="botchat"]').contains(trainmessage02)
    cy.get('[id="botchat"]').contains(action01)
    trainDialogModal.done();
  })

  /** FEATURE: New Log Dialog */
  it('should add a new Log Dialog', () => {
    modelpage.navigateToLogDialogs();
    logDialogPage.verifyPageTitle();
    logDialogPage.createNew();
    logDialogModal.newUserMessage(trainmessage01);
    // Perform chat entries validation
    cy.get('[id="botchat"]').contains(trainmessage01);
    cy.get('[id="botchat"]').contains(action01);
    logDialogModal.clickDone();
  })

  /** FEATURE: Delete a Model */
  it('should delete an existent model', () => {
    // error handling
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })
    convLearnerPage.deleteModel(modelName);
    cy.end()
  })
})

function components() {
  const actions = require('../support/components/ActionsPage');
  const actionsModal = require('../support/components/ActionsModal');
  const convLearnerPage = require('../support/components/Homepage');
  const entity = require('../support/components/EntitiesPage');
  const entityModal = require('../support/components/EntityModal');
  const modelpage = require('../support/components/ModelPage');
  const logDialogPage = require('../support/components/LogDialogsPage');
  const logDialogModal = require('../support/components/LogDialogModal');
  const scorerModal = require('../support/components/ScorerModal');
  const trainDialogPage = require('../support/components/TrainDialogsPage');
  const trainDialogModal = require('../support/components/TrainDialogModal');
  return { convLearnerPage, modelpage, entity, entityModal, actions, actionsModal, trainDialogPage, trainDialogModal, scorerModal, logDialogPage, logDialogModal };
}
