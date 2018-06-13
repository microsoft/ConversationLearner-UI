describe('Hello world e2e', function () {
  const postfix = new Date().getTime() - 1528151000000
  const modelName = `e2e-HelloWorld-${postfix}`
  const entity01 = `UserName-${postfix}`
  const action01 = `Hello World`
  const trainmessage01 = `Hello`
  const trainmessage02 = `Hi`

  /** FEATURE: New Model */
  it('CREATE NEW MODEL with random name and verify name on application page', function () {
    var modelpage = require('../support/components/modelpage')
    var convLearnerPage = require('../support/components/homepage')
    convLearnerPage.NavigateTo();
    convLearnerPage.CreateNewModel(modelName);
    modelpage.VerifyPageTitle(modelName);
  })

  /** FEATURE:  New Identity */
  it('should create a NEW ENTITY', () => {
    var entity = require('../support/components/entitypage')
    var entityModal = require('../support/components/entitymodal')

    entity.NavigateTo();
    entity.createNew(entity01);
    entityModal.clickOnMultivalue();
    entityModal.save();
    cy.get('.ms-DetailsRow-cell')
      .contains(entity01)
  })

  /** FEATURE: New Action */
  it('should be able to ADD AN ACTION', () => {
    var actions = require('../support/components/actionspage')
    var actionsModal = require('../support/components/actionsmodal')

    actions.NavigateTo();
    actions.CreateNew();
    actions.SelectTypeText();
    actions.SetPhrase(action01);
    actions.Save();

    // Verify that the action has been added
    cy.get('.ms-DetailsRow-cell')
      .contains(action01)
  })

  /** FEATURE: New Train Dialog */
  it('should add a new TRAIN DIALOG', () => {

    var conversationsModal = require('../support/components/conversationsmodal')
    var scorerModal = require('../support/components/scorermodal')
    var trainDialogPage = require('../support/components/traindialogspage')

    // error handling
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })

    trainDialogPage.NavigateTo();
    trainDialogPage.VerifyPageTitle();
    trainDialogPage.CreateNew();
    conversationsModal.NewUserMessage(trainmessage01);
    conversationsModal.ProceedToScoreAction();
    scorerModal.SelectAnAction();
    // Perform chat entries validation
    cy.get('[id="botchat"]').contains(trainmessage01)
    cy.get('[id="botchat"]').contains(action01)
    conversationsModal.Done();

    trainDialogPage.CreateNew();
    conversationsModal.NewUserMessage(trainmessage02);
    conversationsModal.ProceedToScoreAction();
    scorerModal.SelectAnAction();
    // Perform chat entries validation
    cy.get('[id="botchat"]').contains(trainmessage02)
    cy.get('[id="botchat"]').contains(action01)
    conversationsModal.Done();
  })

  /** FEATURE: Delete a Model */
  it('should delete an existent model', () => {
    var convLearnerPage = require('../support/components/homepage')

    // error handling
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })
    convLearnerPage.DeleteModel(modelName);
    cy.end()
  })
})
