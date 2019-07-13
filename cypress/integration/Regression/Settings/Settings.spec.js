/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entitiesGrid from '../../../support/components/EntitiesGrid'
import * as actionsGrid from '../../../support/components/ActionsGrid'
import * as train from '../../../support/Train'

import * as logDialogsGrid from '../../../support/components/LogDialogsGrid'
import * as logDialogModal from '../../../support/components/LogDialogModal'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe("Settings - Settings", () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  let logDialogGridContent = []
  let logDialogIndex = 0

  let entityGridRows
  let actionGridRows
  let trainDialogGridRows
  let trainDialogChatMessages
  let trainDialogDescriptions
  let trainDialogTags
  
  context('Setup', () => {
    it('Should import a model to test against, navigate to Log Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-settingsTests', 'z-settingsTests.cl')
    })

    it('Should grab a copy of the Description and All Tags', () => {
      modelPage.NavigateToTrainDialogs()
      train.EditTraining('Use all Actions and Entities', "I'm feeling lucky!", 'name:$name sweets:$sweets want:$want')
      cy.WaitForStableDOM().then(() => {
        trainDialogDescriptions = train.GetDescription()
        trainDialogTags = train.GetAllTags() 

        train.VerifyDescription(trainDialogDescriptions)
        train.VerifyTags(trainDialogTags)
        train.ClickSaveCloseButton()
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

    it('Should grab a copy of the Train Dialog Grid data', () => {
      modelPage.NavigateToTrainDialogs()
      cy.WaitForStableDOM().then(() => { trainDialogGridRows = train.GetAllTrainDialogGridRows() })
    })

    it('Should grab a copy of the Train Dialog Chat data', () => {
      modelPage.NavigateToTrainDialogs()
      train.EditTraining('Use all Actions and Entities', "I'm feeling lucky!", 'name:$name sweets:$sweets want:$want')
      cy.WaitForStableDOM().then(() => {
        trainDialogChatMessages = train.GetAllChatMessages()
        train.ClickSaveCloseButton()
      })
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
      train.VerifyListOfTrainDialogs(trainDialogGridRows)
    })

    it('Should verifiy Train Dialog Chat Messages', () => {
      train.EditTraining('Use all Actions and Entities', "I'm feeling lucky!", 'name:$name sweets:$sweets want:$want')
      train.VerifyAllChatMessages(() => { return trainDialogChatMessages })
      train.ClickSaveCloseButton()
    })
  })
})