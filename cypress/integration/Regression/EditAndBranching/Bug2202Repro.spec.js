/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe("Bug 2202 Repro - EditAndBranching", () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs and wait for Training Status to Complete', () => {
      models.ImportModel('z-bug2202Repro', 'z-bug2202Repro.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Attempt to reproduce Bug 2202', () => {
    it('Should edit a Train Dialog and insert a user turn', () => {
      train.EditTraining('Use all Actions and Entities', "I'm feeling lucky!", 'name:$name sweets:$sweets want:$want')
      train.InsertUserInputAfter('I like to win!', 'Insert this User Turn')
    })

    // Bug 2202: FETCH_TRAINDIALOGREPLAY_ASYNC Failed: nasty error came up
    // This commented out block of code used to verify the bug was happening.
    // Now that the bug is fixed, we've left it here in case it regresses.
    // it('Verify that Bug 2202 reproduces', () => {
    //   helpers.VerifyErrorMessageContains('Request failed with status code 500')
    //   helpers.VerifyErrorMessageContains('Inline node representing entity')
    // })
    
    it('Verify that Bug 2202 does not reproduce', () => {
      helpers.VerifyNoErrorMessages()
      train.ClickSaveCloseButton()
    })
  })
})