/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const modelPage = require('../support/components/ModelPage')
const actions = require('../support/Actions')
const editDialogModal = require('../support/components/EditDialogModal')
const train = require('../support/Train')
const common = require('../support/Common')

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
    editDialogModal.ClickScoreActionsButton()
    train.SelectAction('Action One')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action Two')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action Three')

    train.Save()

    train.CreateNewTrainDialog()

    train.TypeYourMessage('howdy')
    editDialogModal.ClickScoreActionsButton()
    train.SelectAction('Action Two')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action Three')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action One')

    train.Save()

    train.CreateNewTrainDialog()

    train.TypeYourMessage('namaste')
    editDialogModal.ClickScoreActionsButton()
    train.SelectAction('Action Three')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action Two')
    cy.WaitForTrainingStatusCompleted()
    train.SelectAction('Action One')

    train.Save()

    // Manually EXPORT this to fixtures folder and name it 'z-endlessLoop.cl'
  })
})