/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entitiesGrid from '../../../support/components/EntitiesGrid'
import * as actionsGrid from '../../../support/components/ActionsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe("Settings - Settings", () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  let entityGridRows
  let actionGridRows
  let trainDialogs
  
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

    // TODO: Although this appears to have worked, still need to scrutinize the log files and verify 
    //       this did everything we expected it to do.
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
    it('Verifiy Entities', () => {
      modelPage.NavigateToEntities()
      entitiesGrid.VerifyAllEntityRows(entityGridRows)
    })

    it('Verifiy Actions', () => {
      modelPage.NavigateToActions()
      actionsGrid.VerifyAllActionRows(actionGridRows)
    })

    it('Should verify the Train Dialog Grid data', () => {
      modelPage.NavigateToTrainDialogs()
      train.VerifyListOfTrainDialogs(trainDialogs)
    })

    it('Should verifiy Train Dialog Chat Messages', () => {
      train.EditTraining('Use all Actions and Entities', "I'm feeling lucky!", 'name:$name sweets:$sweets want:$want')
      train.VerifyAllChatMessages(() => { return trainDialogChatMessages })
      train.ClickSaveCloseButton()
    })
  })
})