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

describe("My name is", () =>
{
  // afterEach(() =>  { cy.DumpHtmlOnDomChange(false); helpers.ConLog(`afterEach`, `Current HTML:\n${Cypress.$('html')[0].outerHTML}`)})

  it('should be able to train', () => {
    // TODO: FIX THESE COMMENTS
    // 4.9	Click New Train Dialog.
    // 4.10	Enter 'my name is david'.
    // 4.10.1	<Validation Step> Note that it does identify david as the name entity because it has seen this word before.
    // 4.11	Click Score Actions
    // 4.12	Select 'Hello $name'.
    // 4.13	Enter 'my name is susan'.
    // 4.13.1	<Validation Step> Note that it identifies susan as the name since it has seen this pattern already.
    // 4.14	Click Score Actions.
    // 4.15	Select 'Hello susan'.
    // 4.16	Click Done Teaching.

    var modelName = models.ImportModel('Model1-mni', 'Model1-wyn.cl')
    modelPage.NavigateToTrainDialogs()
    
    // Wait for the training to complete.
    // At the time this was added, there is no UI elements to let us know it is complete.
    cy.wait(20000)

    // 4.9	Click New Train Dialog.
    trainDialogPage.CreateNewTrainDialog()

    // 4.10	Enter 'my name is david'.
    editDialogModal.TypeYourMessage("My name is David.") // TODO: Add edge cases; 'david', with & without 'period'
    
    // 4.10.1	<Validation Step> Note that it does identify david as the name entity because it has seen this word before.
    // 4.11	Click Score Actions
    editDialogModal.ClickScoreActionsButton()
    memoryTableComponent.VerifyEntityInMemory("name", "David")
    scorerModal.VerifyContainsDisabledAction("What's your name?")

    // 4.12	Select 'Hello $name'.
    scorerModal.ClickAction("Hello $name")

    // 4.13	Enter 'my name is susan'.
    editDialogModal.TypeYourMessage("My name is Susan.")

    // 4.13.1	<Validation Step> Note that it identifies susan as the name since it has seen this pattern already.
    editDialogModal.ClickEntityDetectionToken("Susan")

    // 4.14	Click Score Actions.
    // 4.15	Select 'Hello susan'.
    // 4.16	Click Done Teaching.

    // cy.pause()//.wait(2000)
    // editDialogModal.clickDoneTeaching()
    //monitorDocumentChanges.Stop()
  })
})
