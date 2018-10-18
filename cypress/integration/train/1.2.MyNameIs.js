/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const memoryTableComponent = require('../../support/components/MemoryTableComponent')
const scorerModal = require('../../support/components/ScorerModal')
const trainDialogPage = require('../../support/components/TrainDialogsPage')
const editDialogModal = require('../../support/components/EditDialogModal')

describe("My name is", () =>
{
  after(() => { cy.VerifyMonitorFinds() })
  
  it('should be able to train', () => 
  {
    var modelName = models.ImportModel('Model1-mni', 'Model1-wyn.cl')
    modelPage.NavigateToTrainDialogs()
    modelPage.WaitForTrainingStatusCompleted()

    trainDialogPage.CreateNewTrainDialog()

    editDialogModal.TypeYourMessage('My name is David.') // TODO: Add edge cases; 'david', with & without 'period'
    editDialogModal.VerifyDetectedEntity('name', 'David')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'David')
    scorerModal.VerifyContainsDisabledAction("What's your name?")
    scorerModal.ClickAction('Hello David')

    // Wait for the training to complete.
    // At the time this was added, there is no UI elements to let us know it is complete.
    cy.wait(20000)

    editDialogModal.TypeYourMessage('My name is Susan.')
    editDialogModal.VerifyDetectedEntity('name', 'Susan')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'Susan', 'David')
    scorerModal.VerifyContainsDisabledAction("What's your name?")
    scorerModal.ClickAction('Hello Susan')

    editDialogModal.ClickSaveButton()
  })
})
