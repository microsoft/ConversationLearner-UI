/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as homePage from '../../../../support/components/HomePage'
import * as models from '../../../../support/Models'
import * as modelPage from '../../../../support/components/ModelPage'
import * as entitiesGrid from '../../../../support/components/EntitiesGrid'
import * as actionsGrid from '../../../../support/components/ActionsGrid'
import * as train from '../../../../support/Train'
import * as settings from '../../../../support/components/Settings'
import * as helpers from '../../../../support/Helpers'

describe("Settings - Settings", () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  let entityGridRows
  let actionGridRows
  let trainDialogs
  let copyModelName
  let renamedModelName

  context('Setup', () => {
    it('Should import a model to test against', () => {
      models.ImportModel('z-settingsTests', 'z-settingsTests.cl')
    })

    it('Capture Train Dialog Grid data', () => {
      modelPage.NavigateToTrainDialogs()
      cy.WaitForStableDOM().then(() => { trainDialogs = train.GetAllTrainDialogGridRows() })
    })

    it('Capture Train Dialog Description, Tags and Chat data for each Train Dialog', () => {
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

  context('Copy Model', () => {
    it('Copy the model', () => {
      modelPage.NavigateToSettings()
      cy.WaitForStableDOM().then(() => { copyModelName = settings.CopyModel('z-copy') })
    })

    it('Verify the copied model name is now on the page', () => {
      modelPage.VerifyModelName(copyModelName)
    })

    it('Return to the model name list on the home page and verify that the copied model is in the list', () => {
      modelPage.NavigateToMyModels()
      homePage.VerifyModelNameInList(copyModelName)
    })

    it('Reload the page, then use the model name link to navigate back to the model we just copied', () => {
      cy.reload(true) // Force reload of the page without using the cache
      homePage.LoadModel(copyModelName)
    })
    
    VerifyModelIsTrueCopy()
  })

  context('Rename', () => {
    it('Rename the model', () => {
      modelPage.NavigateToSettings()
      cy.WaitForStableDOM().then(() => { renamedModelName = settings.RenameModel('z-rename') })
    })

    it('Verify the renamed model name is now on the page', () => {
      modelPage.VerifyModelName(renamedModelName)
    })

    it('Return to the model name list on the home page and verify that the renamed model is in the list', () => {
      modelPage.NavigateToMyModels()
      homePage.VerifyModelNameInList(renamedModelName)
    })

    it('Reload the page, then use the model name link to navigate back to the model we just renamed', () => {
      cy.reload(true) // Force reload of the page without using the cache
      homePage.LoadModel(renamedModelName)
    })
  })

  context('Log Conversations', () => {
    it('Change "Log Conversations" setting', () => {
      modelPage.NavigateToSettings()
      settings.UncheckLogConversationsCheckbox()
      settings.ClickSaveButton()
    })

    it('Reload the page and verify the changed setting was saved', () => {
      cy.reload(true) // Force reload of the page without using the cache
      settings.VerifyLogConversationsCheckbox(false)
    })
  })

  context('Discard Changes', () => {
    it('Change name and "Log Conversations" setting', () => {
      settings.TypeNewModelNameForRename('z-toBeDiscarded')
      settings.CheckLogConversationsCheckbox()
    })

    it('Discard changes and verify', () => {
      settings.ClickDiscardButton()
      settings.VerifyModelName(renamedModelName)
      settings.VerifyLogConversationsCheckbox(false)
    })
  })

  // On the Electron Browser this code brings up the Windows Dialog window 
  // to select the download folder. Since we manually use this feature on
  // a regular bases, we can safely leave this code out.
  //
  // context('Export Model', () => {
  //   it('Export the model', () => {
  //     settings.ClickExportModelButton()
  //     exportModelModal.VerifyPageTitle()
  //     exportModelModal.ClickExportButton()

  //     // We are not verifying that the exported model can be imported and is a true copy
  //     // because we have not found a way to definitively know what folder path the file
  //     // was exported to. If we ever come up with a way to determine this path then we
  //     // should add that logic here.
  //   })
  // })

  context('Delete the Renamed Copy', () => {
    it('Delete this renamed copy of the model we started testing with', () => {
      settings.DeleteModel(renamedModelName)
    })

    it('Verify that sent us back to the home page and that the deleted model is no longer in the list', () => {
      homePage.VerifyPageTitle()
      homePage.VerifyModelNameIsNotInList(renamedModelName)
    })

    it('Reload the page, then verify that the deleted model is still not in the list', () => {
      cy.reload(true) // Force reload of the page without using the cache
      homePage.VerifyModelNameIsNotInList(renamedModelName)
    })
  })

  function VerifyModelIsTrueCopy() {
    context('Verify Model Is A True Copy', () => {
      it('Verify Entities', () => {
        modelPage.NavigateToEntities()
        entitiesGrid.VerifyAllEntityRows(entityGridRows)
      })

      it('Verify Actions', () => {
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
            train.VerifyAllChatMessages(trainDialog.chatMessages)
            train.ClickSaveCloseButton()
          })
        })
      })
    })
  }
})
