/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as homePage from '../../../support/components/HomePage'
import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entitiesGrid from '../../../support/components/EntitiesGrid'
import * as actionsGrid from '../../../support/components/ActionsGrid'
import * as train from '../../../support/Train'
import * as settings from '../../../support/components/Settings'
import * as helpers from '../../../support/Helpers'

describe("Settings - Settings", () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  let entityGridRows
  let actionGridRows
  let trainDialogs
  let copyModelName

  context('Setup', () => {
    it('Should import a model to test against, navigate to Log Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-settingsTests', 'z-settingsTests.cl')
    })

    it('Capture Train Dialog Grid data', () => {
      modelPage.NavigateToTrainDialogs()
      cy.WaitForStableDOM().then(() => { trainDialogs = train.GetAllTrainDialogGridRows() })
    })

    it('Capture Train Dialog Description, Tags and Chat data for each Train Dialog', () => {
      trainDialogs.descriptions = []
      trainDialogs.tags = []
      trainDialogs.chatMessages = []

      trainDialogs.forEach(trainDialog => {
        train.EditTraining(trainDialog.firstInput, trainDialog.lastInput, trainDialog.lastResponse)
        cy.WaitForStableDOM().then(() => {
          trainDialog.description = train.GetDescription()
          trainDialog.tags = train.GetAllTags()
          trainDialog.chatMessages = train.GetAllChatMessages()
  
          train.ClickSaveCloseButton()
        })
      })
    })

    it('Should grab a copy of the Entity Grid data', () => {
      modelPage.NavigateToEntities()
      cy.WaitForStableDOM().then(() => { entityGridRows = entitiesGrid.GetAllRows() })
    })

    it('Should grab a copy of the Action Grid data', () => {
      modelPage.NavigateToActions()
      cy.WaitForStableDOM().then(() => { actionGridRows = actionsGrid.GetAllRows() })
    })
  })

  context('Settings - Copy Model', () => {
    it('Copy the model', () => {
      modelPage.NavigateToSettings()
      cy.WaitForStableDOM().then(() => { copyModelName = settings.CopyModel('z-stCopy') })
    })

    it('Verify the copied model name is now on the page', () => {
      modelPage.VerifyModelName(copyModelName)
    })

    it('Return to the model name list on the home page and verify that the copied model is in the list', () => {
      modelPage.NavigateToMyModels()
      homePage.VerifyModelNameInList(copyModelName)
      cy.reload(true) // Force reload of the page without using the cache
      homePage.LoadModel(copyModelName)
    })

    it('Verifiy Entities', () => {
      modelPage.NavigateToEntities()
      entitiesGrid.VerifyAllEntityRows(entityGridRows)
    })

    it('Verifiy Actions', () => {
      modelPage.NavigateToActions()
      actionsGrid.VerifyAllActionRows(actionGridRows)
    })

    it('Verify all Train Dialogs data', () => {
      modelPage.NavigateToTrainDialogs()
      train.VerifyListOfTrainDialogs(trainDialogs)

      trainDialogs.forEach(trainDialog => {
        train.EditTraining(trainDialog.firstInput, trainDialog.lastInput, trainDialog.lastResponse)
        cy.WaitForStableDOM().then(() => {
          train.VerifyDescription(trainDialog.description)
          train.VerifyTags(trainDialog.tags)
          train.VerifyAllChatMessages(() => { return trainDialog.chatMessages }) // TODO: Fix this method to work like the others
          train.ClickSaveCloseButton()
        })
      })
    })
  })
})