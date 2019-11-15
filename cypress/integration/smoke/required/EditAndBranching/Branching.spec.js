/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../../support/Models'
import * as modelPage from '../../../../support/components/ModelPage'
import * as chatPanel from '../../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../../support/components/TrainDialogsGrid'
import * as train from '../../../../support/Train'
import * as helpers from '../../../../support/Helpers'

describe('Branching - Edit and Branching', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  let originalChatMessages
  let editedChatMessages

  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-branching', 'z-learnedEntLabel.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Branch and Extend Training', () => {
    it('Should edit a specific Train Dialog and capture the original chat messages for verification later', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('My name is David.', 'My name is Susan.', 'Hello $name')
      cy.WaitForStableDOM().then(() => { originalChatMessages = chatPanel.GetAllChatMessages() })
    })

    it('Should branch a turn', () => {
      chatPanel.BranchChatTurn('My name is Susan.', 'My name is Joseph.')
      train.ClickScoreActionsButton()
      chatPanel.VerifyTextChatMessage('Hello Joseph')
    })

    it('Should add another user input and Bot response', () => {
      train.TypeYourMessage('My name is Guadalupe.')
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hello Guadalupe')
    })

    it('Should capture the changes for verification later', () => {
      cy.WaitForStableDOM().then(() => { editedChatMessages = chatPanel.GetAllChatMessages() })
    })

    it('Should save the changes and confirm they show up in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })

  context('Validations', () => {
    it('Should edit the original Train Dialog and verify it was not changed.', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('My name is David.', 'My name is Susan.', 'Hello $name')
      chatPanel.VerifyAllChatMessages(originalChatMessages)
      train.ClickSaveCloseButton()
    })

    it('Should edit the branched Train Dialog and verify it was persisted correctly.', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('My name is David.', 'My name is Guadalupe.', 'Hello $name')
      chatPanel.VerifyAllChatMessages(editedChatMessages)
      train.ClickSaveCloseButton()
    })
  })
})