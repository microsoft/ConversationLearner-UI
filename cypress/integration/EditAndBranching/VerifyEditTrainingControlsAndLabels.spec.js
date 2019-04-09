/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../support/Models'
import * as modelPage from '../../support/components/ModelPage'
import * as scorerModal from '../../support/components/ScorerModal'
import * as train from '../../support/Train'

describe('EditAndBranching', () => {
  it('Verify Edit Training Controls And Labels', () => {
    models.ImportModel('z-editContols', 'z-nameTrained.cl')
    modelPage.NavigateToTrainDialogs()

    train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
    train.CaptureOriginalChatMessages()

    train.VerifyCloseButtonLabel()
    train.VerifyDeleteButtonLabel()

    train.VerifyThereAreNoChatEditControls('My name is David.', 'Hello Susan')
    train.SelectAndVerifyEachChatTurn()

    train.BranchChatTurn('My name is Susan.', 'I am Groot')
    train.VerifySaveBranchButtonLabel()
    train.VerifyAbandonBranchButtonLabel()

    train.VerifyThereAreNoChatEditControls('I am Groot', 'Hello David')
    train.AbandonBranchChanges()

    train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
    train.VerifyOriginalChatMessages()
  })
})