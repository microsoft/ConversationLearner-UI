/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as components from '../support/components'

describe('Hello world e2e', function () {
  const postfix = new Date().getTime() - 1528151000000
  const modelName = `e2e-HelloWorld-${postfix}`
  const entity01 = `UserName-${postfix}`
  const action01 = `Hello World`
  const trainmessage01 = `Hello`
  const trainmessage02 = `Hi`

  /** FEATURE: New Model */
  it('CREATE NEW MODEL with random name and verify name on application page', function () {
    components.homePage.navigateTo();
    components.homePage.createNewModel(modelName);
    components.modelPage.verifyPageTitle(modelName);
  })

  /** FEATURE:  New Identity */
  it('should create a NEW ENTITY', () => {
    components.modelPage.navigateToEntities();
    components.entitiesPage.createNew(entity01);
    components.entityModal.clickOnMultivalue();
    components.entityModal.save();
    cy.get('.ms-DetailsRow-cell')
      .contains(entity01)
  })

  /** FEATURE: New Action */
  it('should be able to ADD AN ACTION', () => {
    components.modelPage.navigateToActions();
    components.actionsPage.createNew();
    components.actionsModal.selectTypeText();
    components.actionsModal.setPhrase(action01);
    components.actionsModal.save();

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

    components.modelPage.navigateToTrainDialogs();
    components.trainDialogsPage.verifyPageTitle();
    components.trainDialogsPage.createNew();
    components.trainDialogModal.newUserMessage(trainmessage01);
    components.trainDialogModal.proceedToScoreAction();
    components.scorerModal.selectAnAction();
    // Perform chat entries validation
    cy.get('[id="botchat"]').contains(trainmessage01)
    cy.get('[id="botchat"]').contains(action01)
    components.trainDialogModal.done();

    components.trainDialogsPage.createNew();
    components.trainDialogModal.newUserMessage(trainmessage02);
    components.trainDialogModal.proceedToScoreAction();
    components.scorerModal.selectAnAction();
    // Perform chat entries validation
    cy.get('[id="botchat"]').contains(trainmessage02)
    cy.get('[id="botchat"]').contains(action01)
    components.trainDialogModal.done();
  })

  /** FEATURE: New Log Dialog */
  it('should add a new Log Dialog', () => {
    components.modelPage.navigateToLogDialogs();
    components.logDialogPage.verifyPageTitle();
    components.logDialogPage.createNew();
    components.logDialogModal.newUserMessage(trainmessage01);
    // Perform chat entries validation
    cy.get('[id="botchat"]').contains(trainmessage01);
    cy.get('[id="botchat"]').contains(action01);
    components.logDialogModal.clickDone();
  })

  /** FEATURE: Delete a Model */
  it('should delete an existent model', () => {
    // error handling
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })
    components.homePage.deleteModel(modelName);
    cy.end()
  })
})
