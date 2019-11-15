/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('Delete Chat Turns - Edit and Branching', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  context('Setup', () => {
    it('Should import a model to test against and navigate to Train Dialogs view', () => {
      models.ImportModel('z-deleteChatTurns', 'z-comprehensive4.cl')
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Delete Chat Turns', () => {
    it('Edit existing Train Dialog', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('Hi', 'Mangoes and Peaches', 'Goodbye')
    })
                
    it('Delete a User turn', () => {
      chatPanel.SelectChatTurnExactMatch('Apples and Bananas')
      train.ClickDeleteChatTurn()
    })
    
    // Bug 2267: Delete user turn should autoselect the next turn rather than the next user turn
    // When this block of code breaks, it is likely because this bug has been fixed. Comment it out.
    it('Verify that Bug 2267 reproduces', () => {
      chatPanel.VerifySelectedChatTurn('Mangoes and Peaches')
      chatPanel.SelectChatTurnExactMatch('Set Entity:memory.Set(fruit, APPLES)')
    })

    // Bug 2267: Delete user turn should autoselect the next turn rather than the next user turn
    // Confirm that this bug no longer reproduces.
    it('Verify the next turn, a Bot turn, was selected', () => {
      chatPanel.VerifySelectedChatTurn('Set Entity:memory.Set(fruit, APPLES)')
    })

    it('Delete a Bot turn', () => {
      train.ClickDeleteChatTurn()
    })

    it('Verify the next turn, which is also a Bot turn, was selected', () => {
      chatPanel.VerifySelectedChatTurn('Set Entity:memory.Set(fruit, BANANAS)')
    })

    it('Delete two more Bot turns, verify the selector ends up at the following User turn', () => {
      train.ClickDeleteChatTurn()
      chatPanel.VerifySelectedChatTurn('Uhhhh…')
      train.ClickDeleteChatTurn()
      chatPanel.VerifySelectedChatTurn('Mangoes and Peaches')
    })

    it('Delete the last Bot turn, verify expected UI Elements', () => {
      chatPanel.SelectChatTurnExactMatch('EndSession: Goodbye')
      train.ClickDeleteChatTurn()
      chatPanel.VerifyNoChatTurnSelected()
      train.VerifyScoreActionsButtonIsPresent()
      train.VerifyTypeYourMessageIsMissing()
    })

    it('Delete the last Bot turn again, verify expected UI Elements', () => {
      chatPanel.SelectChatTurnExactMatch('Set Entity:memory.Set(fruit, PEACHES)')
      train.ClickDeleteChatTurn()
      chatPanel.VerifyNoChatTurnSelected()
      train.VerifyScoreActionsButtonIsPresent()
      train.VerifyTypeYourMessageIsMissing()
    })

    it('Delete the last Bot turn yet again, verify expected UI Elements', () => {
      chatPanel.SelectChatTurnExactMatch('Set Entity:memory.Set(fruit, MANGOES)')
      train.ClickDeleteChatTurn()
      chatPanel.VerifyNoChatTurnSelected()
      train.VerifyScoreActionsButtonIsPresent()
      train.VerifyTypeYourMessageIsMissing()
    })

    it('Delete the last User turn, verify expected UI Elements', () => {
      chatPanel.SelectChatTurnExactMatch('Mangoes and Peaches')
      train.ClickDeleteChatTurn()
      chatPanel.VerifyNoChatTurnSelected()
      train.VerifyScoreActionsButtonIsMissing()
      train.VerifyTypeYourMessageIsPresent()
    })
  })
})