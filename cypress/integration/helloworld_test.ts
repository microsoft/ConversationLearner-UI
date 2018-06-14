/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
var actions = require('../support/components/actionspage')
var actionsModal = require('../support/components/actionsmodal')
var convLearnerPage = require('../support/components/homepage')
var conversationsModal = require('../support/components/conversationsmodal')
var entity = require('../support/components/entitypage')
var entityModal = require('../support/components/entitymodal')
var modelpage = require('../support/components/modelpage')
var scorerModal = require('../support/components/scorermodal')
var trainDialogPage = require('../support/components/traindialogspage')

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
    conversationsModal.newUserMessage(trainmessage01);
    conversationsModal.proceedToScoreAction();
    scorerModal.selectAnAction();
    // Perform chat entries validation
    cy.get('[id="botchat"]').contains(trainmessage01)
    cy.get('[id="botchat"]').contains(action01)
    conversationsModal.done();

    trainDialogPage.createNew();
    conversationsModal.newUserMessage(trainmessage02);
    conversationsModal.proceedToScoreAction();
    scorerModal.selectAnAction();
    // Perform chat entries validation
    cy.get('[id="botchat"]').contains(trainmessage02)
    cy.get('[id="botchat"]').contains(action01)
    conversationsModal.done();
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