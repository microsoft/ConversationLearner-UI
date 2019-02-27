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
  it('Disqualifying Entities', () => {
    models.ImportModel('z-disqualifyngEnt', 'z-disqualifyngEnt.cl')

    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    train.CreateNewTrainDialog()

    train.TypeYourMessage('Hey')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsEnabledAction(common.whatsYourName)
    scorerModal.VerifyContainsDisabledAction('Hey $name')
    scorerModal.VerifyContainsDisabledAction('Hey $name, what do you really want?')
    scorerModal.VerifyContainsDisabledAction("Sorry $name, I can't help you get $want")
    train.SelectAction(common.whatsYourName)

    train.TypeYourMessage('Sam')
    editDialogModal.VerifyEntityLabel('Sam', 'name')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
    scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
    scorerModal.VerifyContainsEnabledAction('Hey Sam')
    scorerModal.VerifyContainsEnabledAction('Hey Sam, what do you really want?')
    scorerModal.VerifyContainsDisabledAction("Sorry Sam, I can't help you get $want")
    train.SelectAction('Hey Sam', 'Hey $name')

    train.TypeYourMessage('Hey')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
    scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
    scorerModal.VerifyContainsEnabledAction('Hey Sam')
    scorerModal.VerifyContainsEnabledAction('Hey Sam, what do you really want?')
    scorerModal.VerifyContainsDisabledAction("Sorry Sam, I can't help you get $want")
    train.SelectAction('Hey Sam, what do you really want?', 'Hey $name, what do you really want?')

    train.TypeYourMessage('world peace')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
    memoryTableComponent.VerifyEntityInMemory('want', 'world peace')
    scorerModal.VerifyContainsDisabledAction(common.whatsYourName)
    scorerModal.VerifyContainsDisabledAction('Hey Sam')
    scorerModal.VerifyContainsDisabledAction('Hey Sam, what do you really want?')
    scorerModal.VerifyContainsEnabledAction("Sorry Sam, I can't help you get world peace")
    train.SelectAction("Sorry Sam, I can't help you get world peace", "Sorry $name, I can't help you get $want")

    train.Save()
    // Manually EXPORT this to fixtures folder and name it 'z-disqualifyngEnt.Trained.cl'
  })
})