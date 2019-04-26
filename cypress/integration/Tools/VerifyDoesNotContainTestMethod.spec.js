/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as train from '../../support/Train'

// This is a test case to test one of our test methods, cy.DoesNotContain.
// The problem with that method is that if it has a bug and does not find
// the element we were expecting to not be on the page it passes, so this
// will verify that our method is working as we expect.
describe('Verify the "DoesNotContain" test function - Tools', () => {
  it('test', () => {
    models.ImportModel('z-editContols', 'z-learnedEntLabel.cl')
    modelPage.NavigateToTrainDialogs()

    train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
    train.CaptureOriginalChatMessages()

    train.SelectChatTurn('My name is Susan.')
    train.VerifyCyDoesNotContainMethodWorksWithSpecialChatSelector()

    train.ClickSaveCloseButton()
  })
})
