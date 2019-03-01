const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const editDialogModal = require('../../support/components/EditDialogModal')
const train = require('../../support/Train')
const helpers = require('../../support/Helpers')

describe('Training Scenario and Tags', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Train Dialogs', () => {
    it('Imports a model to test against', () => {
      // import the saved model for tags and description testing
      models.ImportModel('z-TagAndScenario', 'z-whatsYourName.cl')
    })

    context('Create', () => {
      it('Should have no Scenario nor Tags when creating new dialog.', () => {
        // Create new train dialog
        // Verify that tags and description are empty
        modelPage.NavigateToTrainDialogs()
        //cy.WaitForTrainingStatusCompleted()
        train.CreateNewTrainDialog()
        
        editDialogModal.VerifyScenario('')
        editDialogModal.VerifyTags([])
      })

      it('should save the tags and description on the new dialog', () => {
        // Set tags
        // Set description
        // Save
        // Verify tags and description in list
        
        editDialogModal.TypeScenario('Test Scenario')
        editDialogModal.AddTag('TagX')

        // Must have done some training in order to save the dialog.
        train.TypeYourMessage('Hello')
        editDialogModal.ClickScoreActionsButton()
        train.SelectAction("What's your name?")

        train.Save()
      })
    })

    context('Edit', () => {
      it('should open with the tags and description', () => {
        // Find train dialog in list
        // Note the tags and description
        // Open it
        // Verify tags and description are the same as shown in the list
        train.EditTrainingNEW('TagX', 'Test Scenario')
        editDialogModal.VerifyScenario('Test Scenario')
        editDialogModal.VerifyTags(['TagX'])
      })

      it('should discard the changes made to tags and description when abandoned', () => {
        // Open train dialog
        // Save current tags and description
        // Edit tags
        // Edit description
        // Abandon changes
        // Re-open dialog
        // Verify tags and description are unmodified
        editDialogModal.TypeScenario('Changed Test Scenario')
        editDialogModal.AddTag('TagY')
        train.AbandonDialog()

        train.EditTrainingNEW('TagX', 'Test Scenario')
        editDialogModal.VerifyScenario('Test Scenario')
        editDialogModal.VerifyTags(['TagX'])
      })

      it('should save the edited tags and description', () => {
        // Open train dialog
        // Edit tags
        // Edit description
        // Note tags and description
        // reload
        // Verify edited tags and description are still on dialog
        editDialogModal.TypeScenario('Edited Test Scenario')
        editDialogModal.AddTag('TagY')
        train.Save()

        train.EditTrainingNEW('TagXTagY', 'Edited Test Scenario')
        editDialogModal.VerifyScenario('Edited Test Scenario')
        editDialogModal.VerifyTags(['TagX', 'TagY'])
      })

      it('(advanced edit) should save the edited tags, description, and rounds', () => {
        // Open train dialog
        // Edit tags
        // Edit description
        // Modify dialog to add user input
        // Modify dialog to add bot response
        // Save
        // Reload
        // Re-open dialog
        // Verify edited tags, description, and rounds
        expect(true).to.equal(true)
      })
    })


    context('Continue', () => {
      it('should preserve tags and description when continuing a dialog', () => {
        // Open train dialog
        // Edit the tags
        // Edit the description
        // Type into webchat to continue the dialog
        // Verify the edited tags and description are the same
        // Save the dialog
        // Verify the edited tags and description are in the list
        expect(true).to.equal(true)
      })
    })

    context('Branch', () => {
      it('should preserve tags and description after branching', () => {
        // Open train dialog
        // Edit tags
        // Edit description
        // Click branch on one of the user inputs
        // Enter a new input
        // (Dialog is branched after input is entered)
        // Verify edited tags and description are preserved
        // Save dialog
        // Reload
        // Verify old dialog with original tags and description is still in the list
        // Verify new dialog with edited tags and description is now in the list
        expect(true).to.equal(true)
      })
    })
  })

  context('Log Dialogs', () => {
    before(() => {
      // import model for testing tags and description on log dialogs
    })

    it('should not show tags or description fields on log dialogs', () => {
      // Open log dialog
      // Verify that the tags and description fields do not show up
      // Enter into webchat to continue the dialog
      // Verify that the tags and description fields still do not show up on new window
      expect(true).to.equal(true)
    })
  })
})