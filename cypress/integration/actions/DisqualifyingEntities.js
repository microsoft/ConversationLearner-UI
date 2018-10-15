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

describe("Disqualifying Entities test", () =>
{
  it("Disqualifying Entities", () =>
  {
    models.CreateNewModel(`Model-disq-${helpers.ModelNameTime()}`)
    entities.CreateNewEntity({name: 'name'})
    entities.CreateNewEntity({name: 'want'})

    // NOTE: the {enter} in these strings are necessary to triger the entity detection.
    actions.CreateNewAction({response: "What's your name?", disqualifyingEntities: 'name'})
    actions.CreateNewAction({response: 'Hey $name{enter}'})
    actions.CreateNewAction({response: 'Hey $name{enter}, what do you really want?', disqualifyingEntities: ['name', 'want']})
    actions.CreateNewAction({response: "Sorry $name{enter} I can't help you $want{enter}"})

    modelPage.NavigateToTrainDialogs()
    modelPage.WaitForTrainingStatusCompleted()

    trainDialogPage.CreateNewTrainDialog()

    editDialogModal.TypeYourMessage('Hey')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsEnabledAction('Hey $name')
    scorerModal.VerifyContainsEnabledAction('Hey $name, what do you really want?')
    scorerModal.VerifyContainsDisabledAction("Sorry $name I can't help you $want")
    scorerModal.ClickAction("What's your name?")

    editDialogModal.TypeYourMessage('Sam')
    editDialogModal.VerifyDetectedEntity('name', 'Sam')
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory('name', 'Sam')
    scorerModal.ClickAction('Hey Sam')

    editDialogModal.TypeYourMessage('Hey')
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsDisabledAction("What's your name?")
    scorerModal.VerifyContainsEnabledAction('Hey $name')
    scorerModal.VerifyContainsEnabledAction('Hey $name, what do you really want?')
    scorerModal.VerifyContainsDisabledAction("Sorry $name I can't help you $want")
    scorerModal.ClickAction('Hey $name, what do you really want?')

    editDialogModal.ClickSaveButton()
  })
})

