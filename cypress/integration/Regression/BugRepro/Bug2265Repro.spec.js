/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entityDetectionPanel from '../../../support/components/EntityDetectionPanel'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Bug 2265 Repro', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-bug2265', 'z-bug2265Repro.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Attempt to reproduce Bug 2265', () => {
    it('New Train Dialog', () => {
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
    })

    it('Add 1st set of turns', () => {
      train.TypeYourMessage('The user asks a silly question')
      train.ClickScoreActionsButton()
      train.SelectTextAction('Bot responds with a silly answer')
    })

    it('Add 2nd set of turns', () => {
      train.TypeYourMessage('The user asks another question')
      train.ClickScoreActionsButton()
      train.SelectTextAction('The Bot responds once again')
    })

    // If we save and re-edit the training, the bug does not reproduce. 
    // Uncomment the following code for proof.
    // it('Save training and re-edit it', () => {
    //   train.SaveAsIs()
    //   trainDialogsGrid.TdGrid.EditTrainingByChatInputs('The user asks a silly question', 'The user asks another question', 'The Bot responds once again')
    // })

    it('Select a Bot Turn, + Action + Entity - Create an Enum Entity', () => {
      chatPanel.SelectChatTurnExactMatch('The user asks a silly question')
      entityDetectionPanel.LabelTextAsEntity('user', 'one')
      train.ClickSubmitChangesButton()
    })

    // Bug 2265: Editing 1st user turn to label entities saves changes to 2nd user turn
    // Once this bug is fixed comment out this block of code and uncomment the next block
    it('Verify that Bug 2265 reproduced', () => {
      chatPanel.VerifyChatTurnIsAnExactMatch('The user asks a silly question', 4, 2)
    })
    
    // This code should work once bug 2265 is fixed...
    // Uncomment this and comment out the above to detect a regression.
    // it('Verify that Bug 2259 did not reproduce', () => {
    //   chatPanel.VerifyChatTurnIsAnExactMatch('The user asks another question', 4, 2)
    // })
  })
})
