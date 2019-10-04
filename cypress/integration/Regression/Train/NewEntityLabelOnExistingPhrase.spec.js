/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as memoryTableComponent from '../../../support/components/MemoryTableComponent'
import * as scorerModal from '../../../support/components/ScorerModal'
import * as train from '../../../support/Train'
import * as common from '../../../support/Common'
import * as helpers from '../../../support/Helpers'

describe('New Entity Label on Existing Phrase - Train Dialog', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Should import a model and wait for training to complete', () => {
      models.ImportModel('z-newEntityLabel', 'z-newEntityLabel.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Train Dialog', () => {
    it('Should create a new Train Dialog', () => {
      train.CreateNewTrainDialog()
      train.TypeDescription('Test Generated')
    })

    it('User utters an existing phrase and labels an entity', () => {
      train.TypeYourMessage('Phrase used only once.')
      train.LabelTextAsEntity('once', 'anEntity') // always an entity...LOL
    })

    it('Score Actions, verify that the Entitly Label Conflict modal pops up and that we can close it without change to our labeling', () => {
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndClose(undefined, [{ text: 'once', entity: 'anEntity' }])
      train.VerifyEntityLabel('once', 'anEntity')
    })

    it('Score Actions, verify that the Entitly Label Conflict modal pops up and that we can change our labeling', () => {
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndChangeToPevious(undefined, [{ text: 'once', entity: 'anEntity' }])
    })

    // Verify that we can change it back
    // Verify that we can change alternative test in a different way and screw things up
    
    it('Verify that the label was removed and then relable it', () => {
      train.SelectTextAction('The only response')
      train.SelectChatTurnExactMatch('Phrase used only once.')
      train.VerifyWordNotLabeledAsEntity('once', 'anEntity')
      train.LabelTextAsEntity('once', 'anEntity')
    })

    it('Score Actions, verify that the Entitly Label Conflict modal pops up and that we can change our labeling', () => {
      train.ClickSubmitChangesButton()
      train.VerifyEntityLabelConflictPopupAndChangeToAttempted(undefined, [{ text: 'once', entity: 'anEntity' }])
    })

    it('Save the Train Dialog and verify that it is in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })

    it('Edit the training affected by conflict resolution and verify there is a warning', () => {
      modelPage.VerifyWarningTriangleForTrainDialogs()
      train.EditTraining('Phrase used only once.', 'We use this phrase three times.', 'The only response')
      train.VerifyWarningMessage('Entity or Action changes require replay of the TrainDialog')
    })

    it('Verify that the affected turn is now Entity labeled', () => {
      train.SelectChatTurnExactMatch('Phrase used only once.')
      train.VerifyEntityLabel('once', 'anEntity')
    })

    it('Click Replay button and verify it clears the warning for this Train Dialog', () => {
      train.ClickReplayButton()
      train.VerifyNoWarningMessage()
    })

    it('Save the changes', () => {
      train.SaveAsIs()
    })
  })
})