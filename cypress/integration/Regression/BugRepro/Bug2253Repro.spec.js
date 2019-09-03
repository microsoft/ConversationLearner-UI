/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe("Bug 2253 Repro", () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs and wait for Training Status to Complete', () => {
      models.ImportModel('z-bug2253Repro', 'z-bug2253Repro.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Attempt to reproduce Bug 2253', () => {
    it('Should edit a Train Dialog and add a round of turns', () => {
      train.EditTraining('My foot is dirty.', 'My foot is dirty.', 'Your foot is $conditionOfFoot.')
      train.TypeYourMessage('Is that all you have to say about it?')
      train.ClickScoreActionsButton()
      train.SelectTextAction("I don't know what to say.")
    })

    it('Alter the Entity Label', () => {
      train.SelectChatTurnExactMatch('My foot is dirty.')
      train.RemoveEntityLabel('dirty', 'conditionOfFoot')
      train.ClickSubmitChangesButton()
    })

    // Bug 2253: Inconsistent Entity Label warning popup comes up when it should not
    // Once this bug is fixed comment out this block of code and uncomment the next block
    it('Verify that Bug 2253 reproduced', () => {
      train.VerifyEntityLabelConflictPopup()
    })
    
    // it('Verify that Bug 2253 did not reproduce', () => {
    //   train.VerifyNoEntityLabelConflictPopup()
    // })
  })
})