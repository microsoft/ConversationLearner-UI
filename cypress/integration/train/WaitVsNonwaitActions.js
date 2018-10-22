/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const scorerModal = require('../../support/components/ScorerModal')
const trainDialogsGrid = require('../../support/components/TrainDialogsGrid')
const editDialogModal = require('../../support/components/EditdialogModal')

// Wait Action: After the system takes a "wait" action, it will stop taking actions and wait for user input.
// Non-wait Action: After the system takes a "non-wait" action, it will immediately choose another action (without waiting for user input)
describe('Wait vs No Wait Action Test', () => 
{
  it('Wait vs No Wait Action Test', () => {
    var modelName = models.ImportModel('Model-0wait', 'Model-0wait.cl')
    
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    trainDialogsGrid.CreateNewTrainDialog()

    editDialogModal.TypeYourMessage('Hello')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
    scorerModal.VerifyContainsEnabledAction('Cows say moo!')
    scorerModal.VerifyContainsEnabledAction('Ducks say quack!')
    scorerModal.ClickAction('Which animal would you like?')

    editDialogModal.TypeYourMessage('Cow')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
    scorerModal.VerifyContainsEnabledAction('Cows say moo!')
    scorerModal.VerifyContainsEnabledAction('Ducks say quack!')
    scorerModal.ClickAction('Cows say moo!')
    
    scorerModal.ClickAction('Which animal would you like?')

    editDialogModal.TypeYourMessage('Duck')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
    scorerModal.VerifyContainsEnabledAction('Cows say moo!')
    scorerModal.VerifyContainsEnabledAction('Ducks say quack!')
    scorerModal.ClickAction('Ducks say quack!')

    scorerModal.ClickAction('Which animal would you like?')

    editDialogModal.ClickSaveButton()
  })
})
