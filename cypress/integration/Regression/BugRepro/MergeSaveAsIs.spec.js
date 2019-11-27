/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as chatPanel from '../../../support/components/ChatPanel'
import * as trainDialogsGrid from '../../../support/components/TrainDialogsGrid'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

// This test suite reproduces multiple bugs related to the "Merge?" popup feature.
describe('Merge Save as is Bugs Repros', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
  
  let trainDialogs

  context('Setup', () => {
    it('Should import a model to test against, navigate to Train Dialogs view, and wait for Training Status to complete', () => {
      models.ImportModel('z-MrgSaveAsIsBugs', 'z-EndSession.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
    
    // Bug 2383: Fails to Save from Merge-Save As Is when End Session is involved
    // Once this bug is fixed comment out this block of code and search for other 
    // references of this bug that also need to be modified.
    it('Capture Train Dialog Grid data', () => {
      cy.Enqueue(() => { return trainDialogsGrid.TdGrid.GetAllRows() }).then(returnValue => trainDialogs = returnValue)
    })
  })

  context('Attempt to reproduce Bugs 2027 and 2353', () => {
    it('Edit a Train Dialog', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('Yo', 'Bye', 'Goodbye')
    })

    it('Branch at the last turn', () => {
      chatPanel.BranchChatTurn('Bye', 'Bye bye')
    })
    
    // Bug 2027: Auto Scored Action Selection should select highest scoring action that model has been trained for
    // Remove this comment and the following line when this bug is fixed...uncomment the next block.
    it('Should verify Bug 2027 reproduces.', () => {
      train.ClickScoreActionsButton()
      chatPanel.VerifyChatTurnIsAnExactMatch('Okay', 4, 3)
      chatPanel.SelectLastChatTurn()
      train.SelectEndSessionAction('Goodbye')
    })

    // Bug 2027: Auto Scored Action Selection should select highest scoring action that model has been trained for
    // Uncomment this block of code once this bug has been fixed.
    // it('Should verify the automaticly selected Bot response is according to the training.', () => {
    //   chatPanel.ClickScoreActionsButton()
    //   chatPanel.VerifyChatTurnIsAnExactMatch('Goodbye', 4, 3)
    // })

    // Bug 2353: "Merge?" popup does not appear during branching when it should
    it('Save the Train Dialog to verify that Bug 2353 reproduced', () => {
      train.SaveVerifyNoMergePopup()
      trainDialogs.push({  
        firstInput: 'Yo',
        lastInput: 'Bye bye',
        lastResponse: 'Goodbye',
        description: '',
        tagList: '',
      })
      trainDialogsGrid.VerifyListOfTrainDialogs(trainDialogs)
    })
  })

  context('Attempt to reproduce Bug 2352', () => {
    it('Edit a Train Dialog', () => {
      trainDialogsGrid.TdGrid.EditTrainingByChatInputs('Yo', 'Bye', 'Goodbye')
    })

    it('Branch at the last turn', () => {
      chatPanel.BranchChatTurn('Bye', 'Goodbye')
    })

    // Bug 2352: Saving a branched TD that results in "Merge?" popup fails to save the branched TD
    // Once this bug is fixed comment out this block of code and uncomment the next block
    it('Verify that Bug 2383 reproduced', () => {
      train.SaveAsIs()      
      trainDialogsGrid.VerifyListOfTrainDialogs(trainDialogs)
    })
    
    // Bug 2352: Saving a branched TD that results in "Merge?" popup fails to save the branched TD
    // This code should work once this bug is fixed...
    // Uncomment this and comment out the above to detect a regression.
    // it('Save Train Dialog and Verify it is in the Grid', () => {
    //   train.SaveAsIsVerifyInGrid()
    // })
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
    it('Verify that Bug 2383 reproduced', () => {
      train.SaveAsIs()      
      trainDialogsGrid.VerifyListOfTrainDialogs(trainDialogs)
    })
    
    // Bug 2383: Fails to Save from Merge-Save As Is when End Session is involved
    // This code should work once this bug is fixed...
    // Uncomment this and comment out the above to detect a regression.
    // it('Save Train Dialog and Verify it is in the Grid', () => {
    //   train.SaveAsIsVerifyInGrid()
    // })
  })
})

