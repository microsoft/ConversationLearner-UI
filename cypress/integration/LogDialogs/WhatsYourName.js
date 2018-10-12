/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../../support/components/HomePage')
const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const actionsPage = require('../../support/components/ActionsPage')
const actionsModal = require('../../support/components/ActionsModal')
const entities = require('../../support/components/EntitiesPage')
const entityModal = require('../../support/components/EntityModal')
const logDialogPage = require('../../support/components/logdialogspage')
const memoryTableComponent = require('../../support/components/MemoryTableComponent')
const scorerModal = require('../../support/components/ScorerModal')
const trainDialogPage = require('../../support/components/TrainDialogsPage')
const editDialogModal = require('../../support/components/EditDialogModal')
const helpers = require('../../support/helpers')

describe("What's your name", () =>
{
  it('Chat up the bot', () => {
    var modelName = models.ImportModel('Model1-chat', 'Model1-mni.cl')

    modelPage.NavigateToLogDialogs()
    modelPage.WaitForTrainingStatusCompleted()

    logDialogPage.CreateNewLogDialogButton()

    logDialogPage.TypeYourMessage("Hello", "What's your name?")

    logDialogPage.ClickDoneTestingButton()
  })
})
