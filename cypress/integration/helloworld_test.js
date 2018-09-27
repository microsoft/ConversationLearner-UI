/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const actions = require('../support/components/actionspage')
const actionsModal = require('../support/components/actionsmodal')
const modelsListPage = require('../support/components/modelsList')
const entities = require('../support/components/entitiespage')
const entityModal = require('../support/components/entitymodal')
const modelPage = require('../support/components/modelpage')
const logDialogPage = require('../support/components/logdialogspage')
const scorerModal = require('../support/components/scorermodal')
const trainDialogPage = require('../support/components/traindialogspage')
const editDialogModal = require('../support/components/editdialogmodal')

describe('Hello-World', function () {
  const postfix = Cypress.moment().format("MMMDD-HHmmSSS")
  const modelName = `e2e-HelloWorld-${postfix}`
  const entity01 = `UserName-${postfix}`
  const action01 = `Hello World`
  const trainmessage01 = `Hello`
  const trainmessage02 = `Hi`

  afterEach(function () {
    const fileName = `HelloWorld_${this.currentTest.state}-${this.currentTest.title}`;
    cy.wait(200)
      .screenshot(fileName)
  })

  it('should create new model with random name and verify transition to model page', function () {
    modelsListPage.navigateTo()
    modelsListPage.createNewModel(modelName)
    modelPage.verifyPageTitle(modelName)
  })

  it('should create a new entity and verify it is added to the list', () => {
    modelPage.navigateToEntities()
    entities.clickButtonNewEntity()
    entityModal.typeEntityName(entity01)
    entityModal.clickOnMultiValue()
    entityModal.clickCreateButton()
    entities.verifyItemInList(entity01)
  })

  it('should add an action and verify it is added to the list', () => {
    modelPage.navigateToActions()
    actions.clickNewAction()
    actionsModal.selectTypeText()
    actionsModal.typeOnResponseBox(action01)
    actionsModal.clickCreateButton()
    actions.verifyItemInList(action01)
  })

  /** FEATURE: New Train Dialog */
  it('should add a new train dialog', () => {
    cy.wait(1000)

    modelPage.navigateToTrainDialogs()
    trainDialogPage.verifyPageTitle()
    trainDialogPage.createNew()
    editDialogModal.typeYourMessage(trainmessage01)
    editDialogModal.clickScoreActions()
    scorerModal.selectAnAction()

    // Perform chat entries validation
    cy.get('[id="botchat"]')
      .should('contain', trainmessage01)
      .and('contain', action01)
      .wait(500)

    editDialogModal.clickDoneTeaching()
    trainDialogPage.createNew()
    editDialogModal.typeYourMessage(trainmessage02)
    editDialogModal.clickScoreActions()
    scorerModal.selectAnAction()

    // Perform second chat entries validation
    cy.get('[id="botchat"]')
      .should('contain', trainmessage02)
      .and('contain', action01);
    editDialogModal.clickDoneTeaching();
  })

  /** FEATURE: New Log Dialog */
  // TODO: Fix this test once MonitorDocumentChanges changes are stable
  it('should add a new Log Dialog', () => {
    cy.wait(1000)

    modelPage.navigateToLogDialogs();
    logDialogPage.verifyPageTitle();
    logDialogPage.createNew();
    editDialogModal.typeYourMessage(trainmessage01);
    cy.wait(3000);

    // Perform chat entries validation
    cy.get('[id="botchat"]')
      .should('contain', trainmessage01)
      .and('contain', action01)
      editDialogModal.clickDoneTeaching();
  })

  /** FEATURE: Delete a Model */
  it('should delete an existent model', () => {
    modelsListPage.navigateTo();
    modelsListPage.deleteModel(modelName);
    cy.end()
  })
})
