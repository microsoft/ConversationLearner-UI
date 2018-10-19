/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const entities = require('../../support/Entities')
const actions = require('../../support/Actions')
const helpers = require('../../support/helpers')
const memoryTableComponent = require('../../support/components/MemoryTableComponent')
const scorerModal = require('../../support/components/ScorerModal')
const trainDialogPage = require('../../support/components/TrainDialogsPage')
const editDialogModal = require('../../support/components/EditDialogModal')

<<<<<<< HEAD
/// Description: Tests Disqualifying Entities affect on Actions
/// Verifications: Can Train, Entity Detection, Disqualified Entities, Actions Enabled/Disabled
describe("Disqualifying Entities test", () =>
{
=======
describe("Disqualifying Entities test", () =>
{
  after(() => { cy.VerifyMonitorFinds() })
  
>>>>>>> origin/master
  it("Disqualifying Entities", () =>
  {
    var modelName = models.ImportModel('Model-disq', 'Model-disq.cl')
    
    modelPage.NavigateToTrainDialogs()
    modelPage.WaitForTrainingStatusCompleted()

    trainDialogPage.CreateNewTrainDialog()

    editDialogModal.TypeYourMessage('Hey')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsEnabledAction("What's your name?")
    scorerModal.VerifyContainsDisabledAction('Hey $name')
    scorerModal.VerifyContainsDisabledAction('Hey $name, what do you really want?')
    scorerModal.VerifyContainsDisabledAction("Sorry $name, I can't help you get $want")
    scorerModal.ClickAction("What's your name?")

    editDialogModal.TypeYourMessage('Sam')
    editDialogModal.VerifyDetectedEntity('name', 'Sam')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
    scorerModal.VerifyContainsDisabledAction("What's your name?")
    scorerModal.VerifyContainsEnabledAction('Hey Sam')
    scorerModal.VerifyContainsEnabledAction('Hey Sam, what do you really want?')
    scorerModal.VerifyContainsDisabledAction("Sorry Sam, I can't help you get $want")
    scorerModal.ClickAction('Hey Sam')

    editDialogModal.TypeYourMessage('Hey')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
    scorerModal.VerifyContainsDisabledAction("What's your name?")
    scorerModal.VerifyContainsEnabledAction('Hey Sam')
    scorerModal.VerifyContainsEnabledAction('Hey Sam, what do you really want?')
    scorerModal.VerifyContainsDisabledAction("Sorry Sam, I can't help you get $want")
    scorerModal.ClickAction('Hey Sam, what do you really want?')

    editDialogModal.TypeYourMessage('world peace')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
    memoryTableComponent.VerifyEntityInMemory('want', 'world peace')
    scorerModal.VerifyContainsDisabledAction("What's your name?")
    scorerModal.VerifyContainsDisabledAction('Hey Sam')
    scorerModal.VerifyContainsDisabledAction('Hey Sam, what do you really want?')
    scorerModal.VerifyContainsEnabledAction("Sorry Sam, I can't help you get world peace")
    scorerModal.ClickAction("Sorry Sam, I can't help you get world peace")

    editDialogModal.ClickSaveButton()
  })
})

