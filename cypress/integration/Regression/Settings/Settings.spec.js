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
  
  context('Setup', () => {
    it('Should import a model to test against, navigate to Log Dialogs view and wait for training status to complete', () => {
      models.ImportModel('z-settingsTests', 'z-settingsTests.cl')
    })

    it('Should grab a copy of the Train Dialog Grid data', () => {
      modelPage.NavigateToTrainDialogs()
      cy.WaitForStableDOM().then(() => {
        trainDialogGridRows = train.GetAllTrainDialogGridRows()
        train.VerifyListOfTrainDialogs(trainDialogGridRows)
      })
    })

    
    it('Should grab a copy of the Train Dialog Chat data', () => {
      modelPage.NavigateToTrainDialogs()
      train.EditTraining('Use all Actions and Entities', "I'm feeling lucky!", 'name:$name sweets:$sweets want:$want')
      cy.WaitForStableDOM().then(() => {
        trainDialogChatMessages = train.GetAllChatMessages()
        train.VerifyAllChatMessages(() => { return trainDialogChatMessages })
        train.ClickSaveCloseButton()
      })
    })

    
    it('Should grab a copy of the Entity Grid data', () => {
      modelPage.NavigateToEntities()
      cy.WaitForStableDOM()
      cy.Enqueue(() => { return entitiesGrid.GetAllRows() }).then(allEntityGridRows => {
        entityGridRows = allEntityGridRows
        entitiesGrid.VerifyAllEntityRows(entityGridRows)
      })
    })

    it('Should grab a copy of the Action Grid data', () => {
      modelPage.NavigateToActions()
      cy.WaitForStableDOM().then(() => {
        actionGridRows = actionsGrid.GetAllRows()
      })
      //cy.Enqueue(() => { return actionsGrid.GetAllRows() }).then(allActionGridRows => actionGridRows = allActionGridRows)
      
    })
  })

  context('Setup', () => {
    it('verifications to be placed later', () => {
      actionsGrid.VerifyAllActionRows(actionGridRows)
    })
  })
})