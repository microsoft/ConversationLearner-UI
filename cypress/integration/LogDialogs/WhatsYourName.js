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

    logDialogPage.CreateNewLogDialog()

    editDialogModal.TypeYourMessage("Hello")
    
    editDialogModal.ClickScoreActionsButton()

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
    scorerModal.ClickAction("Hello David")

    // 4.8	Click Done Teaching.
    editDialogModal.ClickSaveButton()
  })
})
