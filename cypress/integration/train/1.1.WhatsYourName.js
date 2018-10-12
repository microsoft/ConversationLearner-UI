/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../../support/components/HomePage')
const models = require('../../support/Models')
const modelPage = require('../../support/components/ModelPage')
const actions = require('../../support/components/ActionsPage')
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
  // afterEach(() =>  { cy.DumpHtmlOnDomChange(false); helpers.ConLog(`afterEach`, `Current HTML:\n${Cypress.$('html')[0].outerHTML}`)})

  it('should be able to train', () => {
    var modelName = models.ImportModel('Model1-wyn', 'Model1.cl')

    modelPage.NavigateToTrainDialogs()
    modelPage.WaitForTrainingStatusCompleted()
    
    trainDialogPage.CreateNewTrainDialog()

    editDialogModal.TypeYourMessage("Hello")
    editDialogModal.ClickScoreActionsButton()
    scorerModal.VerifyContainsDisabledAction("Hello $name")
    scorerModal.ClickAction("What's your name?")

    editDialogModal.TypeYourMessage("David")
    editDialogModal.VerifyDetectedEntity("name", "David")
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory("name", "David")
    scorerModal.ClickAction("Hello David")

    editDialogModal.ClickSaveButton()
  })
})
