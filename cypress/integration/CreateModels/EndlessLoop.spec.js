/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as actions from '../../support/Actions'
import * as train from '../../support/Train'
import * as common from '../../support/Common'

describe('CreateModels', () => {
  it('Endless Loop', () => {
    // models.ImportModel('z-endlessLoop', 'z-endlessLoop.cl')
    models.CreateNewModel('z-endlessLoop')
    actions.CreateNewActionThenVerifyInGrid({ response: "Action One", uncheckWaitForResponse: true })
    actions.CreateNewActionThenVerifyInGrid({ response: "Action Two", uncheckWaitForResponse: true })
    actions.CreateNewActionThenVerifyInGrid({ response: "Action Three", uncheckWaitForResponse: true })

    modelPage.NavigateToTrainDialogs()
    cy.WaitForTrainingStatusCompleted()
    train.CreateNewTrainDialog()

    train.TypeYourMessage('hi')
    train.ClickScoreActionsButton()
    train.SelectAction('Action One')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action Two')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action Three')

    train.Save()

    train.CreateNewTrainDialog()

    train.TypeYourMessage('howdy')
    train.ClickScoreActionsButton()
    train.SelectAction('Action Two')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action Three')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action One')

    train.Save()

    train.CreateNewTrainDialog()

    train.TypeYourMessage('namaste')
    train.ClickScoreActionsButton()
    train.SelectAction('Action Three')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action Two')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action One')

    train.Save()

    // Manually EXPORT this to fixtures folder and name it 'z-endlessLoop.cl'
  })
})