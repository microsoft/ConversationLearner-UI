/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as actionsGrid from '../../../support/components/ActionsGrid'
import * as actionModal from '../../../support/components/ActionModal'
import * as helpers from '../../../support/Helpers'

describe('Bug 2379 Repro', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model to test against and navigate to Actions view', () => {
      models.ImportModel('z-bug2379Repro', 'z-bug2379Repro.cl')
      modelPage.NavigateToActions()
    })
  })

  TestRemoval('Expected Entity', () => { actionModal.RemoveExpectedEntity('anEntity') })

  TestRemoval('Required Conditions', () => { actionModal.RemoveRequiredCondition('anEntity == 1') })

  TestRemoval('Expected Entity', () => { actionModal.RemoveDisqualifyingCondition('anEntity') })
})


function TestRemoval(title, removeFunction) {
  context(`Remove ${title} to reproduce Bug 2379`, () => {
    it('Edit an Action that has Reprompt selected', () => {
      actionsGrid.EditTextAction('Reprompting you to enter something good')
    })

    it(`Remove ${title}`, () => {
      removeFunction() 
    })

    it('Save the changed Action', () => {
      actionModal.ClickCreateSaveButton()
    })

    // Bug 2379: Editing Action Failed - Using "Reprompt" option in Action and changing a condition fails to save 
    // Once this bug is fixed comment out this block of code and uncomment the next block
    it('Verify that the Bug reproduced', () => {
      helpers.VerifyErrorMessageContains('Request failed with status code 400')
      helpers.VerifyErrorMessageContains("Action refers to a RepromptActionId that doesn't exist in the source.")
      helpers.CloseErrorMessagePanel()
    })
    
    // Bug 2379: Editing Action Failed - Using "Reprompt" option in Action and changing a condition fails to save 
    // This code should work once this bug is fixed...
    // Uncomment this and comment out the above to detect a regression.
    // it('Verify that the Bug did not reproduce', () => {
    //   helpers.VerifyNoErrorMessages()
    // })
  })
}
