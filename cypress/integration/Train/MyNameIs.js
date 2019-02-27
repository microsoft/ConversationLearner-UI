/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const memoryTableComponent = require('../../support/components/MemoryTableComponent')
const scorerModal = require('../../support/components/ScorerModal')
const train = require('../../support/Train')
const editDialogModal = require('../../support/components/EditDialogModal')
const common = require('../../support/Common')

describe('Train', () => {
  it('My Name Is', () => {
    models.ImportModel('z-myNameIs', 'z-myNameIs.cl')
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    train.CreateNewTrainDialog()

    train.TypeYourMessage('My name is David.')
    editDialogModal.VerifyEntityLabel('David', 'name')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'David')
    scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
    scorerModal.VerifyContainsEnabledAction('Hello David')
    train.SelectAction('Hello David', 'Hello $name')

    cy.WaitForTrainingStatusCompleted()

    train.TypeYourMessage('My name is Susan.')
    editDialogModal.VerifyEntityLabel('Susan', 'name')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'Susan', 'David')
    scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
    scorerModal.VerifyContainsEnabledAction('Hello Susan')
    train.SelectAction('Hello Susan', 'Hello $name')

    train.Save()

    // Manually EXPORT this to fixtures folder and name it 'z-nameTrained.cl'
  })
})