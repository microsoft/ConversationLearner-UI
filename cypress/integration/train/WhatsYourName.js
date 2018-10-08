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
  var modelName // = models.CreateModel1()
  
  beforeEach(() => { modelName = models.CreateModel1() })
  // afterEach(() =>  { cy.DumpHtmlOnDomChange(false); helpers.ConLog(`afterEach`, `Current HTML:\n${Cypress.$('html')[0].outerHTML}`)})

  it('should be able to train', () => {
    // TODO: FIX THESE COMMENTS
    // 4	Train the bot
    // 4.1	Click Train Dialogs, then New Train Dialog.
    // 4.2	Type 'hello'.
    // 4.3	Click Score Actions, and Select 'What's your name?'
    // 4.3.1	<Validation Step> Note that the response 'Hello $name' cannot be selected, because it requies the entity $name to be defined, and $name is not in bot's memory.
    // 4.4	Enter 'david'.
    // 4.4.1	<Validation Step> Note that the name is highlighted as an entity. This is because of the heuristic we set up above to select the response as the entity.
    // 4.5	Click Score Actions
    // 4.5.1	<Validation Step> Note name value is now in the bot's memory.
    // 4.6	'Hello $name' is now available as a response.
    // 4.7	Select 'Hello $name'.
    // 4.8	Click Done Teaching.
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
    homePage.Visit()
    homePage.NavigateToModelPage(modelName)

    // 4.1	Click Train Dialogs..., then New Train Dialog.
    modelPage.NavigateToTrainDialogs()
    
    trainDialogPage.VerifyPageTitle()

    // 4.1	...then New Train Dialog.
    trainDialogPage.CreateNewTrainDialog()

    // 4.2	Type 'hello'.
    editDialogModal.TypeYourMessage("Hello")
    
    // 4.3	Click Score Actions...
    editDialogModal.ClickScoreActionsButton()

    // 4.3.1	<Validation Step> Note that the response 'Hello $name' 
    // cannot be selected, because it requies the entity $name to be defined, 
    // and $name is not in bot's memory.
    scorerModal.VerifyContainsDisabledAction("Hello $name")

    // 4.3	...and Select 'What's your name?'
    scorerModal.ClickAction("What's your name?")

    // 4.4	Enter 'david'.
    editDialogModal.TypeYourMessage("David")

    // 4.4.1	<Validation Step> Note that the name is highlighted as an entity. 
    editDialogModal.VerifyDetectedEntity("name", "David")
    
    // 4.5	Click Score Actions
    editDialogModal.ClickScoreActionsButton()

    // 4.5.1	<Validation Step> Note name value is now in the bot's memory.
    memoryTableComponent.VerifyEntityInMemory("name", "David")

    // 4.6	'Hello $name' is now available as a response.
    // 4.7	Select 'Hello $name'.
    scorerModal.ClickAction("Hello $name")

    // 4.8	Click Done Teaching.
    editDialogModal.ClickSaveButton()
    
    // --------------- New Training Begins ---------------
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
