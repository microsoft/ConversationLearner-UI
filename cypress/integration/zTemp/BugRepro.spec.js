/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as helpers from '../../support/Helpers'
import * as homePage from '../../support/components/HomePage'
import * as modelPage from '../../support/components/ModelPage'
import * as models from '../../support/Models'
import * as train from '../../support/Train'
import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'
import * as editDialogModal from '../../support/components/EditDialogModal'
import { createYield } from 'typescript';

describe('Bug Reproduction', () => {
  it('1st Bug', () => {
    models.ImportModel('z-editContols', 'z-nameTrained.cl')
    modelPage.NavigateToTrainDialogs()

    train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
    train.BranchChatTurn('My name is Susan.', 'My name is Joseph.')
    editDialogModal.ClickScoreActionsButton()
    editDialogModal.ClickSaveCloseButton()
  })

  it('2nd Bug', () => {
    cy.WaitForTrainingStatusCompleted()
    train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
    train.BranchChatTurn('My name is Susan.', 'My name is Joseph.')
    editDialogModal.ClickScoreActionsButton()
    editDialogModal.ClickSaveCloseButton()
  })
})

