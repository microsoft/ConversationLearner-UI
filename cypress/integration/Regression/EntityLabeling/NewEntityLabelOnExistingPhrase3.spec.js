/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as models from '../../../support/Models'
import * as modelPage from '../../../support/components/ModelPage'
import * as train from '../../../support/Train'
import * as helpers from '../../../support/Helpers'

describe('New Entity Label on Existing Phrase 2 - Entity Labeling', () => {
  afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)

  context('Setup', () => {
    it('Import a model and wait for training to complete', () => {
      models.ImportModel('z-newEntityLabel3', 'z-newEntityLabelX.cl')
      modelPage.NavigateToTrainDialogs()
      cy.WaitForTrainingStatusCompleted()
    })
  })

  context('Change MANY instances of the Phrase', () => {
    it('Create a new Train Dialog and add a description for unique identification', () => {
      train.CreateNewTrainDialog()
      train.TypeDescription('Test Generated 3')
    })

    it('User utters another existing phrase and labels an entity', () => {
      train.TypeYourMessage("Pearls of wisdom are useless unless diligently applied to one's own life.")
      train.LabelTextAsEntity('wisdom', 'anEntity')
    })

    it('Score Actions, verify that the Entitly Label Conflict modal pops up and that we can change our labeling', () => {
      train.ClickScoreActionsButton()
      train.VerifyEntityLabelConflictPopupAndChangeToAttempted(undefined, [{ text: 'wisdom', entity: 'anEntity' }])
    })

    it('Select the only Bot response', () => {
      train.SelectTextAction('The only response')
    })

    it('Save the Train Dialog and verify that it is in the grid', () => {
      train.SaveAsIsVerifyInGrid()
    })
  })

  for (let iTD = 0; iTD < 33; iTD++) {
    context(`${iTD} - Verify the change in an instances of the Phrase`, () => {
      it('Edit one of the trainings affected by conflict resolution and verify there is a warning', () => {
        modelPage.VerifyWarningTriangleForTrainDialogs()
        train.EditTrainingByDescriptionAndOrTags(`Train Dialog ${iTD}`)
        train.VerifyWarningMessage('Entity or Action changes require replay of the TrainDialog')
      })

      it('Verify that the affected turn is now Entity labeled', () => {
        train.SelectChatTurnExactMatch("Pearls of wisdom are useless unless diligently applied to one's own life.")
        train.VerifyEntityLabel('wisdom', 'anEntity')
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
  }
})