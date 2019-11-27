/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as actions from '../../../support/Actions'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

// This test case was intended to reproduce bug 2319 but the problem is the bug is not 100%
// anymore. When it fails you will see the following string in the chat panel:
//  ERROR: Score Actions: No Action can be chosen based on current constraints. All Actions are disqualified.
describe('Bug 2319 Repro', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Create a new model with one action to test against and navigate to Train Dialog view', () => {
      models.CreateNewModel('z-bug2319Repro')
      actions.CreateNewActionThenVerifyInGrid({responseNameData: "X"})
      modelPage.NavigateToTrainDialogs()
    })
  })

  context('Attempt to reproduce Bug 2319', () => {
    it('New Train Dialog', () => {
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
    })

    it('Add a user turn and Bot response', () => {
      train.TypeYourMessage('a')
      cy.wait(1400)
      train.ClickScoreActionsButton()
      cy.wait(1400)
      train.SelectTextAction("X")
      cy.wait(1400)
    })

    it('Add another user turn undo it, then add a different user turn', () => {
      train.TypeYourMessage('b')
      cy.wait(1400)
      train.ClickTurnUndoButton()
      cy.wait(1400)
      train.TypeYourMessage('c')
      cy.wait(1400)
    })

    // Bug 2319: Undo causes Score Actions to happen at the wrong time and errors out
    // Once this bug is fixed comment out this block of code and uncomment the next block
    // it('Verify that Bug 2319 reproduced', () => {
    //   chatPanel.VerifyChatTurnIsAnExactMatch('ERROR: Score Actions: No Action can be chosen based on current constraints. All Actions are disqualified.', 4, 3)
    // })
    
    // Bug 2319: Undo causes Score Actions to happen at the wrong time and errors out
    // This code should work once this bug is fixed...
    // Uncomment this and comment out the above to detect a regression.
    it('Verify that Bug 2319 did not reproduce', () => {
      train.ClickScoreActionsButton()
      cy.wait(1400)
      train.SelectTextAction("X")
      cy.wait(1400)
      chatPanel.VerifyChatTurnIsAnExactMatch('X', 4, 3)
    })
  })
})

