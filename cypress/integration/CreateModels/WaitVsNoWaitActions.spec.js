/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as actions from '../../support/Actions'
import * as editDialogModal from '../../support/components/EditDialogModal'
import * as train from '../../support/Train'

describe('CreateModels', () => {
  it('Wait vs Non-Wait Actions', () => {
    models.CreateNewModel('z-waitNoWait')

    // NOTE: the {enter} in these strings are necessary to triger the entity detection.
    actions.CreateNewActionThenVerifyInGrid({ response: 'Which animal would you like?' })
    actions.CreateNewActionThenVerifyInGrid({ response: 'Cows say moo!', uncheckWaitForResponse: true })
    actions.CreateNewActionThenVerifyInGrid({ response: 'Ducks say quack!', uncheckWaitForResponse: true })
    actions.CreateNewActionThenVerifyInGrid({ response: 'Fish just swim.', uncheckWaitForResponse: true })
    actions.CreateNewActionThenVerifyInGrid({ type: 'END_SESSION', response: "That's All Folks.", uncheckWaitForResponse: true })

    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()
    train.CreateNewTrainDialog()

    train.TypeYourMessage('Duck')
    editDialogModal.ClickScoreActionsButton()
    train.SelectAction('Ducks say quack!')
    train.SelectAction('Which animal would you like?')

    train.TypeYourMessage('Fish')
    editDialogModal.ClickScoreActionsButton()
    train.SelectAction('Fish just swim.')

    train.Save()

    // Manually EXPORT this to fixtures folder and name it 'z-waitNoWait.cl'
  })
})