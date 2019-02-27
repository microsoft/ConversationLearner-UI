/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const scorerModal = require('../../support/components/ScorerModal')
const train = require('../../support/Train')
const editDialogModal = require('../../support/components/EditDialogModal')
const common = require('../../support/Common')

describe('Train', () => {
  it('Wait vs Non-Wait Actions', () => {
    models.ImportModel('z-waitNoWait', 'z-waitNoWait.cl')

    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()

    train.CreateNewTrainDialog()

    train.TypeYourMessage('Hello')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
    scorerModal.VerifyContainsEnabledAction('Cows say moo!')
    scorerModal.VerifyContainsEnabledAction(common.ducksSayQuack)
    train.SelectAction('Which animal would you like?')

    train.TypeYourMessage('Cow')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
    scorerModal.VerifyContainsEnabledAction('Cows say moo!')
    scorerModal.VerifyContainsEnabledAction(common.ducksSayQuack)
    train.SelectAction('Cows say moo!')

    train.SelectAction('Which animal would you like?')

    train.TypeYourMessage('Duck')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsEnabledAction('Which animal would you like?')
    scorerModal.VerifyContainsEnabledAction('Cows say moo!')
    scorerModal.VerifyContainsEnabledAction(common.ducksSayQuack)
    train.SelectAction(common.ducksSayQuack)

    train.SelectAction('Which animal would you like?')

    train.Save()
  })
})