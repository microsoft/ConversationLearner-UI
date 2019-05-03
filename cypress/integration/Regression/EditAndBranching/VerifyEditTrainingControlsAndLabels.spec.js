/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as helpers from '../../../support/Helpers'

describe('Verify Edit Training Controls And Labels - Edit And Branching', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  let originalTrainDialogCount = 0

  context('Setup', () => {
    it('Should import a model to test against and navigate to the Train Dialogs', () => {
      models.ImportModel('z-editContols', 'z-learnedEntLabel.cl')
      modelPage.NavigateToTrainDialogs()
    })

    it('Should capture the count of Train Dialogs in the grid', () => {
      cy.Enqueue( () => originalTrainDialogCount = trainDialogsGrid.GetTurns().length)
    })
  })

  context('Edit Train Dialog', () => {
    it('Should edit a Train Dialog and capture the chat messages to verifiy later', () => {
      train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
      train.CaptureOriginalChatMessages()
    })

    it('Should verify the labels for the Close and Delete buttons', () => {
      train.VerifyCloseButtonLabel()
      train.VerifyDeleteButtonLabel()
    })

    it('Should verify there are no edit controls visible in the chat pane', () => {
      train.VerifyThereAreNoChatEditControls('My name is David.', 'Hello Susan')
    })

    it('Should verify each chat turn contains only the expected buttons based on position in the chat and User or Bot turn', () => {
      train.SelectAndVerifyEachChatTurn()
    })

    it('Should branch the Train Dialog at a specific chat turn', () => {
      train.BranchChatTurn('My name is Susan.', 'I am Groot')
    })

    it('Should verify that labels changed on two of the buttons to "Save Branch" and "Abandon Branch"', () => {
      train.VerifySaveBranchButtonLabel()
      train.VerifyAbandonBranchButtonLabel()
    })

    it('Should verify there are no edit controls visible in the chat pane', () => {
      train.VerifyThereAreNoChatEditControls('I am Groot', 'Hello David')
    })

    it('Should abandon the branched training and verify the original training remains in its original state', () => {
      train.AbandonBranchChanges()
      train.EditTraining('My name is David.', 'My name is Susan.', 'Hello $name')
      train.VerifyOriginalChatMessages()
    })

    it('Should close the Train Dialog', () => {
      train.ClickSaveCloseButton()
    })

    it('Should verify the count of Train Dialogs in the grid are the same as when we started', () => {
      cy.WaitForStableDOM()
      cy.wrap(originalTrainDialogCount).should( originalTrainDialogCount => {
        const currentTrainDialogCount = trainDialogsGrid.GetTurns().length
        if (currentTrainDialogCount != originalTrainDialogCount) {
          throw new Error(`We are expecting there to be ${originalTrainDialogCount} Train Dialogs in the grid, instead we find ${currentTrainDialogCount}.`)
        }
      })
    })
  })
})