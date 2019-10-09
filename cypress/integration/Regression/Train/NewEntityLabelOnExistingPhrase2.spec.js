/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('New Entity Label on Existing Phrase 2 - Train Dialog', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Import a model and wait for training to complete', () => {
      models.ImportModel('z-newEntityLabel2', 'z-newEntityLabel1.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Two Instances of the Phrase', () => {
    //it('Edit the Training we created earlier', () => {
    it('Create a new Train Dialog and add a description for unique identification', () => {
      train.CreateNewTrainDialog()
      train.TypeDescription('Test Generated 2')
    })

    it('User utters another existing phrase and labels an entity', () => {
      train.TypeYourMessage('Two instances of this phrase there are.')
      train.LabelTextAsEntity('Two', 'anEntity') // many gifts are given...LOL
    })

    it('Score Actions, verify that the Entitly Label Conflict modal pops up and that we can change our labeling', () => {
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndChangeToAttempted(undefined, [{ text: 'Two', entity: 'anEntity' }])
    })

    it('Select the only Bot response', () => {
      train.SelectTextAction('The only response')
    })

    it('Save the Train Dialog and verify that it is in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })

    it('Edit one of the trainings affected by conflict resolution and verify there is a warning', () => {
      modelPage.VerifyWarningTriangleForTrainDialogs()
      train.EditTraining('Phrase used only once.', 'We use this phrase three times.', 'The only response')
      train.VerifyWarningMessage('Entity or Action changes require replay of the TrainDialog')
    })

    it('Verify that the affected turn is now Entity labeled', () => {
      train.SelectChatTurnExactMatch('Two instances of this phrase there are.')
      train.VerifyEntityLabel('Two', 'anEntity')
    })

    it('Click Replay button and verify it clears the warning for this Train Dialog', () => {
      train.ClickReplayButton()
      train.VerifyNoWarningMessage()
    })

    it('Save the changes', () => {
      train.SaveAsIs()
    })

    it('Edit the other training affected by conflict resolution and verify there is a warning', () => {
      modelPage.VerifyWarningTriangleForTrainDialogs()
      train.EditTraining('Two instances of this phrase there are.', 'We use this phrase three times.', '')
      train.VerifyWarningMessage('Entity or Action changes require replay of the TrainDialog')
    })

    it('Verify that the affected turn is now Entity labeled', () => {
      train.SelectChatTurnExactMatch('Two instances of this phrase there are.')
      train.VerifyEntityLabel('Two', 'anEntity')
    })

    it('Click Replay button and verify it clears the warning for this Train Dialog', () => {
      train.ClickReplayButton()
      train.VerifyNoWarningMessage()
    })

    it('Save the changes', () => {
      train.SaveAsIs()
    })

    // TODO: Still need to verify that the TD Grid has no warnings
    //       Also need to verify the warning count, since there should be 2 of them.
   })
})