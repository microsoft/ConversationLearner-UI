/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as scorerModal from '../../support/components/ScorerModal'
import * as train from '../../support/Train'
import * as editDialogModal from '../../support/components/EditDialogModal'
import * as common from '../../support/Common'

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