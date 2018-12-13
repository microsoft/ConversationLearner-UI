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

/**
* Wait action: After the system takes a "wait" action, it will stop taking actions and wait for user input.
* Non-wait action: After the system takes a "non-wait" action, it will immediately choose another action (without waiting for user input)
*/
describe('Label text in train dialog', function () {
  const postfix = Cypress.moment().format("MMMDD-HHmm")
  const modelName = `e2e-entity-${postfix}`

  it('create a New Model', function () {
    convLearnerPage.navigateTo();
    convLearnerPage.createNewModel(modelName);
    modelpage.verifyPageTitle(modelName);
  })

  it('should train a dialog using Wait and Non Wait actions', () => {
    modelpage.navigateToTrainDialogs();
    trainDialogPage.verifyPageTitle();
    trainDialogPage.createNew();
    cy.wait(2000)
    trainDialogModal.typeYourMessage('my hovercraft is full of eels');
    cy.wait(2000)
    trainDialogModal.labelWords('hovercraft is', 'myEntity')
    trainDialogModal.clickScoreActions();
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
