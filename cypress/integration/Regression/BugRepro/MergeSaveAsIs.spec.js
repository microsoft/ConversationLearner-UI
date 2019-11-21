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

describe('Merge Save as is Bugs Repros', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs view, and wait for Training Status to complete', () => {
      models.ImportModel('z-MrgSaveAsIsBugs', 'z-EndSession.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Attempt to reproduce Bug 2383', () => {
    it('New Train Dialog', () => {
      trainDialogsGrid.TdGrid.CreateNewTrainDialog()
    })

    it('Add turns to create a mergeable Train Dialog', () => {
      train.TypeYourMessage('Hello')
      train.ClickScoreActionsButton()
      train.SelectTextAction('Hello')

      train.TypeYourMessage("It's a great day!")
      train.ClickScoreActionsButton()
      train.SelectTextAction('Okay')

      train.TypeYourMessage('Bye')
      train.ClickScoreActionsButton()
      train.SelectEndSessionAction('Goodbye')
    })

    // Bug 2383: Fails to Save from Merge-Save As Is when End Session is involved
    // Once this bug is fixed comment out this block of code and uncomment the next block
    // it('Verify that Bug 2319 reproduced', () => {
    //   chatPanel.VerifyChatTurnIsAnExactMatch('ERROR: Score Actions: No Action can be chosen based on current constraints. All Actions are disqualified.', 4, 3)
    // })
    
    // Bug 2383: Fails to Save from Merge-Save As Is when End Session is involved
    // This code should work once this bug is fixed...
    // Uncomment this and comment out the above to detect a regression.
    it('Save Train Dialog and Verify it is in the Grid', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })
})

