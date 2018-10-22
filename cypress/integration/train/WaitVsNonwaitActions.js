/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/modelpage')
const scorerModal = require('../../support/components/ScorerModal')
const trainDialogPage = require('../../support/components/traindialogspage')
const editDialogModal = require('../../support/components/editdialogmodal')

/**
* Wait action: After the system takes a "wait" action, it will stop taking actions and wait for user input.
* Non-wait action: After the system takes a "non-wait" action, it will immediately choose another action (without waiting for user input)
*/
describe('Wait vs No Wait Action Test', () => 
{
  it('Wait vs No Wait Action Test', () => {
    var modelName = models.ImportModel('Model-0wait', 'Model-0wait.cl')
    
    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    trainDialogPage.CreateNewTrainDialog()

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
