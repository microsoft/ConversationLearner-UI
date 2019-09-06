/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as entityModal from '../../../support/components/EntityModal'
import * as entities from '../../../support/Entities'
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
      train.EditTraining('Hi', 'Mangoes and Peaches', 'Goodbye')
    })
                
    it('Delete a User turn', () => {
      train.SelectChatTurnExactMatch('Apples and Bananas')
      train.ClickDeleteChatTurn()
    })
    
    // Bug 2267: Delete user turn should autoselect the next turn rather than the next user turn
    // When this block of code breaks, it is likely because this bug has been fixed. Comment it out.
    it('Verify that Bug 2267 reproduces', () => {
      train.VerifySelectedChatTurn('Mangoes and Peaches')
      train.SelectChatTurnExactMatch('Set Entity:memory.Set(fruit, APPLES)')
    })

    // Bug 2267: Delete user turn should autoselect the next turn rather than the next user turn
    // Confirm that this bug no longer reproduces.
    it('Verify the next turn, a Bot turn, was selected', () => {
      train.VerifySelectedChatTurn('Set Entity:memory.Set(fruit, APPLES)')
    })

    it('', () => {
    })

    it('', () => {
    })

    it('', () => {
    })

    it('', () => {
    })

    it('', () => {
    })

  })
})