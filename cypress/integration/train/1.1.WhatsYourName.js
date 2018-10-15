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

describe("What's your name", () =>
{
  it('should be able to train', () => {
    var modelName = models.ImportModel('Model1-wyn', 'Model1.cl')

    modelPage.NavigateToTrainDialogs()
    modelPage.WaitForTrainingStatusCompleted()
    
    trainDialogPage.CreateNewTrainDialog()

    editDialogModal.TypeYourMessage('Hello')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsDisabledAction('Hello $name')
    scorerModal.ClickAction("What's your name?")

    editDialogModal.TypeYourMessage('David')
    editDialogModal.VerifyDetectedEntity('name', 'David')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'David')
    scorerModal.ClickAction('Hello David')

    editDialogModal.ClickSaveButton()
  })
})
