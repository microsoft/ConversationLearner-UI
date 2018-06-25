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
describe('Wait vs No Wait Action e2e test', function () {
  const postfix = Cypress.moment().format("MMMDD-HHmm")
  const modelName = `e2e-waitvsnowait-${postfix}`
  const action01 = "Which animal would you like?";
  const action02 = "Cows say moo!!";
  const action03 = "Ducks say quack!";
  const trainmessage01 = "Hello";
  const trainmessage02 = "Cow";
  const trainmessage03 = "Duck";

  beforeEach(function () {
    testLog.logTestHeader(this.currentTest.title);
    cy.viewport(1600, 900);
    // starts the listener
    cy.on('uncaught:exception', (err, runnable) => {
      testLog.logError(err);
      return false;
    })
  })

  afterEach(function () {
    testLog.logResult(this.currentTest);
    const fileName = `WaitVSNoWait_${this.currentTest.state}-${this.currentTest.title}`;
    cy.wait(3000)
      .screenshot(fileName);
  })

  /** FEATURE: New Model */
  it('create a New Model', function () {
    convLearnerPage.navigateTo();
    convLearnerPage.createNewModel(modelName);
    modelpage.verifyPageTitle(modelName);
  })

  /** FEATURE: New Action */
  it('should create Wait and Non Wait Actions', () => {
    modelpage.navigateToActions();

    // Wait Action:
    actions.createNew();
    actionsModal.selectTypeText();
    actionsModal.setPhrase(action01); //"Which animal would you like?"
    actionsModal.clickCreateButton();

    // No Wait Actions:
    actions.createNew();
    actionsModal.selectTypeText();
    actionsModal.setPhrase(action02); //"Cows say moo!!"
    actionsModal.clickWaitForResponse(); // Unselect
    actionsModal.clickCreateButton();

    actions.createNew();
    actionsModal.selectTypeText();
    actionsModal.setPhrase(action03); //"Ducks say quack";
    actionsModal.clickWaitForResponse(); // Unselect
    actionsModal.clickCreateButton();

    // Verify that the action has been added
    cy.get('.ms-DetailsRow-cell')
      .should('contain', action01)
      .and('contain', action02)
      .and('contain', action03)
  })

  /** FEATURE: New Train Dialog - using different types of Actions*/
  it('should train a dialog using Wait and Non Wait actions', () => {
    modelpage.navigateToTrainDialogs();
    trainDialogPage.verifyPageTitle();
    trainDialogPage.createNew();
    cy.wait(2000)
    trainDialogModal.typeYourMessage(trainmessage01); //Hello
    trainDialogModal.clickScoreActions();
    scorerModal.selectAnActionWithText(action01); //"Which animal would you like?"
    cy.wait(2000)
    trainDialogModal.typeYourMessage(trainmessage02); //Cow
    trainDialogModal.clickScoreActions();
    scorerModal.selectAnActionWithText(action02); //"Cows say moo!!"
    cy.wait(2000)
    scorerModal.selectAnActionWithText(action01); //"Which animal would you like?"
    cy.wait(2000)
    trainDialogModal.typeYourMessage(trainmessage03); //Duck
    trainDialogModal.clickScoreActions();
    scorerModal.selectAnActionWithText(action03); //"Ducks say quack";
    cy.wait(2000)
    scorerModal.selectAnActionWithText(action01); //"Which animal would you like?"
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
