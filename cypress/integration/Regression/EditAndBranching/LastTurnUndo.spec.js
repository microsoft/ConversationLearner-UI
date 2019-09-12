/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Last Turn and Undo - Edit and Branching', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let chatMessages

  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-lastTurnUndo', 'z-expectedEntLabl.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Last Turn and Undo', () => {
    it('Edit user turn, which ends with a Bot turn, then verify expected UI Elements', () => {
      train.EditTraining('Hello', 'David', 'Hello $name')
      train.VerifyScoreActionsButtonIsMissing()
      train.VerifyTypeYourMessageIsPresent()
      train.VerifyTurnUndoButtonIsMissing()
    })
    
    it('Preserve all chat messages for later verification', () => {
      cy.WaitForStableDOM().then(() => { chatMessages = train.GetAllChatMessages() })
    })

    it('Type in a message, verify that Undo button is present and user cannot select another chat turn', () => {
      train.TypeYourMessage('A message to be undone!')
      train.VerifyTurnUndoButtonIsPresent()
      train.VerifyChatPanelIsDisabled()
    })

    it('Undo the last message, verify turn was discarded and Undo button is gone.', () => {
      train.ClickTurnUndoButton()
      train.VerifyChatPanelIsEnabled()
      train.VerifyAllChatMessages(chatMessages)
      train.VerifyTurnUndoButtonIsMissing()
    })

    it('Type in another message, verify that Undo button is present and user cannot select another chat turn', () => {
      train.TypeYourMessage('A message to persist')
      train.VerifyTurnUndoButtonIsPresent()
      train.VerifyChatPanelIsDisabled()
    })

    it('Click Score Actions, verify that Undo botton goes away', () => {
      train.ClickScoreActionsButton()
      train.VerifyTurnUndoButtonIsMissing()
    })

    it('Save the training so that it ends with a User turn', () => {
      train.SaveAsIs()
    })

    it('Edit the train dialog and confirm that "Score Acctions" is present and "Type your message" is missing', () => {
      train.EditTraining('Hello', 'A message to persist', '')
      train.VerifyScoreActionsButtonIsPresent()
      train.VerifyTypeYourMessageIsMissing()
    })
  })
})