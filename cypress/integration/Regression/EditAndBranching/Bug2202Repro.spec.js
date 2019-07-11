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

  context('Reproduce Bug 2202', () => {
    it('Should grab a copy of the Entity Grid data', () => {
      train.EditTraining('Use all Actions and Entities', "I'm feeling lucky!", 'name:$name sweets:$sweets want:$want')
      train.InsertUserInputAfter('I like to win!', 'Insert this User Turn')
    })

    // Bug 2202: FETCH_TRAINDIALOGREPLAY_ASYNC Failed: nasty error came up
    // When this bug is fixed, this block of code will fail.
    // It can then be commented out AND the block of code below should then be uncommented and possibly altered so it works.
    it('Verify that Bug 2202 reproduces', () => {
      cy.Get('div.cl-errorpanel').contains('Request failed with status code 500')
      cy.Get('div.cl-errorpanel').contains('Inline node representing entity')
    })
    
    // it('Verify that Bug 2202 does not reproduce', () => {
    //   cy.DoesNotContain('div.cl-errorpanel > div')
    //   train.SaveAsIsVerifyInGrid()
    // })
  })
})